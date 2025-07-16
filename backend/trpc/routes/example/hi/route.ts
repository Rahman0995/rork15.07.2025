import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const hiProcedure = publicProcedure
  .input(z.object({ name: z.string().optional() }))
  .query(({ input }) => {
    // Simple, guaranteed non-undefined return
    const name = input?.name || 'World';
    const message = `Hello ${name}!`;
    const timestamp = new Date().toISOString();
    
    const result = { message, timestamp };
    console.log('hiProcedure called with input:', input, 'returning:', result);
    
    return result;
  });

// Mock data for tasks and reports
const mockTasks = [
  {
    id: '1',
    title: 'Проверить оборудование',
    description: 'Провести плановую проверку оборудования в секторе А',
    status: 'pending' as const,
    priority: 'high' as const,
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
    status: 'in_progress' as const,
    priority: 'medium' as const,
    assignedTo: '1',
    createdBy: '2',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
  },
];

const mockReports = [
  {
    id: '1',
    title: 'Отчет о безопасности',
    content: 'Все системы безопасности функционируют в штатном режиме',
    status: 'approved' as const,
    authorId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Еженедельный отчет',
    content: 'Сводка событий за неделю',
    status: 'pending' as const,
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
    dueDate: z.string(),
  }))
  .mutation(({ input }) => {
    const newTask = {
      id: String(mockTasks.length + 1),
      title: input.title,
      description: input.description,
      status: 'pending' as const,
      priority: input.priority,
      assignedTo: input.assignedTo,
      createdBy: '1', // Mock current user
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
    const newReport = {
      id: String(mockReports.length + 1),
      ...input,
      status: 'pending' as const,
      authorId: '1', // Mock current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReports.push(newReport);
    return newReport;
  });