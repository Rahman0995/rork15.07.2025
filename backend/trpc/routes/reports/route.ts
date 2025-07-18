import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockReports, mockReportComments } from '@/constants/mockData';
import { Report, ReportComment, ReportStatus } from '@/types';

type ReportsInput = {
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_revision';
  unit?: string;
  authorId?: string;
};

type ReportByIdInput = {
  id: string;
};

type CreateReportInput = {
  title: string;
  content: string;
  authorId: string;
  unit?: string;
  priority?: 'low' | 'medium' | 'high';
  type?: 'text' | 'file' | 'video';
};

type UpdateReportInput = {
  id: string;
  title?: string;
  content?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_revision';
  priority?: 'low' | 'medium' | 'high';
};

type DeleteReportInput = {
  id: string;
};

type AddCommentInput = {
  reportId: string;
  authorId: string;
  content: string;
  isRevision?: boolean;
};

type ApproveReportInput = {
  id: string;
  approverId: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  comment?: string;
};

type ReportsForApprovalInput = {
  approverId: string;
};

export const getReportsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    unit: z.string().optional(),
    authorId: z.string().optional(),
  }).optional())
  .query(({ input }: { input?: ReportsInput | undefined }) => {
    let reports = [...mockReports];
    
    if (input?.status) {
      reports = reports.filter((r: Report) => r.status === input.status);
    }
    
    if (input?.unit) {
      reports = reports.filter((r: Report) => r.unit === input.unit);
    }
    
    if (input?.authorId) {
      reports = reports.filter((r: Report) => r.authorId === input.authorId);
    }
    
    return reports;
  });

export const getReportByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(({ input }: { input: ReportByIdInput }) => {
    const report = mockReports.find((r: Report) => r.id === input.id);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  });

export const createReportProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    content: z.string(),
    authorId: z.string(),
    unit: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    type: z.enum(['text', 'file', 'video']).optional(),
  }))
  .mutation(({ input }: { input: CreateReportInput }) => {
    const newReport: Report = {
      id: String(mockReports.length + 1),
      title: input.title,
      content: input.content,
      authorId: input.authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      type: input.type || 'text',
      unit: input.unit,
      priority: input.priority || 'medium',
      attachments: [],
      approvers: [],
      approvals: [],
      comments: [],
      revisions: [],
      currentRevision: 1,
    };
    
    mockReports.push(newReport);
    return { success: true, report: newReport };
  });

export const updateReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }))
  .mutation(({ input }: { input: UpdateReportInput }) => {
    const reportIndex = mockReports.findIndex((r: Report) => r.id === input.id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const report = mockReports[reportIndex];
    const updatedReport = {
      ...report,
      ...(input.title && { title: input.title }),
      ...(input.content && { content: input.content }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      updatedAt: new Date().toISOString(),
    };
    
    mockReports[reportIndex] = updatedReport;
    return { success: true, report: updatedReport };
  });

export const deleteReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(({ input }: { input: DeleteReportInput }) => {
    const reportIndex = mockReports.findIndex((r: Report) => r.id === input.id);
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
    content: z.string(),
    isRevision: z.boolean().optional(),
  }))
  .mutation(({ input }: { input: AddCommentInput }) => {
    const report = mockReports.find((r: Report) => r.id === input.reportId);
    if (!report) {
      throw new Error('Report not found');
    }
    
    const newComment: ReportComment = {
      id: String(Date.now()),
      reportId: input.reportId,
      authorId: input.authorId,
      content: input.content,
      createdAt: new Date().toISOString(),
      isRevision: input.isRevision || false,
    };
    
    if (!report.comments) {
      report.comments = [];
    }
    report.comments.push(newComment);
    
    return { success: true, comment: newComment };
  });

export const approveReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    approverId: z.string(),
    status: z.enum(['approved', 'rejected', 'needs_revision']),
    comment: z.string().optional(),
  }))
  .mutation(({ input }: { input: ApproveReportInput }) => {
    const report = mockReports.find((r: Report) => r.id === input.id);
    if (!report) {
      throw new Error('Report not found');
    }
    
    const approval = {
      id: String(Date.now()),
      reportId: input.id,
      approverId: input.approverId,
      status: input.status,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    };
    
    if (!report.approvals) {
      report.approvals = [];
    }
    report.approvals.push(approval);
    report.status = input.status;
    report.updatedAt = new Date().toISOString();
    
    return { success: true, approval };
  });

export const getReportsForApprovalProcedure = publicProcedure
  .input(z.object({
    approverId: z.string(),
  }))
  .query(({ input }: { input: ReportsForApprovalInput }) => {
    return mockReports.filter((r: Report) => 
      r.status === 'pending' && 
      r.approvers?.includes(input.approverId)
    );
  });