import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockTasks } from '@/constants/mockData';
import { Task, TaskStatus, TaskPriority } from '@/types';

export const getTasksProcedure = publicProcedure
  .input(z.object({
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }).optional())
  .query(({ input }) => {
    let tasks = [...mockTasks];
    
    if (input?.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === input.assignedTo);
    }
    
    if (input?.createdBy) {
      tasks = tasks.filter(t => t.createdBy === input.createdBy);
    }
    
    if (input?.status) {
      tasks = tasks.filter(t => t.status === input.status);
    }
    
    if (input?.priority) {
      tasks = tasks.filter(t => t.priority === input.priority);
    }
    
    return tasks;
  });

export const getTaskByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(({ input }) => {
    const task = mockTasks.find(t => t.id === input.id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  });

export const createTaskProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string(),
    assignedTo: z.string(),
    createdBy: z.string(),
    dueDate: z.string(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }))
  .mutation(({ input }) => {
    const newTask: Task = {
      id: String(mockTasks.length + 1),
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
    return { success: true, task: newTask };
  });

export const updateTaskProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().optional(),
  }))
  .mutation(({ input }) => {
    const taskIndex = mockTasks.findIndex(t => t.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const task = mockTasks[taskIndex];
    const updatedTask = {
      ...task,
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.dueDate && { dueDate: input.dueDate }),
      updatedAt: new Date().toISOString(),
      ...(input.status === 'completed' && !task.completedAt && { completedAt: new Date().toISOString() }),
    };
    
    mockTasks[taskIndex] = updatedTask;
    return { success: true, task: updatedTask };
  });

export const deleteTaskProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(({ input }) => {
    const taskIndex = mockTasks.findIndex(t => t.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = mockTasks.splice(taskIndex, 1)[0];
    return { success: true, deletedTask };
  });

export const getTaskStatsProcedure = publicProcedure
  .input(z.object({
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
  }).optional())
  .query(({ input }) => {
    let tasks = [...mockTasks];
    
    if (input?.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === input.assignedTo);
    }
    
    if (input?.createdBy) {
      tasks = tasks.filter(t => t.createdBy === input.createdBy);
    }
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      overdue: tasks.filter(t => 
        t.status !== 'completed' && 
        t.status !== 'cancelled' && 
        new Date(t.dueDate) < new Date()
      ).length,
      byPriority: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
    };
  });