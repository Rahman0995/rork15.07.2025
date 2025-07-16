import { z } from 'zod';
import { publicProcedure } from '../../create-context';
// Mock data for analytics - defined locally to avoid import issues
interface Report {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_revision';
  authorId: string;
  createdAt: string;
  unit?: string;
  priority?: 'low' | 'medium' | 'high';
  type?: 'text' | 'file' | 'video';
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  dueDate: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Security Report',
    status: 'approved',
    authorId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    unit: 'Security',
    priority: 'high',
    type: 'text',
  },
  {
    id: '2',
    title: 'Weekly Report',
    status: 'pending',
    authorId: '2',
    createdAt: new Date().toISOString(),
    unit: 'Operations',
    priority: 'medium',
    type: 'text',
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Equipment Check',
    status: 'completed',
    priority: 'high',
    assignedTo: '1',
    createdBy: '2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    title: 'Prepare Report',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: '2',
    createdBy: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  },
];

export const getReportsAnalyticsProcedure = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    unit: z.string().optional(),
  }).optional())
  .query(({ input }: { input: any }) => {
    let reports = [...mockReports];
    
    if (input?.startDate) {
      reports = reports.filter(r => new Date(r.createdAt) >= new Date(input.startDate!));
    }
    
    if (input?.endDate) {
      reports = reports.filter(r => new Date(r.createdAt) <= new Date(input.endDate!));
    }
    
    if (input?.unit) {
      reports = reports.filter(r => r.unit === input.unit);
    }
    
    const analytics = {
      total: reports.length,
      byStatus: {
        draft: reports.filter(r => r.status === 'draft').length,
        pending: reports.filter(r => r.status === 'pending').length,
        approved: reports.filter(r => r.status === 'approved').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
        needs_revision: reports.filter(r => r.status === 'needs_revision').length,
      },
      byPriority: {
        high: reports.filter(r => r.priority === 'high').length,
        medium: reports.filter(r => r.priority === 'medium').length,
        low: reports.filter(r => r.priority === 'low').length,
      },
      byType: {
        text: reports.filter(r => r.type === 'text').length,
        file: reports.filter(r => r.type === 'file').length,
        video: reports.filter(r => r.type === 'video').length,
      },
      timeline: generateTimelineData(reports),
    };
    
    return analytics;
  });

export const getTasksAnalyticsProcedure = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    assignedTo: z.string().optional(),
  }).optional())
  .query(({ input }: { input: any }) => {
    let tasks = [...mockTasks];
    
    if (input?.startDate) {
      tasks = tasks.filter(t => new Date(t.createdAt) >= new Date(input.startDate!));
    }
    
    if (input?.endDate) {
      tasks = tasks.filter(t => new Date(t.createdAt) <= new Date(input.endDate!));
    }
    
    if (input?.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === input.assignedTo);
    }
    
    const analytics = {
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
      },
      byPriority: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
      overdue: tasks.filter(t => 
        t.status !== 'completed' && 
        t.status !== 'cancelled' && 
        new Date(t.dueDate) < new Date()
      ).length,
      completionRate: tasks.length > 0 ? 
        (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0,
      timeline: generateTimelineData(tasks),
    };
    
    return analytics;
  });

export const getUserActivityProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(({ input }: { input: any }) => {
    let userReports = mockReports.filter(r => r.authorId === input.userId);
    let userTasks = mockTasks.filter(t => t.assignedTo === input.userId || t.createdBy === input.userId);
    
    if (input.startDate) {
      userReports = userReports.filter(r => new Date(r.createdAt) >= new Date(input.startDate!));
      userTasks = userTasks.filter(t => new Date(t.createdAt) >= new Date(input.startDate!));
    }
    
    if (input.endDate) {
      userReports = userReports.filter(r => new Date(r.createdAt) <= new Date(input.endDate!));
      userTasks = userTasks.filter(t => new Date(t.createdAt) <= new Date(input.endDate!));
    }
    
    const activity = {
      reports: {
        total: userReports.length,
        approved: userReports.filter(r => r.status === 'approved').length,
        pending: userReports.filter(r => r.status === 'pending').length,
        rejected: userReports.filter(r => r.status === 'rejected').length,
      },
      tasks: {
        total: userTasks.length,
        completed: userTasks.filter(t => t.status === 'completed').length,
        pending: userTasks.filter(t => t.status === 'pending').length,
        overdue: userTasks.filter(t => 
          t.status !== 'completed' && 
          t.status !== 'cancelled' && 
          new Date(t.dueDate) < new Date()
        ).length,
      },
      timeline: generateUserActivityTimeline(userReports, userTasks),
    };
    
    return activity;
  });

export const getDashboardStatsProcedure = publicProcedure
  .query(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentReports = mockReports.filter(r => new Date(r.createdAt) >= weekAgo);
    const recentTasks = mockTasks.filter(t => new Date(t.createdAt) >= weekAgo);
    
    const stats = {
      reports: {
        total: mockReports.length,
        recent: recentReports.length,
        pending: mockReports.filter(r => r.status === 'pending').length,
        approved: mockReports.filter(r => r.status === 'approved').length,
      },
      tasks: {
        total: mockTasks.length,
        recent: recentTasks.length,
        pending: mockTasks.filter(t => t.status === 'pending').length,
        completed: mockTasks.filter(t => t.status === 'completed').length,
        overdue: mockTasks.filter(t => 
          t.status !== 'completed' && 
          t.status !== 'cancelled' && 
          new Date(t.dueDate) < now
        ).length,
      },
      activity: {
        reportsThisWeek: recentReports.length,
        tasksThisWeek: recentTasks.length,
        completionRate: mockTasks.length > 0 ? 
          (mockTasks.filter(t => t.status === 'completed').length / mockTasks.length) * 100 : 0,
      },
    };
    
    return stats;
  });

// Helper functions
function generateTimelineData(items: (Report | Task)[]) {
  const timeline: Record<string, number> = {};
  
  items.forEach(item => {
    const date = new Date(item.createdAt).toISOString().split('T')[0];
    timeline[date] = (timeline[date] || 0) + 1;
  });
  
  return Object.entries(timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function generateUserActivityTimeline(reports: Report[], tasks: Task[]) {
  const timeline: Record<string, { reports: number; tasks: number }> = {};
  
  reports.forEach(report => {
    const date = new Date(report.createdAt).toISOString().split('T')[0];
    if (!timeline[date]) timeline[date] = { reports: 0, tasks: 0 };
    timeline[date].reports++;
  });
  
  tasks.forEach(task => {
    const date = new Date(task.createdAt).toISOString().split('T')[0];
    if (!timeline[date]) timeline[date] = { reports: 0, tasks: 0 };
    timeline[date].tasks++;
  });
  
  return Object.entries(timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));
}