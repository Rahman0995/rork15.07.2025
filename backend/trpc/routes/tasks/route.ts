import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { Task, TaskStatus } from '@/types';
import { getConnection } from '../../../database/index';

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
      const connection = getConnection();
      
      let query = 'SELECT * FROM tasks WHERE 1=1';
      const params: any[] = [];
      
      if (input?.assignedTo) {
        query += ' AND assigned_to = ?';
        params.push(input.assignedTo);
      }
      
      if (input?.createdBy) {
        query += ' AND created_by = ?';
        params.push(input.createdBy);
      }
      
      if (input?.status) {
        query += ' AND status = ?';
        params.push(input.status);
      }
      
      if (input?.priority) {
        query += ' AND priority = ?';
        params.push(input.priority);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const stmt = connection.prepare(query);
      const rows = stmt.all(...params) as any[];
      const tasks = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        assignedTo: row.assigned_to,
        createdBy: row.created_by,
        dueDate: row.due_date,
        status: row.status,
        priority: row.priority,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      
      return tasks;
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
      
      // Mock task data
      const mockTask: Task = {
        id: input.id,
        title: 'Mock Task',
        description: 'This is a mock task for development.',
        assignedTo: 'user-2',
        createdBy: 'user-1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return mockTask;
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
      
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newTask: Task = {
        id: taskId,
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
      
      return { success: true, task: newTask };
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
      
      const updatedTask: Task = {
        id: input.id,
        title: input.title || 'Mock Task',
        description: input.description || 'Mock description',
        assignedTo: 'user-2',
        createdBy: 'user-1',
        dueDate: input.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: input.status || 'pending',
        priority: input.priority || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return { success: true, task: updatedTask };
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
      
      const deletedTask: Task = {
        id: input.id,
        title: 'Deleted Mock Task',
        description: 'This task was deleted',
        assignedTo: 'user-2',
        createdBy: 'user-1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return { success: true, deletedTask };
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
      
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Mock Task',
          description: 'Mock description',
          assignedTo: input?.assignedTo || 'user-2',
          createdBy: input?.createdBy || 'user-1',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Completed Task',
          description: 'This task is completed',
          assignedTo: input?.assignedTo || 'user-3',
          createdBy: input?.createdBy || 'user-1',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      return {
        total: mockTasks.length,
        pending: mockTasks.filter((t) => t.status === 'pending').length,
        inProgress: mockTasks.filter((t) => t.status === 'in_progress').length,
        completed: mockTasks.filter((t) => t.status === 'completed').length,
        cancelled: mockTasks.filter((t) => t.status === 'cancelled').length,
        overdue: mockTasks.filter((t) => 
          t.status !== 'completed' && 
          t.status !== 'cancelled' && 
          new Date(t.dueDate) < new Date()
        ).length,
        byPriority: {
          high: mockTasks.filter((t) => t.priority === 'high').length,
          medium: mockTasks.filter((t) => t.priority === 'medium').length,
          low: mockTasks.filter((t: Task) => t.priority === 'low').length,
        },
      };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw new Error('Failed to fetch task stats');
    }
  });