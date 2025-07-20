import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { database } from '../../../../lib/supabase';

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
    status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
    unit: z.string().optional(),
    authorId: z.string().optional(),
  }).optional())
  .query(async ({ input }: { input?: ReportsInput | undefined }) => {
    try {
      console.log('Fetching reports with filters:', input);
      
      let query = database.reports.getAll();
      
      if (input?.authorId) {
        query = database.reports.getByAuthor(input.authorId);
      }
      
      const { data: reports, error } = await query;
      
      if (error) {
        console.error('Error fetching reports:', error);
        return [];
      }
      
      // Apply additional filters
      let filteredReports = reports || [];
      
      if (input?.status) {
        filteredReports = filteredReports.filter(report => report.status === input.status);
      }
      
      return filteredReports;
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
      
      const { data: report, error } = await database.reports.getById(input.id);
      
      if (error) {
        throw new Error(error.message || 'Report not found');
      }
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      return report;
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
    type: z.enum(['general', 'incident', 'training', 'equipment', 'personnel']).optional(),
  }))
  .mutation(async ({ input }: { input: CreateReportInput }) => {
    try {
      console.log('Creating report:', input);
      
      const { data: report, error } = await database.reports.create({
        title: input.title,
        content: input.content,
        created_by: input.authorId,
        type: input.type || 'general',
        status: 'draft',
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create report');
      }
      
      return { success: true, report };
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
    status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
  }))
  .mutation(async ({ input }: { input: UpdateReportInput }) => {
    try {
      console.log('Updating report:', input);
      
      if (!input.title && !input.content && !input.status) {
        throw new Error('No fields to update');
      }
      
      const updates: any = {};
      if (input.title) updates.title = input.title;
      if (input.content) updates.content = input.content;
      if (input.status) updates.status = input.status;
      
      const { data: report, error } = await database.reports.update(input.id, updates);
      
      if (error) {
        throw new Error(error.message || 'Failed to update report');
      }
      
      return { success: true, report };
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
      
      const { error } = await database.reports.delete(input.id);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete report');
      }
      
      return { success: true };
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