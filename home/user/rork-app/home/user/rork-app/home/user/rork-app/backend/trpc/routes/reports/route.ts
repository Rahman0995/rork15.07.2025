import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { mockReports, mockReportComments } from '../../../../constants/mockData';
import { Report, ReportComment, ReportStatus } from '../../../../types';

export const getReportsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
    authorId: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let reports = [...mockReports];
    
    if (input.status) {
      reports = reports.filter(report => report.status === input.status);
    }
    
    if (input.authorId) {
      reports = reports.filter(report => report.authorId === input.authorId);
    }
    
    // Sort by creation date (newest first)
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (input.offset || input.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 20;
      reports = reports.slice(offset, offset + limit);
    }
    
    return {
      reports,
      total: mockReports.length,
    };
  });

export const getReportByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const report = mockReports.find(r => r.id === input.id);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  });

export const createReportProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    content: z.string(),
    type: z.enum(['security', 'maintenance', 'incident', 'training']),
    authorId: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(({ input }) => {
    const newReport: Report = {
      id: `report_${Date.now()}`,
      title: input.title,
      content: input.content,
      type: input.type,
      status: 'draft',
      authorId: input.authorId,
      priority: input.priority,
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockReports.push(newReport);
    return newReport;
  });

export const updateReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    type: z.enum(['security', 'maintenance', 'incident', 'training']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(({ input }) => {
    const reportIndex = mockReports.findIndex(r => r.id === input.id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const report = mockReports[reportIndex];
    
    if (input.title) report.title = input.title;
    if (input.content) report.content = input.content;
    if (input.type) report.type = input.type;
    if (input.priority) report.priority = input.priority;
    if (input.tags) report.tags = input.tags;
    
    report.updatedAt = new Date().toISOString();
    
    return report;
  });

export const deleteReportProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const reportIndex = mockReports.findIndex(r => r.id === input.id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const deletedReport = mockReports.splice(reportIndex, 1)[0];
    return { success: true, deletedReport };
  });

export const approveReportProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    approverId: z.string(),
    status: z.enum(['approved', 'rejected']),
    comment: z.string().optional(),
  }))
  .mutation(({ input }) => {
    const reportIndex = mockReports.findIndex(r => r.id === input.id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const report = mockReports[reportIndex];
    report.status = input.status;
    report.approverId = input.approverId;
    report.approvedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();
    
    if (input.comment) {
      const newComment: ReportComment = {
        id: `comment_${Date.now()}`,
        reportId: input.id,
        authorId: input.approverId,
        content: input.comment,
        createdAt: new Date().toISOString(),
      };
      
      if (!mockReportComments[input.id]) {
        mockReportComments[input.id] = [];
      }
      mockReportComments[input.id].push(newComment);
    }
    
    return report;
  });

export const addCommentProcedure = publicProcedure
  .input(z.object({
    reportId: z.string(),
    authorId: z.string(),
    content: z.string(),
  }))
  .mutation(({ input }) => {
    const newComment: ReportComment = {
      id: `comment_${Date.now()}`,
      reportId: input.reportId,
      authorId: input.authorId,
      content: input.content,
      createdAt: new Date().toISOString(),
    };
    
    if (!mockReportComments[input.reportId]) {
      mockReportComments[input.reportId] = [];
    }
    mockReportComments[input.reportId].push(newComment);
    
    return newComment;
  });