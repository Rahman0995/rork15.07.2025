import { z } from 'zod';
import { publicProcedure } from '../../../../../backend/trpc/create-context';
import { Task, TaskStatus, TaskPriority } from '../../../../../types';

// Input schemas
const getTasksInputSchema = z.object({
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
}).optional();

export const getTasksProcedure = publicProcedure
  .input(getTasksInputSchema)
  .query(async ({ input }: { input?: z.infer<typeof getTasksInputSchema> }) => {
    try {
      console.log('Fetching tasks with filters:', input);
      
      // Mock task data
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Complete Security Report',
          description: 'Prepare and submit the monthly security assessment report.',
          assignedTo: input?.assignedTo || 'user-2',
          createdBy: input?.createdBy || 'user-1',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: input?.status || 'pending',
          priority: input?.priority || 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Equipment Inspection',
          description: 'Conduct routine inspection of all equipment in the unit.',
          assignedTo: input?.assignedTo || 'user-3',
          createdBy: input?.createdBy || 'user-1',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      return mockTasks.filter((t) => {
        if (input?.assignedTo && t.assignedTo !== input.assignedTo) return false;
        if (input?.createdBy && t.createdBy !== input.createdBy) return false;
        if (input?.status && t.status !== input.status) return false;
        if (input?.priority && t.priority !== input.priority) return false;
        return true;
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  });

const getTaskByIdInputSchema = z.object({
  id: z.string(),
});

export const getTaskByIdProcedure = publicProcedure
  .input(getTaskByIdInputSchema)
  .query(async ({ input }: { input: z.infer<typeof getTaskByIdInputSchema> }) => {
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

const createTaskInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  assignedTo: z.string(),
  createdBy: z.string(),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const createTaskProcedure = publicProcedure
  .input(createTaskInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof createTaskInputSchema> }) => {
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

const updateTaskInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskProcedure = publicProcedure
  .input(updateTaskInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof updateTaskInputSchema> }) => {
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
        status: (input.status as TaskStatus) || 'pending',
        priority: (input.priority as TaskPriority) || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  });

const deleteTaskInputSchema = z.object({
  id: z.string(),
});

export const deleteTaskProcedure = publicProcedure
  .input(deleteTaskInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof deleteTaskInputSchema> }) => {
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

const getTaskStatsInputSchema = z.object({
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
}).optional();

export const getTaskStatsProcedure = publicProcedure
  .input(getTaskStatsInputSchema)
  .query(async ({ input }: { input?: z.infer<typeof getTaskStatsInputSchema> }) => {
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
          low: mockTasks.filter((t) => t.priority === 'low').length,
        },
      };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw new Error('Failed to fetch task stats');
    }
  });