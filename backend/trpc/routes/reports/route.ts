import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { Report, ReportStatus } from '@/types';

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

export const getAllProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    unit: z.string().optional(),
    authorId: z.string().optional(),
  }).optional())
  .query(async ({ input }: { input?: ReportsInput | undefined }) => {
    try {
      console.log('Fetching reports with filters:', input);
      const mockReports: Report[] = [
        {
          id: 'report-1',
          title: 'Отчет о проведении учений',
          content: 'Проведены плановые учения по тактической подготовке.',
          authorId: 'user-1',
          status: 'pending',
          type: 'text',
          unit: '1-й батальон',
          priority: 'high',
          currentRevision: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          approvals: [],
          comments: [],
          revisions: [],
          approvers: ['user-2'],
        },
        {
          id: 'report-2',
          title: 'Отчет о техническом обслуживании',
          content: 'Выполнено плановое техническое обслуживание оборудования.',
          authorId: 'user-2',
          status: 'approved',
          type: 'maintenance',
          unit: 'Техническая служба',
          priority: 'medium',
          currentRevision: 1,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          approvals: [],
          comments: [],
          revisions: [],
          approvers: ['user-1'],
        },
      ];
      
      let reports = [...mockReports];
      
      if (input?.status) {
        reports = reports.filter((r) => r.status === input.status);
      }
      
      if (input?.unit) {
        reports = reports.filter((r) => r.unit === input.unit);
      }
      
      if (input?.authorId) {
        reports = reports.filter((r) => r.authorId === input.authorId);
      }
      
      return reports;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  });

export const getByIdProcedure = publicProcedure
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
      const connection = getConnection();
      
      const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await connection.execute(
        'INSERT INTO reports (id, title, content, author_id, status, type, unit, priority, current_revision) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          reportId,
          input.title,
          input.content,
          input.authorId,
          'draft',
          input.type || 'text',
          input.unit,
          input.priority || 'medium',
          1,
        ]
      );
      
      // Fetch the created report
      const [rows] = await connection.execute(
        'SELECT * FROM reports WHERE id = ?',
        [reportId]
      );
      
      const reports = rows as Report[];
      return { success: true, report: reports[0] };
    } catch (error) {
      console.error('Error creating report:', error);
      
      if (config.development.mockData) {
        const newReport = {
          id: `report-${Date.now()}`,
          title: input.title,
          content: input.content,
          author_id: input.authorId,
          status: 'draft',
          type: input.type || 'text',
          unit: input.unit,
          priority: input.priority || 'medium',
          current_revision: 1,
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        return { success: true, report: newReport };
      }
      
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
      const connection = getConnection();
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (input.title) {
        updateFields.push('title = ?');
        updateValues.push(input.title);
      }
      if (input.content) {
        updateFields.push('content = ?');
        updateValues.push(input.content);
      }
      if (input.status) {
        updateFields.push('status = ?');
        updateValues.push(input.status);
      }
      if (input.priority) {
        updateFields.push('priority = ?');
        updateValues.push(input.priority);
      }
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(input.id);
      
      const query = `UPDATE reports SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.execute(query, updateValues);
      
      // Fetch and return updated report
      const [rows] = await connection.execute(
        'SELECT * FROM reports WHERE id = ?',
        [input.id]
      );
      
      const reports = rows as Report[];
      if (reports.length === 0) {
        throw new Error('Report not found after update');
      }
      
      return { success: true, report: reports[0] };
    } catch (error) {
      console.error('Error updating report:', error);
      
      if (config.development.mockData) {
        const updatedReport = {
          id: input.id,
          title: input.title || 'Mock Report',
          content: input.content || 'Mock content',
          author_id: 'user-1',
          status: input.status || 'draft',
          type: 'text',
          unit: 'Mock Unit',
          priority: input.priority || 'medium',
          current_revision: 1,
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        return { success: true, report: updatedReport };
      }
      
      throw new Error('Failed to update report');
    }
  });

export const deleteReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }: { input: DeleteReportInput }) => {
    try {
      const connection = getConnection();
      
      // First fetch the report to return it
      const [rows] = await connection.execute(
        'SELECT * FROM reports WHERE id = ?',
        [input.id]
      );
      
      const reports = rows as Report[];
      if (reports.length === 0) {
        throw new Error('Report not found');
      }
      
      const deletedReport = reports[0];
      
      // Delete related data first (comments, approvals, etc.)
      await connection.execute('DELETE FROM report_comments WHERE report_id = ?', [input.id]);
      await connection.execute('DELETE FROM report_approvals WHERE report_id = ?', [input.id]);
      await connection.execute('DELETE FROM report_revisions WHERE report_id = ?', [input.id]);
      
      // Delete the report
      await connection.execute('DELETE FROM reports WHERE id = ?', [input.id]);
      
      return { success: true, deletedReport };
    } catch (error) {
      console.error('Error deleting report:', error);
      
      if (config.development.mockData) {
        return {
          success: true,
          deletedReport: {
            id: input.id,
            title: 'Deleted Mock Report',
            content: 'This report was deleted',
            author_id: 'user-1',
            status: 'draft',
            type: 'text',
            unit: 'Mock Unit',
            priority: 'medium',
            current_revision: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
        };
      }
      
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
      const connection = getConnection();
      
      // Check if report exists
      const [reportRows] = await connection.execute(
        'SELECT id FROM reports WHERE id = ?',
        [input.reportId]
      );
      
      if ((reportRows as any[]).length === 0) {
        throw new Error('Report not found');
      }
      
      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await connection.execute(
        'INSERT INTO report_comments (id, report_id, author_id, content, is_revision) VALUES (?, ?, ?, ?, ?)',
        [
          commentId,
          input.reportId,
          input.authorId,
          input.content,
          input.isRevision || false,
        ]
      );
      
      // Fetch the created comment
      const [rows] = await connection.execute(
        'SELECT * FROM report_comments WHERE id = ?',
        [commentId]
      );
      
      const comments = rows as any[];
      return { success: true, comment: comments[0] };
    } catch (error) {
      console.error('Error adding report comment:', error);
      
      if (config.development.mockData) {
        const newComment = {
          id: `comment-${Date.now()}`,
          report_id: input.reportId,
          author_id: input.authorId,
          content: input.content,
          is_revision: input.isRevision || false,
          created_at: new Date(),
        };
        
        return { success: true, comment: newComment };
      }
      
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
      const connection = getConnection();
      
      // Check if report exists
      const [reportRows] = await connection.execute(
        'SELECT id FROM reports WHERE id = ?',
        [input.id]
      );
      
      if ((reportRows as any[]).length === 0) {
        throw new Error('Report not found');
      }
      
      const approvalId = `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert approval record
      await connection.execute(
        'INSERT INTO report_approvals (id, report_id, approver_id, status, comment) VALUES (?, ?, ?, ?, ?)',
        [
          approvalId,
          input.id,
          input.approverId,
          input.status,
          input.comment,
        ]
      );
      
      // Update report status
      await connection.execute(
        'UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [input.status, input.id]
      );
      
      // Fetch the created approval
      const [rows] = await connection.execute(
        'SELECT * FROM report_approvals WHERE id = ?',
        [approvalId]
      );
      
      const approvals = rows as any[];
      return { success: true, approval: approvals[0] };
    } catch (error) {
      console.error('Error approving report:', error);
      
      if (config.development.mockData) {
        const approval = {
          id: `approval-${Date.now()}`,
          report_id: input.id,
          approver_id: input.approverId,
          status: input.status,
          comment: input.comment,
          created_at: new Date(),
        };
        
        return { success: true, approval };
      }
      
      throw new Error('Failed to approve report');
    }
  });

export const getReportsForApprovalProcedure = publicProcedure
  .input(z.object({
    approverId: z.string(),
  }))
  .query(async ({ input }: { input: ReportsForApprovalInput }) => {
    try {
      const connection = getConnection();
      
      // For now, return all pending reports
      // In a real app, you'd have a proper approval workflow
      const [rows] = await connection.execute(
        'SELECT * FROM reports WHERE status = ? ORDER BY created_at DESC',
        ['pending']
      );
      
      return rows as Report[];
    } catch (error) {
      console.error('Error fetching reports for approval:', error);
      
      if (config.development.mockData) {
        return [
          {
            id: 'report-pending-1',
            title: 'Отчет на согласование',
            content: 'Отчет ожидает согласования.',
            author_id: 'user-2',
            status: 'pending',
            type: 'text',
            unit: '1-я рота',
            priority: 'medium',
            current_revision: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];
      }
      
      throw new Error('Failed to fetch reports for approval');
    }
  });