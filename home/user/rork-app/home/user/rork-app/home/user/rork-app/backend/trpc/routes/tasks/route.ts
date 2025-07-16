import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { mockTasks } from '../../../../constants/mockData';
import { Task, TaskStatus } from '../../../../types';

export const getTasksProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let tasks = [...mockTasks];
    
    if (input.status) {
      tasks = tasks.filter(task => task.status === input.status);
    }
    
    if (input.assigneeId) {
      tasks = tasks.filter(task => task.assigneeId === input.assigneeId);
    }
    
    if (input.priority) {
      tasks = tasks.filter(task => task.priority === input.priority);
    }
    
    // Sort by creation date (newest first)
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (input.offset || input.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 20;
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
    assigneeId: z.string(),
    createdById: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    dueDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(({ input }) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: input.title,
      description: input.description,
      status: 'pending',
      assigneeId: input.assigneeId,
      createdById: input.createdById,
      priority: input.priority,
      dueDate: input.dueDate,
      tags: input.tags || [],
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
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    dueDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(({ input }) => {
    const taskIndex = mockTasks.findIndex(t => t.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const task = mockTasks[taskIndex];
    
    if (input.title) task.title = input.title;
    if (input.description) task.description = input.description;
    if (input.status) task.status = input.status;
    if (input.priority) task.priority = input.priority;
    if (input.dueDate) task.dueDate = input.dueDate;
    if (input.tags) task.tags = input.tags;
    
    task.updatedAt = new Date().toISOString();
    
    return task;
  });

export const deleteTaskProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const taskIndex = mockTasks.findIndex(t => t.id === input.id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = mockTasks.splice(taskIndex, 1)[0];
    return { success: true, deletedTask };
  });