import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { getDatabase, schema } from '../../database';
import { eq, and, desc, asc } from 'drizzle-orm';
import { activityLoggers } from '../../middleware/activity-logger';

type ReportStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_revision';
type ReportType = 'text' | 'file' | 'video';

// Helper functions to work with database
const getReportWithRelations = async (reportId: string) => {
  const db = getDatabase();
  
  const report = await db.select().from(schema.reports).where(eq(schema.reports.id, reportId)).get();
  if (!report) return null;
  
  const comments = await db.select().from(schema.reportComments).where(eq(schema.reportComments.reportId, reportId));
  const approvals = await db.select().from(schema.reportApprovals).where(eq(schema.reportApprovals.reportId, reportId));
  const attachments = await db.select().from(schema.attachments).where(
    and(eq(schema.attachments.entityType, 'report'), eq(schema.attachments.entityId, reportId))
  );
  
  return {
    ...report,
    comments,
    approvals,
    attachments
  };
};

export const getReportsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'needs_revision']).optional(),
    authorId: z.string().optional(),
    unit: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .use(activityLoggers.view('reports'))
  .query(async ({ input }) => {
    const db = getDatabase();
    
    let query = db.select().from(schema.reports);
    const conditions = [];
    
    if (input?.status) {
      conditions.push(eq(schema.reports.status, input.status));
    }
    
    if (input?.authorId) {
      conditions.push(eq(schema.reports.authorId, input.authorId));
    }
    
    if (input?.unit) {
      conditions.push(eq(schema.reports.unit, input.unit));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Sort by creation date (newest first)
    query = query.orderBy(desc(schema.reports.createdAt));
    
    if (input?.limit) {
      query = query.limit(input.limit);
    }
    
    if (input?.offset) {
      query = query.offset(input.offset);
    }
    
    const reports = await query;
    
    // Get total count
    let countQuery = db.select({ count: schema.reports.id }).from(schema.reports);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = await countQuery;
    const total = totalResult.length;
    
    return {
      reports,
      total,
    };
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
  .use(activityLoggers.view('approval_reports'))
  .query(async ({ input }) => {
    const db = getDatabase();
    
    // For now, return all pending reports since we don't have approvers field implemented yet
    // In a real implementation, you would have a separate approvers table or field
    const reports = await db.select().from(schema.reports)
      .where(eq(schema.reports.status, 'pending'))
      .orderBy(desc(schema.reports.createdAt));
    
    return reports;
  });