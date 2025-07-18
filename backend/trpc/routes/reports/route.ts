import { z } from 'zod';
import { publicProcedure } from '../../create-context';
// import { getDatabase, schema } from '../../database';
// import { eq, and, desc, asc } from 'drizzle-orm';
// import { activityLoggers } from '../../middleware/activity-logger';
import { Report, ReportComment, ReportStatus } from '../../../../types';

type ReportType = 'text' | 'file' | 'video';

// Mock data for reports
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Weekly Status Report',
    content: 'All systems operational. Equipment check completed successfully.',
    authorId: '1',
    status: 'approved',
    type: 'text',
    unit: 'Alpha Squad',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    currentApprover: null,
    currentRevision: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Equipment Maintenance Report',
    content: 'Routine maintenance completed on all vehicles. Minor repairs needed on Unit 3.',
    authorId: '2',
    status: 'pending',
    type: 'text',
    unit: 'Bravo Squad',
    priority: 'high',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    currentApprover: '3',
    currentRevision: 1,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Helper functions to work with database (disabled for now)
// const getReportWithRelations = async (reportId: string) => {
//   const db = getDatabase();
//   
//   const report = await db.select().from(schema.reports).where(eq(schema.reports.id, reportId)).get();
//   if (!report) return null;
//   
//   const comments = await db.select().from(schema.reportComments).where(eq(schema.reportComments.reportId, reportId));
//   const approvals = await db.select().from(schema.reportApprovals).where(eq(schema.reportApprovals.reportId, reportId));
//   const attachments = await db.select().from(schema.attachments).where(
//     and(eq(schema.attachments.entityType, 'report'), eq(schema.attachments.entityId, reportId))
//   );
//   
//   return {
//     ...report,
//     comments,
//     approvals,
//     attachments
//   };
// };

export const getReportsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    authorId: z.string().optional(),
    unit: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(async ({ input }) => {
    try {
      // Try database first (if available)
      // const db = getDatabase();
      // ... database logic would go here
      
      // For now, always use mock data for reliability
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
    } catch (error) {
      console.error('Error in getReportsProcedure:', error);
      // Return mock data as fallback
      return {
        reports: mockReports,
        total: mockReports.length,
      };
    }
  });

export const getReportByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .use(activityLoggers.viewReport)
  .query(async ({ input }) => {
    const report = await getReportWithRelations(input.id);
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
    attachments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['file', 'image', 'video']),
      url: z.string(),
    })).optional().default([]),
  }))
  .use(activityLoggers.createReport)
  .mutation(async ({ input }) => {
    const db = getDatabase();
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert report
    const newReport = {
      id: reportId,
      title: input.title,
      content: input.content,
      authorId: input.authorId,
      status: 'draft' as const,
      type: input.type || 'text',
      unit: input.unit || null,
      priority: input.priority || 'medium',
      dueDate: input.dueDate || null,
      currentApprover: null,
      currentRevision: 1,
    };
    
    await db.insert(schema.reports).values(newReport);
    
    // Insert attachments if any
    if (input.attachments && input.attachments.length > 0) {
      const attachmentValues = input.attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        url: att.url,
        entityType: 'report' as const,
        entityId: reportId,
      }));
      
      await db.insert(schema.attachments).values(attachmentValues);
    }
    
    return await getReportWithRelations(reportId);
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
  .use(activityLoggers.updateReport)
  .mutation(async ({ input }) => {
    const db = getDatabase();
    
    // Check if report exists
    const existingReport = await db.select().from(schema.reports).where(eq(schema.reports.id, input.id)).get();
    if (!existingReport) {
      throw new Error('Report not found');
    }
    
    // Update report
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
    
    if (Object.keys(updateData).length > 0) {
      await db.update(schema.reports).set(updateData).where(eq(schema.reports.id, input.id));
    }
    
    // Update attachments if provided
    if (input.attachments) {
      // Delete existing attachments
      await db.delete(schema.attachments).where(
        and(eq(schema.attachments.entityType, 'report'), eq(schema.attachments.entityId, input.id))
      );
      
      // Insert new attachments
      if (input.attachments.length > 0) {
        const attachmentValues = input.attachments.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type,
          url: att.url,
          entityType: 'report' as const,
          entityId: input.id,
        }));
        
        await db.insert(schema.attachments).values(attachmentValues);
      }
    }
    
    return await getReportWithRelations(input.id);
  });

export const deleteReportProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .use(activityLoggers.deleteReport)
  .mutation(async ({ input }) => {
    const db = getDatabase();
    
    // Get report before deletion
    const reportToDelete = await getReportWithRelations(input.id);
    if (!reportToDelete) {
      throw new Error('Report not found');
    }
    
    // Delete related data first (foreign key constraints)
    await db.delete(schema.attachments).where(
      and(eq(schema.attachments.entityType, 'report'), eq(schema.attachments.entityId, input.id))
    );
    await db.delete(schema.reportComments).where(eq(schema.reportComments.reportId, input.id));
    await db.delete(schema.reportApprovals).where(eq(schema.reportApprovals.reportId, input.id));
    await db.delete(schema.reportRevisions).where(eq(schema.reportRevisions.reportId, input.id));
    
    // Delete the report
    await db.delete(schema.reports).where(eq(schema.reports.id, input.id));
    
    return { success: true, deletedReport: reportToDelete };
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
  .use(activityLoggers.create('comment'))
  .mutation(async ({ input }) => {
    const db = getDatabase();
    
    // Check if report exists
    const report = await db.select().from(schema.reports).where(eq(schema.reports.id, input.reportId)).get();
    if (!report) {
      throw new Error('Report not found');
    }
    
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert comment
    const newComment = {
      id: commentId,
      reportId: input.reportId,
      authorId: input.authorId,
      content: input.content,
      isRevision: input.isRevision || false,
    };
    
    await db.insert(schema.reportComments).values(newComment);
    
    // Insert attachments if any
    if (input.attachments && input.attachments.length > 0) {
      const attachmentValues = input.attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        url: att.url,
        entityType: 'comment' as const,
        entityId: commentId,
      }));
      
      await db.insert(schema.attachments).values(attachmentValues);
    }
    
    // Update report's updatedAt
    await db.update(schema.reports).set({ 
      updatedAt: new Date().toISOString() 
    }).where(eq(schema.reports.id, input.reportId));
    
    return newComment;
  });

export const approveReportProcedure = publicProcedure
  .input(z.object({
    reportId: z.string(),
    approverId: z.string(),
    status: z.enum(['approved', 'rejected', 'needs_revision']),
    comment: z.string().optional(),
  }))
  .use(activityLoggers.approveReport)
  .mutation(async ({ input }) => {
    const db = getDatabase();
    
    // Check if report exists
    const report = await db.select().from(schema.reports).where(eq(schema.reports.id, input.reportId)).get();
    if (!report) {
      throw new Error('Report not found');
    }
    
    const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert approval
    const newApproval = {
      id: approvalId,
      reportId: input.reportId,
      approverId: input.approverId,
      status: input.status,
      comment: input.comment || null,
    };
    
    await db.insert(schema.reportApprovals).values(newApproval);
    
    // Update report status
    await db.update(schema.reports).set({ 
      status: input.status,
      updatedAt: new Date().toISOString()
    }).where(eq(schema.reports.id, input.reportId));
    
    return newApproval;
  });

export const getReportsForApprovalProcedure = publicProcedure
  .input(z.object({ approverId: z.string() }))
  .query(async ({ input }) => {
    try {
      // For now, return all pending reports since we don't have approvers field implemented yet
      // In a real implementation, you would have a separate approvers table or field
      const reports = mockReports
        .filter(report => report.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return reports;
    } catch (error) {
      console.error('Error in getReportsForApprovalProcedure:', error);
      // Return empty array as fallback
      return [];
    }
  });