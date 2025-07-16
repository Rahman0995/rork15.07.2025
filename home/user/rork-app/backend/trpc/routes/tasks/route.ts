import { z } from 'zod';
import { publicProcedure } from '../../create-context';
// Mock data for tasks - defined locally to avoid import issues
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Equipment Check',
    description: 'Conduct routine equipment inspection in sector A',
    assignedTo: '1',
    createdBy: '2',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'pending',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Prepare Report',
    description: 'Prepare weekly status report',
    assignedTo: '1',
    createdBy: '2',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getTask = (id: string): Task | undefined => {
  return mockTasks.find(task => task.id === id);
};

const getUserTasks = (userId: string): Task[] => {
  return mockTasks.filter(task => task.assignedTo === userId);
};

export const getTasksProcedure = publicProcedure
  .input(z.object({
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(({ input }: { input?: any }) => {
    let tasks = [...mockTasks];
    
    if (input?.assignedTo) {
      tasks = tasks.filter(task => task.assignedTo === input.assignedTo);
    }
    
    if (input?.createdBy) {
      tasks = tasks.filter(task => task.createdBy === input.createdBy);
    }
    
    if (input?.status) {
      tasks = tasks.filter(task => task.status === input.status);
    }
    
    if (input?.priority) {
      tasks = tasks.filter(task => task.priority === input.priority);
    }
    
    // Sort by priority and creation date
    const priorityOrder: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
    tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    if (input?.offset || input?.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 10;
      tasks = tasks.slice(offset, offset + limit);
    }
    
    return {
      tasks,
      total: mockTasks.length,
    };
  });

export const getTaskByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }: { input?: any }) => {
    const task = getTask(input.id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  });

export const createTaskProcedure = publicProcedure
  .input(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    assignedTo: z.string(),
    createdBy: z.string(),
    dueDate: z.string(),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  }))
  .mutation(({ input }: { input: { title: string; description: string; assignedTo: string; createdBy: string; dueDate: string; priority: TaskPriority } }) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: input.title,
      description: input.description,
      assignedTo: input.assignedTo,
      createdBy: input.createdBy,
      dueDate: input.dueDate,
      status: 'pending',
      priority: input.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockTasks.push(newTask);
    return newTask;
  });

export const updateTaskProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }))
  .mutation(({ input }: { input: { id: string; title?: string; description?: string; assignedTo?: string; dueDate?: string; status?: TaskStatus; priority?: TaskPriority } }) => {
    const taskIndex = mockTasks.findIndex((task: Task) => task.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const currentTask = mockTasks[taskIndex];
    const updatedTask = {
      ...currentTask,
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.assignedTo && { assignedTo: input.assignedTo }),
      ...(input.dueDate && { dueDate: input.dueDate }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      updatedAt: new Date().toISOString(),
    };
    
    // If task is completed, add completion time
    if (input.status === 'completed' && currentTask.status !== 'completed') {
      updatedTask.completedAt = new Date().toISOString();
    }
    
    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  });

export const deleteTaskProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }: { input: { id: string } }) => {
    const taskIndex = mockTasks.findIndex((task: Task) => task.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = mockTasks.splice(taskIndex, 1)[0];
    return { success: true, deletedTask };
  });

export const getTaskStatsProcedure = publicProcedure
  .input(z.object({ userId: z.string().optional() }).optional())
  .query(({ input }: { input?: any }) => {
    let tasks = mockTasks;
    
    if (input?.userId) {
      tasks = tasks.filter((task: Task) => task.assignedTo === input.userId || task.createdBy === input.userId);
    }
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter((task: Task) => task.status === 'pending').length,
      inProgress: tasks.filter((task: Task) => task.status === 'in_progress').length,
      completed: tasks.filter((task: Task) => task.status === 'completed').length,
      cancelled: tasks.filter((task: Task) => task.status === 'cancelled').length,
      overdue: tasks.filter((task: Task) => 
        task.status !== 'completed' && 
        task.status !== 'cancelled' && 
        new Date(task.dueDate) < new Date()
      ).length,
      byPriority: {
        high: tasks.filter((task: Task) => task.priority === 'high').length,
        medium: tasks.filter((task: Task) => task.priority === 'medium').length,
        low: tasks.filter((task: Task) => task.priority === 'low').length,
      },
    };
    
    return stats;
  });