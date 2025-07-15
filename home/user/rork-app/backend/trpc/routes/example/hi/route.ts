import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Mock data for demonstration
const mockTasks = [
  {
    id: '1',
    title: 'Подготовить отчет о безопасности',
    description: 'Составить ежемесячный отчет о состоянии безопасности подразделения',
    status: 'in_progress' as const,
    priority: 'high' as const,
    assignedTo: 'user1',
    createdBy: 'commander1',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Проверка оборудования',
    description: 'Провести плановую проверку технического состояния оборудования',
    status: 'pending' as const,
    priority: 'medium' as const,
    assignedTo: 'user1',
    createdBy: 'commander1',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockReports = [
  {
    id: '1',
    title: 'Отчет о дежурстве',
    content: 'Дежурство прошло без происшествий. Все системы функционируют нормально.',
    status: 'approved' as const,
    authorId: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Еженедельный отчет',
    content: 'Сводка за неделю: выполнено 15 задач, 3 в процессе выполнения.',
    status: 'pending' as const,
    authorId: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const hiProcedure = publicProcedure
  .input(z.object({
    name: z.string().optional(),
  }).optional())
  .query(({ input }: { input?: { name?: string } }) => {
    return {
      hello: input?.name || "World",
      message: "Hello from tRPC!",
      version: "1.0.0",
      date: new Date().toISOString(),
    };
  });

export const getTasksProcedure = publicProcedure
  .input(z.object({
    userId: z.string().optional(),
  }).optional())
  .query(({ input }: { input?: { userId?: string } }) => {
    // Filter tasks by user if provided
    if (input?.userId) {
      return mockTasks.filter(task => task.assignedTo === input.userId);
    }
    return mockTasks;
  });

export const getReportsProcedure = publicProcedure
  .input(z.object({
    authorId: z.string().optional(),
  }).optional())
  .query(({ input }: { input?: { authorId?: string } }) => {
    // Filter reports by author if provided
    if (input?.authorId) {
      return mockReports.filter(report => report.authorId === input.authorId);
    }
    return mockReports;
  });

export const createTaskProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    assignedTo: z.string(),
    dueDate: z.string(),
  }))
  .mutation(({ input }: { input: { title: string; description: string; priority: 'low' | 'medium' | 'high'; assignedTo: string; dueDate: string } }) => {
    const newTask = {
      id: Date.now().toString(),
      ...input,
      createdBy: 'system', // Default creator
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // In a real app, you would save to database
    // mockTasks.push(newTask);
    return newTask;
  });

export const createReportProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    content: z.string(),
    authorId: z.string(),
  }))
  .mutation(({ input }: { input: { title: string; content: string; authorId: string } }) => {
    const newReport = {
      id: Date.now().toString(),
      ...input,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReports.push(newReport);
    return newReport;
  });