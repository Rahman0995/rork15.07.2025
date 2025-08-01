import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { database } from '../../../../lib/supabase';
import { Task, TaskStatus } from '../../../../types';

type TasksInput = {
  assignedTo?: string;
  createdBy?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
};

type TaskByIdInput = {
  id: string;
};

type CreateTaskInput = {
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  priority?: 'low' | 'medium' | 'high';
};

type UpdateTaskInput = {
  id: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
};

type DeleteTaskInput = {
  id: string;
};

type TaskStatsInput = {
  assignedTo?: string;
  createdBy?: string;
};

export const getTasksProcedure = publicProcedure
  .input(z.object({
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }).optional())
  .query(async ({ input }: { input?: TasksInput | undefined }) => {
    try {
      console.log('Fetching tasks with filters:', input);
      
      let query = database.tasks.getAll();
      
      if (input?.assignedTo) {
        query = database.tasks.getByAssignee(input.assignedTo);
      }
      
      const { data: tasks, error } = await query;
      
      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
      
      // Apply additional filters
      let filteredTasks = tasks || [];
      
      if (input?.createdBy) {
        filteredTasks = filteredTasks.filter(task => task.created_by === input.createdBy);
      }
      
      if (input?.status) {
        filteredTasks = filteredTasks.filter(task => task.status === input.status);
      }
      
      if (input?.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === input.priority);
      }
      
      return filteredTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  });

export const getTaskByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ input }: { input: TaskByIdInput }) => {
    try {
      console.log('Fetching task by ID:', input.id);
      
      const { data: task, error } = await database.tasks.getById(input.id);
      
      if (error) {
        throw new Error(error.message || 'Task not found');
      }
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return task;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw new Error('Task not found');
    }
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
  .mutation(async ({ input }: { input: CreateTaskInput }) => {
    try {
      console.log('Creating task:', input);
      
      const { data: task, error } = await database.tasks.create({
        title: input.title,
        description: input.description,
        assigned_to: input.assignedTo,
        created_by: input.createdBy,
        due_date: input.dueDate,
        priority: input.priority || 'medium',
        status: 'pending',
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create task');
      }
      
      return { success: true, task };
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
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
  .mutation(async ({ input }: { input: UpdateTaskInput }) => {
    try {
      console.log('Updating task:', input);
      
      if (!input.title && !input.description && !input.status && !input.priority && !input.dueDate) {
        throw new Error('No fields to update');
      }
      
      const updates: any = {};
      if (input.title) updates.title = input.title;
      if (input.description) updates.description = input.description;
      if (input.status) updates.status = input.status;
      if (input.priority) updates.priority = input.priority;
      if (input.dueDate) updates.due_date = input.dueDate;
      
      const { data: task, error } = await database.tasks.update(input.id, updates);
      
      if (error) {
        throw new Error(error.message || 'Failed to update task');
      }
      
      return { success: true, task };
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  });

export const deleteTaskProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }: { input: DeleteTaskInput }) => {
    try {
      console.log('Deleting task:', input.id);
      
      const { error } = await database.tasks.delete(input.id);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete task');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  });

export const getTaskStatsProcedure = publicProcedure
  .input(z.object({
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
  }).optional())
  .query(async ({ input }: { input?: TaskStatsInput | undefined }) => {
    try {
      console.log('Fetching task stats:', input);
      
      let query = database.tasks.getAll();
      
      if (input?.assignedTo) {
        query = database.tasks.getByAssignee(input.assignedTo);
      }
      
      const { data: tasks, error } = await query;
      
      if (error) {
        console.error('Error fetching tasks for stats:', error);
        return {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          overdue: 0,
          byPriority: { high: 0, medium: 0, low: 0 },
        };
      }
      
      let filteredTasks = tasks || [];
      
      if (input?.createdBy) {
        filteredTasks = filteredTasks.filter(task => task.created_by === input.createdBy);
      }
      
      const now = new Date();
      
      return {
        total: filteredTasks.length,
        pending: filteredTasks.filter((t) => t.status === 'pending').length,
        inProgress: filteredTasks.filter((t) => t.status === 'in_progress').length,
        completed: filteredTasks.filter((t) => t.status === 'completed').length,
        cancelled: filteredTasks.filter((t) => t.status === 'cancelled').length,
        overdue: filteredTasks.filter((t) => 
          t.status !== 'completed' && 
          t.status !== 'cancelled' && 
          t.due_date && 
          new Date(t.due_date) < now
        ).length,
        byPriority: {
          high: filteredTasks.filter((t) => t.priority === 'high').length,
          medium: filteredTasks.filter((t) => t.priority === 'medium').length,
          low: filteredTasks.filter((t) => t.priority === 'low').length,
        },
      };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw new Error('Failed to fetch task stats');
    }
  });