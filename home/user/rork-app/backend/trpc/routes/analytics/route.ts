import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockReports, mockTasks, mockUsers } from '../../../../constants/mockData';

export const getReportsAnalyticsProcedure = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    unit: z.string().optional(),
  }).optional())
  .query(({ input }) => {
    let reports = [...mockReports];
    
    // Фильтрация по датам
    if (input?.startDate && input?.endDate) {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      reports = reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= start && reportDate <= end;
      });
    }
    
    // Фильтрация по подразделению
    if (input?.unit) {
      reports = reports.filter(report => report.unit === input.unit);
    }
    
    // Статистика по статусам
    const statusStats = {
      draft: reports.filter(r => r.status === 'draft').length,
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
      needs_revision: reports.filter(r => r.status === 'needs_revision').length,
    };
    
    // Статистика по приоритетам
    const priorityStats = {
      high: reports.filter(r => r.priority === 'high').length,
      medium: reports.filter(r => r.priority === 'medium').length,
      low: reports.filter(r => r.priority === 'low').length,
    };
    
    // Статистика по подразделениям
    const unitStats = reports.reduce((acc, report) => {
      if (report.unit) {
        acc[report.unit] = (acc[report.unit] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Статистика по авторам
    const authorStats = reports.reduce((acc, report) => {
      acc[report.authorId] = (acc[report.authorId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Временная статистика (по дням)
    const dailyStats = reports.reduce((acc, report) => {
      const date = new Date(report.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: reports.length,
      statusStats,
      priorityStats,
      unitStats,
      authorStats,
      dailyStats,
      averageApprovalTime: calculateAverageApprovalTime(reports),
    };
  });

export const getTasksAnalyticsProcedure = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
  }).optional())
  .query(({ input }) => {
    let tasks = [...mockTasks];
    
    // Фильтрация по датам
    if (input?.startDate && input?.endDate) {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      tasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    }
    
    // Фильтрация по исполнителю
    if (input?.assignedTo) {
      tasks = tasks.filter(task => task.assignedTo === input.assignedTo);
    }
    
    // Фильтрация по создателю
    if (input?.createdBy) {
      tasks = tasks.filter(task => task.createdBy === input.createdBy);
    }
    
    // Статистика по статусам
    const statusStats = {
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
    
    // Статистика по приоритетам
    const priorityStats = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
    
    // Просроченные задачи
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      task.status !== 'cancelled' && 
      new Date(task.dueDate) < now
    ).length;
    
    // Статистика по исполнителям
    const assigneeStats = tasks.reduce((acc, task) => {
      acc[task.assignedTo] = (acc[task.assignedTo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Временная статистика (по дням)
    const dailyStats = tasks.reduce((acc, task) => {
      const date = new Date(task.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: tasks.length,
      statusStats,
      priorityStats,
      overdueTasks,
      assigneeStats,
      dailyStats,
      averageCompletionTime: calculateAverageCompletionTime(tasks),
      completionRate: calculateCompletionRate(tasks),
    };
  });

export const getUserActivityProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(({ input }) => {
    let userReports = mockReports.filter(r => r.authorId === input.userId);
    let userTasks = mockTasks.filter(t => t.assignedTo === input.userId);
    
    // Фильтрация по датам
    if (input.startDate && input.endDate) {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      
      userReports = userReports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= start && reportDate <= end;
      });
      
      userTasks = userTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    }
    
    return {
      reportsCreated: userReports.length,
      tasksAssigned: userTasks.length,
      tasksCompleted: userTasks.filter(t => t.status === 'completed').length,
      reportsApproved: userReports.filter(r => r.status === 'approved').length,
      averageTaskCompletionTime: calculateAverageCompletionTime(userTasks),
      productivityScore: calculateProductivityScore(userReports, userTasks),
    };
  });

export const getDashboardStatsProcedure = publicProcedure
  .query(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Статистика за последнюю неделю
    const recentReports = mockReports.filter(r => new Date(r.createdAt) >= weekAgo);
    const recentTasks = mockTasks.filter(t => new Date(t.createdAt) >= weekAgo);
    
    return {
      totalUsers: mockUsers.length,
      totalReports: mockReports.length,
      totalTasks: mockTasks.length,
      recentReports: recentReports.length,
      recentTasks: recentTasks.length,
      pendingReports: mockReports.filter(r => r.status === 'pending').length,
      pendingTasks: mockTasks.filter(t => t.status === 'pending').length,
      overdueTasksCount: mockTasks.filter(task => 
        task.status !== 'completed' && 
        task.status !== 'cancelled' && 
        new Date(task.dueDate) < now
      ).length,
      completionRate: calculateCompletionRate(mockTasks),
      approvalRate: calculateApprovalRate(mockReports),
    };
  });

// Вспомогательные функции
function calculateAverageApprovalTime(reports: typeof mockReports): number {
  const approvedReports = reports.filter(r => r.status === 'approved' && r.approvals?.length);
  if (approvedReports.length === 0) return 0;
  
  const totalTime = approvedReports.reduce((sum, report) => {
    const created = new Date(report.createdAt).getTime();
    const approved = new Date(report.approvals![0].createdAt).getTime();
    return sum + (approved - created);
  }, 0);
  
  return Math.round(totalTime / approvedReports.length / (1000 * 60 * 60)); // в часах
}

function calculateAverageCompletionTime(tasks: typeof mockTasks): number {
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((sum, task) => {
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.completedAt!).getTime();
    return sum + (completed - created);
  }, 0);
  
  return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)); // в часах
}

function calculateCompletionRate(tasks: typeof mockTasks): number {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

function calculateApprovalRate(reports: typeof mockReports): number {
  if (reports.length === 0) return 0;
  const approvedReports = reports.filter(r => r.status === 'approved').length;
  return Math.round((approvedReports / reports.length) * 100);
}

function calculateProductivityScore(reports: typeof mockReports, tasks: typeof mockTasks): number {
  const reportsScore = reports.filter(r => r.status === 'approved').length * 10;
  const tasksScore = tasks.filter(t => t.status === 'completed').length * 5;
  return reportsScore + tasksScore;
}