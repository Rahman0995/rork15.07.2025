import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockTasks, getTask, getUserTasks } from '@/constants/mockData';
import type { Task, TaskStatus, TaskPriority } from '@/types';

export const getTasksProcedure = publicProcedure
  .input(z.object({
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(({ input }) => {
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
    
    // Сортировка по приоритету и дате создания
    const priorityOrder = { high: 3, medium: 2, low: 1 };
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
  .query(({ input }) => {
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
  .mutation(({ input }) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      ...input,
      status: 'pending',
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
  .mutation(({ input }) => {
    const taskIndex = mockTasks.findIndex(task => task.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const currentTask = mockTasks[taskIndex];
    const updatedTask = {
      ...currentTask,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    // Если задача завершена, добавляем время завершения
    if (input.status === 'completed' && currentTask.status !== 'completed') {
      updatedTask.completedAt = new Date().toISOString();
    }
    
    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  });

export const deleteTaskProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const taskIndex = mockTasks.findIndex(task => task.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = mockTasks.splice(taskIndex, 1)[0];
    return { success: true, deletedTask };
  });

export const getTaskStatsProcedure = publicProcedure
  .input(z.object({ userId: z.string().optional() }).optional())
  .query(({ input }) => {
    let tasks = mockTasks;
    
    if (input?.userId) {
      tasks = tasks.filter(task => task.assignedTo === input.userId);
    }
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      cancelled: tasks.filter(task => task.status === 'cancelled').length,
      overdue: tasks.filter(task => 
        task.status !== 'completed' && 
        task.status !== 'cancelled' && 
        new Date(task.dueDate) < new Date()
      ).length,
      byPriority: {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length,
      },
    };
    
    return stats;
  });