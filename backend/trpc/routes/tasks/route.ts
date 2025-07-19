import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { getConnection } from '../../database';
import { Task } from '../../database/schema';
import { config } from '../../config';

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
      
      const [rows] = await connection.execute(query, params);
      return rows as Task[];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      if (config.development.mockData) {
        const mockTasks = [
          {
            id: 'task-1',
            title: 'Проверка оборудования',
            description: 'Провести плановую проверку всего оборудования.',
            assigned_to: 'user-2',
            created_by: 'user-1',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'pending',
            priority: 'high',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];
        
        let tasks = [...mockTasks];
        
        if (input?.assignedTo) {
          tasks = tasks.filter((t) => t.assigned_to === input.assignedTo);
        }
        
        if (input?.createdBy) {
          tasks = tasks.filter((t) => t.created_by === input.createdBy);
        }
        
        if (input?.status) {
          tasks = tasks.filter((t) => t.status === input.status);
        }
        
        if (input?.priority) {
          tasks = tasks.filter((t) => t.priority === input.priority);
        }
        
        return tasks;
      }
      
      throw new Error('Failed to fetch tasks');
    }
  });

export const getTaskByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ input }: { input: TaskByIdInput }) => {
    try {
      const connection = getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [input.id]
      );
      
      const tasks = rows as Task[];
      if (tasks.length === 0) {
        throw new Error('Task not found');
      }
      
      return tasks[0];
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      
      if (config.development.mockData) {
        return {
          id: input.id,
          title: 'Mock Task',
          description: 'This is a mock task for development.',
          assigned_to: 'user-2',
          created_by: 'user-1',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending',
          priority: 'medium',
          created_at: new Date(),
          updated_at: new Date(),
        };
      }
      
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
      const connection = getConnection();
      
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await connection.execute(
        'INSERT INTO tasks (id, title, description, assigned_to, created_by, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          taskId,
          input.title,
          input.description,
          input.assignedTo,
          input.createdBy,
          input.dueDate,
          'pending',
          input.priority || 'medium',
        ]
      );
      
      // Fetch the created task
      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [taskId]
      );
      
      const tasks = rows as Task[];
      return { success: true, task: tasks[0] };
    } catch (error) {
      console.error('Error creating task:', error);
      
      if (config.development.mockData) {
        const newTask = {
          id: `task-${Date.now()}`,
          title: input.title,
          description: input.description,
          assigned_to: input.assignedTo,
          created_by: input.createdBy,
          due_date: input.dueDate,
          status: 'pending',
          priority: input.priority || 'medium',
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        return { success: true, task: newTask };
      }
      
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
      const connection = getConnection();
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (input.title) {
        updateFields.push('title = ?');
        updateValues.push(input.title);
      }
      if (input.description) {
        updateFields.push('description = ?');
        updateValues.push(input.description);
      }
      if (input.status) {
        updateFields.push('status = ?');
        updateValues.push(input.status);
      }
      if (input.priority) {
        updateFields.push('priority = ?');
        updateValues.push(input.priority);
      }
      if (input.dueDate) {
        updateFields.push('due_date = ?');
        updateValues.push(input.dueDate);
      }
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(input.id);
      
      const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.execute(query, updateValues);
      
      // Fetch and return updated task
      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [input.id]
      );
      
      const tasks = rows as Task[];
      if (tasks.length === 0) {
        throw new Error('Task not found after update');
      }
      
      return { success: true, task: tasks[0] };
    } catch (error) {
      console.error('Error updating task:', error);
      
      if (config.development.mockData) {
        const updatedTask = {
          id: input.id,
          title: input.title || 'Mock Task',
          description: input.description || 'Mock description',
          assigned_to: 'user-2',
          created_by: 'user-1',
          due_date: input.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: input.status || 'pending',
          priority: input.priority || 'medium',
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        return { success: true, task: updatedTask };
      }
      
      throw new Error('Failed to update task');
    }
  });

export const deleteTaskProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }: { input: DeleteTaskInput }) => {
    try {
      const connection = getConnection();
      
      // First fetch the task to return it
      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [input.id]
      );
      
      const tasks = rows as Task[];
      if (tasks.length === 0) {
        throw new Error('Task not found');
      }
      
      const deletedTask = tasks[0];
      
      // Delete the task
      await connection.execute('DELETE FROM tasks WHERE id = ?', [input.id]);
      
      return { success: true, deletedTask };
    } catch (error) {
      console.error('Error deleting task:', error);
      
      if (config.development.mockData) {
        return {
          success: true,
          deletedTask: {
            id: input.id,
            title: 'Deleted Mock Task',
            description: 'This task was deleted',
            assigned_to: 'user-2',
            created_by: 'user-1',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'pending',
            priority: 'medium',
            created_at: new Date(),
            updated_at: new Date(),
          },
        };
      }
      
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
      
      const [rows] = await connection.execute(query, params);
      const tasks = rows as Task[];
      
      return {
        total: tasks.length,
        pending: tasks.filter((t: Task) => t.status === 'pending').length,
        inProgress: tasks.filter((t: Task) => t.status === 'in_progress').length,
        completed: tasks.filter((t: Task) => t.status === 'completed').length,
        cancelled: tasks.filter((t: Task) => t.status === 'cancelled').length,
        overdue: tasks.filter((t: Task) => 
          t.status !== 'completed' && 
          t.status !== 'cancelled' && 
          new Date(t.dueDate) < new Date()
        ).length,
        byPriority: {
          high: tasks.filter((t: Task) => t.priority === 'high').length,
          medium: tasks.filter((t: Task) => t.priority === 'medium').length,
          low: tasks.filter((t: Task) => t.priority === 'low').length,
        },
      };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      
      if (config.development.mockData) {
        const mockTasks = [
          {
            id: 'task-1',
            title: 'Mock Task',
            description: 'Mock description',
            assigned_to: input?.assignedTo || 'user-2',
            created_by: input?.createdBy || 'user-1',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'pending',
            priority: 'medium',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];
        
        return {
          total: mockTasks.length,
          pending: mockTasks.filter((t: any) => t.status === 'pending').length,
          inProgress: mockTasks.filter((t: any) => t.status === 'in_progress').length,
          completed: mockTasks.filter((t: any) => t.status === 'completed').length,
          cancelled: mockTasks.filter((t: any) => t.status === 'cancelled').length,
          overdue: 0,
          byPriority: {
            high: 0,
            medium: mockTasks.length,
            low: 0,
          },
        };
      }
      
      throw new Error('Failed to fetch task stats');
    }
  });