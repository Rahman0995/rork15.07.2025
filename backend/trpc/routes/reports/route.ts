import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { Report, ReportStatus, ReportType } from '@/types';
import { getConnection } from '../../../database/index';

type ReportsInput = {
  status?: ReportStatus;
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
  status?: ReportStatus;
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
  .query(async ({ input }: { input?: ReportsInput | undefined }) => {
    try {
      console.log('Fetching reports with filters:', input);
      const connection = getConnection();
      
      let query = 'SELECT * FROM reports WHERE 1=1';
      const params: any[] = [];
      
      if (input?.status) {
        query += ' AND status = ?';
        params.push(input.status);
      }
      
      if (input?.unit) {
        query += ' AND unit = ?';
        params.push(input.unit);
      }
      
      if (input?.authorId) {
        query += ' AND author_id = ?';
        params.push(input.authorId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await connection.execute(query, params);
      const reports = (rows as any[]).map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        authorId: row.author_id,
        status: row.status,
        type: row.type,
        unit: row.unit,
        priority: row.priority,
        dueDate: row.due_date,
        currentApprover: row.current_approver,
        currentRevision: row.current_revision,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        approvals: [],
        comments: [],
        revisions: [],
        approvers: [],
      }));
      
      return reports;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  });

export const getReportByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ input }: { input: ReportByIdInput }) => {
    try {
      console.log('Fetching report by ID:', input.id);
      
      const mockReport: Report = {
        id: input.id,
        title: 'Mock Report',
        content: 'This is a mock report for development.',
        authorId: 'user-1',
        status: 'draft',
        type: 'text',
        unit: 'Mock Unit',
        priority: 'medium',
        currentRevision: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvals: [],
        comments: [],
        revisions: [],
        approvers: ['user-2'],
      };
      
      return mockReport;
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      throw new Error('Report not found');
    }
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
  .mutation(async ({ input }: { input: CreateReportInput }) => {
    try {
      console.log('Creating report:', input);
      
      const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newReport: Report = {
        id: reportId,
        title: input.title,
        content: input.content,
        authorId: input.authorId,
        status: 'draft',
        type: (input.type || 'text') as ReportType,
        unit: input.unit || 'Default Unit',
        priority: input.priority || 'medium',
        currentRevision: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvals: [],
        comments: [],
        revisions: [],
        approvers: [],
      };
      
      return { success: true, report: newReport };
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error('Failed to create report');
    }
  });

export const updateReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }))
  .mutation(async ({ input }: { input: UpdateReportInput }) => {
    try {
      console.log('Updating report:', input);
      
      if (!input.title && !input.content && !input.status && !input.priority) {
        throw new Error('No fields to update');
      }
      
      const updatedReport: Report = {
        id: input.id,
        title: input.title || 'Mock Report',
        content: input.content || 'Mock content',
        authorId: 'user-1',
        status: input.status || 'draft',
        type: 'text',
        unit: 'Mock Unit',
        priority: input.priority || 'medium',
        currentRevision: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvals: [],
        comments: [],
        revisions: [],
        approvers: [],
      };
      
      return { success: true, report: updatedReport };
    } catch (error) {
      console.error('Error updating report:', error);
      throw new Error('Failed to update report');
    }
  });

export const deleteReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }: { input: DeleteReportInput }) => {
    try {
      console.log('Deleting report:', input.id);
      
      const deletedReport: Report = {
        id: input.id,
        title: 'Deleted Mock Report',
        content: 'This report was deleted',
        authorId: 'user-1',
        status: 'draft',
        type: 'text',
        unit: 'Mock Unit',
        priority: 'medium',
        currentRevision: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvals: [],
        comments: [],
        revisions: [],
        approvers: [],
      };
      
      return { success: true, deletedReport };
    } catch (error) {
      console.error('Error deleting report:', error);
      throw new Error('Failed to delete report');
    }
  });

export const addReportCommentProcedure = publicProcedure
  .input(z.object({
    reportId: z.string(),
    authorId: z.string(),
    content: z.string(),
    isRevision: z.boolean().optional(),
  }))
  .mutation(async ({ input }: { input: AddCommentInput }) => {
    try {
      console.log('Adding comment to report:', input.reportId);
      
      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newComment = {
        id: commentId,
        reportId: input.reportId,
        authorId: input.authorId,
        content: input.content,
        isRevision: input.isRevision || false,
        createdAt: new Date().toISOString(),
      };
      
      return { success: true, comment: newComment };
    } catch (error) {
      console.error('Error adding report comment:', error);
      throw new Error('Failed to add comment');
    }
  });

export const approveReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    approverId: z.string(),
    status: z.enum(['approved', 'rejected', 'needs_revision']),
    comment: z.string().optional(),
  }))
  .mutation(async ({ input }: { input: ApproveReportInput }) => {
    try {
      console.log('Approving report:', input.id);
      
      const approvalId = `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const approval = {
        id: approvalId,
        reportId: input.id,
        approverId: input.approverId,
        status: input.status,
        comment: input.comment,
        createdAt: new Date().toISOString(),
      };
      
      return { success: true, approval };
    } catch (error) {
      console.error('Error approving report:', error);
      throw new Error('Failed to approve report');
    }
  });

export const getReportsForApprovalProcedure = publicProcedure
  .input(z.object({
    approverId: z.string(),
  }))
  .query(async ({ input }: { input: ReportsForApprovalInput }) => {
    try {
      console.log('Fetching reports for approval:', input.approverId);
      
      const mockReports: Report[] = [
        {
          id: 'report-pending-1',
          title: 'Отчет на согласование',
          content: 'Отчет ожидает согласования.',
          authorId: 'user-2',
          status: 'pending',
          type: 'text',
          unit: '1-я рота',
          priority: 'medium',
          currentRevision: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          approvals: [],
          comments: [],
          revisions: [],
          approvers: [input.approverId],
        },
      ];
      
      return mockReports;
    } catch (error) {
      console.error('Error fetching reports for approval:', error);
      throw new Error('Failed to fetch reports for approval');
    }
  });