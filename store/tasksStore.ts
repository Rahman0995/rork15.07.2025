import { create } from 'zustand';
import { Task, TaskStatus } from '@/types';
import { trpcClient } from '@/lib/trpc';
import { useNotificationsStore } from './notificationsStore';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  getUserTasks: (userId: string) => Task[];
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: 'low' | 'medium' | 'high') => Task[];
  getOverdueTasks: () => Task[];
  getTasksAssignedBy: (userId: string) => Task[];
  searchTasks: (query: string) => Task[];
  clearTasks: () => void;
  getTasksStats: () => {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await trpcClient.tasks.getAll.query({});
      // Преобразуем данные из Supabase в формат frontend
      const transformedTasks = (tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to,
        createdBy: task.created_by,
        dueDate: task.due_date,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignedUser: task.assigned_to ? {
          id: task.assigned_to.id,
          name: `${task.assigned_to.first_name} ${task.assigned_to.last_name}`,
          avatar: task.assigned_to.avatar_url,
        } : undefined,
        createdByUser: task.created_by ? {
          id: task.created_by.id,
          name: `${task.created_by.first_name} ${task.created_by.last_name}`,
          avatar: task.created_by.avatar_url,
        } : undefined,
      }));
      set({ tasks: transformedTasks, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch tasks from backend:', error);
      set({ tasks: [], isLoading: false, error: 'Ошибка при загрузке задач' });
    }
  },
  getTaskById: (id: string) => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) return undefined;
    return tasks.find(task => task.id === id);
  },
  createTask: async (taskData) => {
    console.log('Creating task:', taskData);
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.tasks.create.mutate({
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        assignedTo: taskData.assignedTo || '550e8400-e29b-41d4-a716-446655440001',
        createdBy: taskData.createdBy || '550e8400-e29b-41d4-a716-446655440001',
        dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      if (result.success && result.task) {
        // Преобразуем данные из Supabase
        const transformedTask = {
          id: result.task.id,
          title: result.task.title,
          description: result.task.description || '',
          status: result.task.status,
          priority: result.task.priority,
          assignedTo: result.task.assigned_to,
          createdBy: result.task.created_by,
          dueDate: result.task.due_date,
          createdAt: result.task.created_at,
          updatedAt: result.task.updated_at,
          assignedUser: result.task.assigned_to ? {
            id: result.task.assigned_to.id,
            name: `${result.task.assigned_to.first_name} ${result.task.assigned_to.last_name}`,
            avatar: result.task.assigned_to.avatar_url,
          } : undefined,
          createdByUser: result.task.created_by ? {
            id: result.task.created_by.id,
            name: `${result.task.created_by.first_name} ${result.task.created_by.last_name}`,
            avatar: result.task.created_by.avatar_url,
          } : undefined,
        };
        
        set(state => ({
          tasks: [transformedTask, ...state.tasks],
          isLoading: false,
        }));
        
        // Create notification for assigned user
        try {
          const { createNotification, scheduleTaskReminder } = useNotificationsStore.getState();
          await createNotification({
            type: 'task_assigned',
            title: 'Новая задача',
            body: `Вам назначена задача: ${transformedTask.title}`,
            userId: transformedTask.assignedTo || '',
            read: false,
            data: { taskId: transformedTask.id }
          });
          
          await scheduleTaskReminder(transformedTask.id, transformedTask.title, transformedTask.dueDate);
        } catch (notificationError) {
          console.warn('Failed to create notification:', notificationError);
        }
      } else {
        throw new Error('Не удалось создать задачу');
      }
      
    } catch (error) {
      console.error('Error creating task:', error);
      set({ error: 'Ошибка при создании задачи', isLoading: false });
      throw error;
    }
  },
  addTask: (task) => {
    set(state => {
      const currentTasks = Array.isArray(state.tasks) ? state.tasks : [];
      return {
        tasks: [task, ...currentTasks],
      };
    });
  },
  updateTaskStatus: async (id: string, status: TaskStatus) => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.tasks.update.mutate({
        id,
        status,
      });
      
      if (result.success && result.task) {
        const transformedTask = {
          id: result.task.id,
          title: result.task.title,
          description: result.task.description || '',
          status: result.task.status,
          priority: result.task.priority,
          assignedTo: result.task.assigned_to,
          createdBy: result.task.created_by,
          dueDate: result.task.due_date,
          createdAt: result.task.created_at,
          updatedAt: result.task.updated_at,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          assignedUser: result.task.assigned_to ? {
            id: result.task.assigned_to.id,
            name: `${result.task.assigned_to.first_name} ${result.task.assigned_to.last_name}`,
            avatar: result.task.assigned_to.avatar_url,
          } : undefined,
          createdByUser: result.task.created_by ? {
            id: result.task.created_by.id,
            name: `${result.task.created_by.first_name} ${result.task.created_by.last_name}`,
            avatar: result.task.created_by.avatar_url,
          } : undefined,
        };
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? transformedTask : task
          ),
          isLoading: false,
        }));
        
        // Cancel reminder if task is completed or cancelled
        if (status === 'completed' || status === 'cancelled') {
          try {
            const { cancelTaskReminder } = useNotificationsStore.getState();
            await cancelTaskReminder(id);
          } catch (notificationError) {
            console.warn('Failed to cancel task reminder:', notificationError);
          }
        }
      }
      
    } catch (error) {
      console.error('Error updating task status:', error);
      set({ error: 'Ошибка при обновлении статуса задачи', isLoading: false });
    }
  },
  getUserTasks: (userId: string) => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.assignedTo === userId);
  },
  
  updateTask: async (id: string, updates: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.dueDate) updateData.dueDate = updates.dueDate;
      
      const result = await trpcClient.tasks.update.mutate({
        id,
        ...updateData,
      });
      
      if (result.success && result.task) {
        const transformedTask = {
          id: result.task.id,
          title: result.task.title,
          description: result.task.description || '',
          status: result.task.status,
          priority: result.task.priority,
          assignedTo: result.task.assigned_to,
          createdBy: result.task.created_by,
          dueDate: result.task.due_date,
          createdAt: result.task.created_at,
          updatedAt: result.task.updated_at,
          assignedUser: result.task.assigned_to ? {
            id: result.task.assigned_to.id,
            name: `${result.task.assigned_to.first_name} ${result.task.assigned_to.last_name}`,
            avatar: result.task.assigned_to.avatar_url,
          } : undefined,
          createdByUser: result.task.created_by ? {
            id: result.task.created_by.id,
            name: `${result.task.created_by.first_name} ${result.task.created_by.last_name}`,
            avatar: result.task.created_by.avatar_url,
          } : undefined,
        };
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? transformedTask : task
          ),
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: 'Ошибка при обновлении задачи', isLoading: false });
    }
  },
  
  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.tasks.delete.mutate({ id });
      
      if (result.success) {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id),
          isLoading: false,
        }));
        
        // Cancel reminder
        try {
          const { cancelTaskReminder } = useNotificationsStore.getState();
          await cancelTaskReminder(id);
        } catch (notificationError) {
          console.warn('Failed to cancel task reminder:', notificationError);
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: 'Ошибка при удалении задачи', isLoading: false });
    }
  },
  
  getTasksByStatus: (status: TaskStatus) => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.status === status);
  },
  
  getTasksByPriority: (priority: 'low' | 'medium' | 'high') => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.priority === priority);
  },
  
  getOverdueTasks: () => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) return [];
    const now = new Date();
    return tasks.filter(task => 
      task.status !== 'completed' && 
      task.status !== 'cancelled' && 
      task.dueDate && new Date(task.dueDate) < now
    );
  },
  
  getTasksAssignedBy: (userId: string) => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.createdBy === userId);
  },
  
  searchTasks: (query: string) => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) return [];
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      (task.description && task.description.toLowerCase().includes(lowercaseQuery))
    );
  },
  
  clearTasks: () => {
    set({ tasks: [] });
  },
  
  getTasksStats: () => {
    const tasks = get().tasks;
    if (!Array.isArray(tasks)) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
      };
    }
    
    const now = new Date();
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      overdue: tasks.filter(t => 
        t.status !== 'completed' && 
        t.status !== 'cancelled' && 
        t.dueDate && new Date(t.dueDate) < now
      ).length,
    };
  },
}));