import { z } from "zod";
import { publicProcedure } from "../../../../create-context";

export const hiProcedure = publicProcedure
  .input(z.object({ name: z.string().optional() }))
  .query(({ input }: { input?: { name?: string } }) => {
    return {
      message: `Hello ${input?.name || 'World'}!`,
      timestamp: new Date().toISOString(),
    };
  });

// Mock data for tasks and reports
type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Проверить оборудование',
    description: 'Провести плановую проверку оборудования в секторе А',
    status: 'pending',
    priority: 'high',
    assignedTo: '1',
    createdBy: '2',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Составить отчет',
    description: 'Подготовить еженедельный отчет о состоянии объекта',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: '1',
    createdBy: '2',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
  },
];

type ReportStatus = 'pending' | 'approved' | 'rejected';

interface Report {
  id: string;
  title: string;
  content: string;
  status: ReportStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Отчет о безопасности',
    content: 'Все системы безопасности функционируют в штатном режиме',
    status: 'approved',
    authorId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Еженедельный отчет',
    content: 'Сводка событий за неделю',
    status: 'pending',
    authorId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getTasksProcedure = publicProcedure
  .query(() => {
    return mockTasks;
  });

export const getReportsProcedure = publicProcedure
  .query(() => {
    return mockReports;
  });

export const createTaskProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    assignedTo: z.string(),
    createdBy: z.string(),
    dueDate: z.string(),
  }))
  .mutation(({ input }) => {
    const newTask: Task = {
      id: String(mockTasks.length + 1),
      title: input.title,
      description: input.description,
      status: 'pending',
      priority: input.priority,
      assignedTo: input.assignedTo,
      createdBy: input.createdBy,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTasks.push(newTask);
    return newTask;
  });

export const createReportProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    content: z.string(),
  }))
  .mutation(({ input }) => {
    const newReport: Report = {
      id: String(mockReports.length + 1),
      ...input,
      status: 'pending',
      authorId: '1', // Mock current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReports.push(newReport);
    return newReport;
  });