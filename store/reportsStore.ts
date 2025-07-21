import { create } from 'zustand';
import { Report, ReportStatus, ReportComment, ReportApproval, ReportRevision } from '@/types';
import { trpcClient } from '@/lib/trpc';
import { useNotificationsStore } from './notificationsStore';
import { useAuthStore } from '@/store/authStore';

interface ReportsState {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  getReportById: (id: string) => Report | undefined;
  createReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'approvals' | 'comments' | 'revisions' | 'currentRevision'>) => Promise<void>;
  addReport: (report: Report) => void;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;
  approveReport: (reportId: string, comment?: string) => Promise<void>;
  rejectReport: (reportId: string, comment: string) => Promise<void>;
  requestRevision: (reportId: string, comment: string) => Promise<void>;
  addComment: (reportId: string, content: string, isRevision?: boolean) => Promise<void>;
  submitRevision: (reportId: string, title: string, content: string, attachments: any[]) => Promise<void>;
  getReportsForApproval: () => Report[];
  getMyReports: () => Report[];
  deleteReport: (reportId: string) => Promise<void>;
  updateReport: (reportId: string, updates: Partial<Report>) => Promise<void>;
  getReportsByStatus: (status: ReportStatus) => Report[];
  getReportsByUnit: (unit: string) => Report[];
  getReportsByPriority: (priority: 'low' | 'medium' | 'high') => Report[];
  searchReports: (query: string) => Report[];
  clearReports: () => void;
  getReportsStats: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    needsRevision: number;
    draft: number;
  };
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [],
  isLoading: false,
  error: null,
  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const reports = await trpcClient.reports.getAll.query();
      // Преобразуем данные из Supabase в формат frontend
      const transformedReports = (reports || []).map((report: any) => ({
        id: report.id,
        title: report.title,
        content: report.content || '',
        authorId: report.created_by,
        status: report.status,
        type: report.type || 'text' as const,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        attachments: [],
        unit: 'default',
        priority: 'medium' as const,
        approvers: [],
        approvals: [],
        comments: [],
        revisions: [],
        currentRevision: 1,

      }));
      set({ reports: transformedReports, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch reports from backend:', error);
      set({ reports: [], isLoading: false, error: 'Ошибка при загрузке отчетов' });
    }
  },
  getReportById: (id: string) => {
    return get().reports.find(report => report.id === id);
  },
  createReport: async (reportData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.reports.create.mutate({
        title: reportData.title,
        content: reportData.content,
        authorId: reportData.authorId,
        type: reportData.type,
      });
      
      if (result.success && result.report) {
        // Преобразуем данные из Supabase
        const transformedReport: Report = {
          id: result.report.id,
          title: result.report.title,
          content: result.report.content || '',
          authorId: result.report.created_by,
          status: result.report.status,
          type: result.report.type || 'text',
          createdAt: result.report.created_at,
          updatedAt: result.report.updated_at,
          attachments: [],
          unit: 'default',
          priority: 'medium',
          approvers: [],
          approvals: [],
          comments: [],
          revisions: [],
          currentRevision: 1,
        };
        
        set(state => ({
          reports: [transformedReport, ...state.reports],
          isLoading: false,
        }));
        
        // Create notification for approvers
        try {
          const { createNotification } = useNotificationsStore.getState();
          
          for (const approverId of transformedReport.approvers ?? []) {
            await createNotification({
              type: 'report_created',
              title: 'Новый отчет на утверждение',
              body: `Отчет "${transformedReport.title}" ожидает вашего утверждения`,
              userId: approverId,
              read: false,
              data: { reportId: transformedReport.id }
            });
          }
        } catch (notificationError) {
          console.warn('Failed to create notification:', notificationError);
        }
      } else {
        throw new Error('Не удалось создать отчет');
      }
      
    } catch (error) {
      console.error('Error creating report:', error);
      set({ error: 'Ошибка при создании отчета', isLoading: false });
    }
  },
  addReport: (report) => {
    set(state => ({
      reports: [report, ...state.reports],
    }));
  },
  updateReportStatus: async (id: string, status: ReportStatus) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const report = get().reports.find(r => r.id === id);
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === id ? { ...report, status, updatedAt: new Date().toISOString() } : report
        ),
        isLoading: false,
      }));
      
      // Create notification for report author
      if (report) {
        const { createNotification } = useNotificationsStore.getState();
        
        const notificationType = status === 'approved' ? 'report_approved' : 
                                status === 'rejected' ? 'report_rejected' : 'report_revision_requested';
        const title = status === 'approved' ? 'Отчет утвержден' : 
                     status === 'rejected' ? 'Отчет отклонен' : 'Требуется доработка';
        const body = status === 'approved' 
          ? `Ваш отчет "${report.title}" был утвержден`
          : status === 'rejected'
          ? `Ваш отчет "${report.title}" был отклонен`
          : `Ваш отчет "${report.title}" требует доработки`;
        
        await createNotification({
          type: notificationType,
          title,
          body,
          userId: report.authorId,
          read: false,
          data: { reportId: report.id }
        });
      }
      
    } catch (error) {
      set({ error: 'Ошибка при обновлении статуса отчета', isLoading: false });
    }
  },
  
  approveReport: async (reportId: string, comment?: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const approval: ReportApproval = {
        id: `${Date.now()}`,
        reportId,
        approverId: currentUser.id,
        status: 'approved',
        comment,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === reportId ? {
            ...report,
            status: 'approved' as ReportStatus,
            approvals: [...(report.approvals ?? []), approval],
            updatedAt: new Date().toISOString(),
          } : report
        ),
        isLoading: false,
      }));
      
      // Notify report author
      const report = get().reports.find(r => r.id === reportId);
      if (report) {
        const { createNotification } = useNotificationsStore.getState();
        await createNotification({
          type: 'report_approved',
          title: 'Отчет утвержден',
          body: `Ваш отчет "${report.title}" был утвержден`,
          userId: report.authorId,
          read: false,
          data: { reportId }
        });
      }
      
    } catch (error) {
      set({ error: 'Ошибка при утверждении отчета', isLoading: false });
    }
  },
  
  rejectReport: async (reportId: string, comment: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const approval: ReportApproval = {
        id: `${Date.now()}`,
        reportId,
        approverId: currentUser.id,
        status: 'rejected',
        comment,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === reportId ? {
            ...report,
            status: 'rejected' as ReportStatus,
            approvals: [...(report.approvals ?? []), approval],
            updatedAt: new Date().toISOString(),
          } : report
        ),
        isLoading: false,
      }));
      
      // Notify report author
      const report = get().reports.find(r => r.id === reportId);
      if (report) {
        const { createNotification } = useNotificationsStore.getState();
        await createNotification({
          type: 'report_rejected',
          title: 'Отчет отклонен',
          body: `Ваш отчет "${report.title}" был отклонен`,
          userId: report.authorId,
          read: false,
          data: { reportId }
        });
      }
      
    } catch (error) {
      set({ error: 'Ошибка при отклонении отчета', isLoading: false });
    }
  },
  
  requestRevision: async (reportId: string, comment: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const approval: ReportApproval = {
        id: `${Date.now()}`,
        reportId,
        approverId: currentUser.id,
        status: 'needs_revision',
        comment,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === reportId ? {
            ...report,
            status: 'needs_revision' as ReportStatus,
            approvals: [...(report.approvals ?? []), approval],
            updatedAt: new Date().toISOString(),
          } : report
        ),
        isLoading: false,
      }));
      
      // Notify report author
      const report = get().reports.find(r => r.id === reportId);
      if (report) {
        const { createNotification } = useNotificationsStore.getState();
        await createNotification({
          type: 'report_revision_requested',
          title: 'Требуется доработка отчета',
          body: `Ваш отчет "${report.title}" требует доработки`,
          userId: report.authorId,
          read: false,
          data: { reportId }
        });
      }
      
    } catch (error) {
      set({ error: 'Ошибка при запросе доработки', isLoading: false });
    }
  },
  
  addComment: async (reportId: string, content: string, isRevision = false) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const comment: ReportComment = {
        id: `${Date.now()}`,
        reportId,
        authorId: currentUser.id,
        content,
        createdAt: new Date().toISOString(),
        isRevision,
      };
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === reportId ? {
            ...report,
            comments: [...(report.comments ?? []), comment],
            updatedAt: new Date().toISOString(),
          } : report
        ),
        isLoading: false,
      }));
      
    } catch (error) {
      set({ error: 'Ошибка при добавлении комментария', isLoading: false });
    }
  },
  
  submitRevision: async (reportId: string, title: string, content: string, attachments: any[]) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const report = get().reports.find(r => r.id === reportId);
      if (!report) return;
      
      const revision: ReportRevision = {
        id: `${Date.now()}`,
        reportId,
        version: (report.currentRevision || 1) + 1,
        title,
        content,
        attachments,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        authorId: currentUser.id,
      };
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === reportId ? {
            ...report,
            title,
            content,
            attachments,
            status: 'pending' as ReportStatus,
            revisions: [...(report.revisions ?? []), revision],
            currentRevision: revision.version,
            updatedAt: new Date().toISOString(),
          } : report
        ),
        isLoading: false,
      }));
      
      // Notify approvers about the revision
      const { createNotification } = useNotificationsStore.getState();
      for (const approverId of report.approvers ?? []) {
        await createNotification({
          type: 'report_revised',
          title: 'Отчет доработан',
          body: `Отчет "${title}" был доработан и ожидает повторного рассмотрения`,
          userId: approverId,
          read: false,
          data: { reportId }
        });
      }
      
    } catch (error) {
      set({ error: 'Ошибка при отправке доработки', isLoading: false });
    }
  },
  
  getReportsForApproval: () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return [];
    
    return get().reports.filter(report => 
      (report.approvers ?? []).includes(currentUser.id) && 
      (report.status === 'pending' || report.status === 'needs_revision')
    );
  },
  
  getMyReports: () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return [];
    
    return get().reports.filter(report => report.authorId === currentUser.id);
  },
  
  deleteReport: async (reportId: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        reports: state.reports.filter(report => report.id !== reportId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Ошибка при удалении отчета', isLoading: false });
    }
  },
  
  updateReport: async (reportId: string, updates: Partial<Report>) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === reportId 
            ? { ...report, ...updates, updatedAt: new Date().toISOString() }
            : report
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Ошибка при обновлении отчета', isLoading: false });
    }
  },
  
  getReportsByStatus: (status: ReportStatus) => {
    return get().reports.filter(report => report.status === status);
  },
  
  getReportsByUnit: (unit: string) => {
    return get().reports.filter(report => report.unit === unit);
  },
  
  getReportsByPriority: (priority: 'low' | 'medium' | 'high') => {
    return get().reports.filter(report => report.priority === priority);
  },
  
  searchReports: (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return get().reports.filter(report => 
      report.title.toLowerCase().includes(lowercaseQuery) ||
      report.content.toLowerCase().includes(lowercaseQuery) ||
      report.unit?.toLowerCase().includes(lowercaseQuery)
    );
  },
  
  clearReports: () => {
    set({ reports: [] });
  },
  
  getReportsStats: () => {
    const reports = get().reports;
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
      needsRevision: reports.filter(r => r.status === 'needs_revision').length,
      draft: reports.filter(r => r.status === 'draft').length,
    };
  },
}));