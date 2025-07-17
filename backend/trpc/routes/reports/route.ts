import { z } from 'zod';
import { publicProcedure } from '../create-context';
// Mock data for reports - defined locally to avoid import issues
type ReportStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_revision';
type ReportType = 'text' | 'file' | 'video';

interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'video';
  url: string;
}

interface ReportComment {
  id: string;
  reportId: string;
  authorId: string;
  content: string;
  createdAt: string;
  isRevision: boolean;
  attachments?: Attachment[];
}

interface ReportApproval {
  id: string;
  reportId: string;
  approverId: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  comment?: string;
  createdAt: string;
}

interface Report {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  type?: ReportType;
  attachments?: Attachment[];
  unit?: string;
  priority?: 'low' | 'medium' | 'high';
  approvers?: string[];
  currentApprover?: string;
  approvals?: ReportApproval[];
  comments?: ReportComment[];
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Security Report',
    content: 'All security systems are functioning normally',
    authorId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'approved',
    type: 'text',
    unit: 'Security',
    priority: 'high',
    approvers: ['2'],
    currentApprover: '2',
    approvals: [],
    comments: [],
  },
  {
    id: '2',
    title: 'Weekly Report',
    content: 'Summary of weekly activities',
    authorId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    type: 'text',
    unit: 'Operations',
    priority: 'medium',
    approvers: ['2'],
    currentApprover: '2',
    approvals: [],
    comments: [],
  },
];

const getReport = (id: string): Report | undefined => {
  return mockReports.find(report => report.id === id);
};

const getUserReports = (userId: string): Report[] => {
  return mockReports.filter(report => report.authorId === userId);
};

const getUnitReports = (unit: string): Report[] => {
  return mockReports.filter(report => report.unit === unit);
};

export const getReportsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    authorId: z.string().optional(),
    unit: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(({ input }: { input?: { status?: ReportStatus; authorId?: string; unit?: string; limit?: number; offset?: number } }) => {
    let reports = [...mockReports];
    
    if (input?.status) {
      reports = reports.filter(report => report.status === input.status);
    }
    
    if (input?.authorId) {
      reports = reports.filter(report => report.authorId === input.authorId);
    }
    
    if (input?.unit) {
      reports = reports.filter(report => report.unit === input.unit);
    }
    
    // Sort by creation date (newest first)
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (input?.offset || input?.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 10;
      reports = reports.slice(offset, offset + limit);
    }
    
    return {
      reports,
      total: mockReports.length,
    };
  });

export const getReportByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }: { input: { id: string } }) => {
    const report = getReport(input.id);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  });

export const createReportProcedure = publicProcedure
  .input(z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    authorId: z.string(),
    type: z.enum(['text', 'file', 'video']).optional().default('text'),
    unit: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    dueDate: z.string().optional(),
    approvers: z.array(z.string()).optional().default([]),
    attachments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['file', 'image', 'video']),
      url: z.string(),
    })).optional().default([]),
  }))
  .mutation(({ input }: { input: { title: string; content: string; authorId: string; type?: ReportType; unit?: string; priority?: 'low' | 'medium' | 'high'; dueDate?: string; approvers?: string[]; attachments?: Attachment[] } }) => {
    const reportId = `report_${Date.now()}`;
    const newReport: Report = {
      id: reportId,
      title: input.title,
      content: input.content,
      authorId: input.authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      type: input.type || 'text',
      attachments: input.attachments || [],
      unit: input.unit || '',
      priority: input.priority || 'medium',

      approvers: input.approvers || [],
      currentApprover: input.approvers?.[0],
      approvals: [],
      comments: [],
    };
    
    mockReports.push(newReport);
    return newReport;
  });

export const updateReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().optional(),
    attachments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['file', 'image', 'video']),
      url: z.string(),
    })).optional(),
  }))
  .mutation(({ input }: { input: any }) => {
    const reportIndex = mockReports.findIndex(report => report.id === input.id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const currentReport = mockReports[reportIndex];
    const updatedReport = {
      ...currentReport,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    

    
    mockReports[reportIndex] = updatedReport;
    return updatedReport;
  });

export const deleteReportProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }: { input: any }) => {
    const reportIndex = mockReports.findIndex(report => report.id === input.id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const deletedReport = mockReports.splice(reportIndex, 1)[0];
    return { success: true, deletedReport };
  });

export const addReportCommentProcedure = publicProcedure
  .input(z.object({
    reportId: z.string(),
    authorId: z.string(),
    content: z.string().min(1),
    isRevision: z.boolean().optional().default(false),
    attachments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['file', 'image', 'video']),
      url: z.string(),
    })).optional(),
  }))
  .mutation(({ input }: { input: any }) => {
    const reportIndex = mockReports.findIndex(report => report.id === input.reportId);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const newComment: ReportComment = {
      id: `comment_${Date.now()}`,
      reportId: input.reportId,
      authorId: input.authorId,
      content: input.content,
      createdAt: new Date().toISOString(),
      isRevision: input.isRevision || false,
      attachments: input.attachments,
    };
    
    const report = mockReports[reportIndex];
    report.comments = [...(report.comments || []), newComment];
    report.updatedAt = new Date().toISOString();
    
    return newComment;
  });

export const approveReportProcedure = publicProcedure
  .input(z.object({
    reportId: z.string(),
    approverId: z.string(),
    status: z.enum(['approved', 'rejected', 'needs_revision']),
    comment: z.string().optional(),
  }))
  .mutation(({ input }: { input: any }) => {
    const reportIndex = mockReports.findIndex(report => report.id === input.reportId);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const newApproval: ReportApproval = {
      id: `approval_${Date.now()}`,
      reportId: input.reportId,
      approverId: input.approverId,
      status: input.status,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    };
    
    const report = mockReports[reportIndex];
    report.approvals = [...(report.approvals || []), newApproval];
    report.status = input.status;
    report.updatedAt = new Date().toISOString();
    
    return newApproval;
  });

export const getReportsForApprovalProcedure = publicProcedure
  .input(z.object({ approverId: z.string() }))
  .query(({ input }) => {
    return mockReports.filter(report => 
      report.status === 'pending' && 
      report.approvers?.includes(input.approverId) &&
      report.currentApprover === input.approverId
    );
  });