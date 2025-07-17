import { create } from 'zustand';
import { Task, TaskStatus } from '@/types';
import { trpcClient } from '@/lib/trpc';
import { useNotificationsStore } from './notificationsStore';
import { mockTasks } from '@/constants/mockData';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  getUserTasks: (userId: string) => Task[];
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: 'low' | 'medium' | 'high') => Task[];
  getOverdueTasks: () => Task[];
  getTasksAssignedBy: (userId: string) => Task[];
  searchTasks: (query: string) => Task[];
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
  tasks: mockTasks,
  isLoading: false,
  error: null,
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await trpcClient.tasks.getAll.query();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.warn('Failed to fetch tasks from backend, using mock data:', error);
      set({ tasks: mockTasks, isLoading: false });
    }
  },
  getTaskById: (id: string) => {
    return get().tasks.find(task => task.id === id);
  },
  createTask: async (taskData) => {
    console.log('Creating task:', taskData);
    set({ isLoading: true, error: null });
    try {
      const newTask = await trpcClient.tasks.create.mutate({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate,
      });
      
      set(state => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false,
      }));
      
      console.log('Task created successfully:', newTask);
      
      // Create notification for assigned user
      try {
        const { createNotification, scheduleTaskReminder } = useNotificationsStore.getState();
        await createNotification({
          type: 'task_assigned',
          title: 'Новая задача',
          body: `Вам назначена задача: ${newTask.title}`,
          userId: newTask.assignedTo,
          read: false,
          data: { taskId: newTask.id }
        });
        
        // Schedule reminder
        await scheduleTaskReminder(newTask.id, newTask.title, newTask.dueDate);
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError);
        // Don't fail the task creation if notification fails
      }
      
    } catch (error) {
      console.error('Error creating task:', error);
      set({ error: 'Ошибка при создании задачи', isLoading: false });
      throw error; // Re-throw to handle in component
    }
  },
  updateTaskStatus: async (id: string, status: TaskStatus) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedTasks = get().tasks.map(task => {
        if (task.id === id) {
          const updatedTask = { ...task, status };
          if (status === 'completed' && !task.completedAt) {
            updatedTask.completedAt = new Date().toISOString();
          }
          return updatedTask;
        }
        return task;
      });
      
      set({ tasks: updatedTasks, isLoading: false });
      
      // Cancel reminder if task is completed or cancelled
      if (status === 'completed' || status === 'cancelled') {
        try {
          const { cancelTaskReminder } = useNotificationsStore.getState();
          await cancelTaskReminder(id);
        } catch (notificationError) {
          console.warn('Failed to cancel task reminder:', notificationError);
        }
      }
      
    } catch (error) {
      set({ error: 'Ошибка при обновлении статуса задачи', isLoading: false });
    }
  },
  getUserTasks: (userId: string) => {
    return get().tasks.filter(task => task.assignedTo === userId);
  },
  
  updateTask: async (id: string, updates: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Ошибка при обновлении задачи', isLoading: false });
    }
  },
  
  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } catch (error) {
      set({ error: 'Ошибка при удалении задачи', isLoading: false });
    }
  },
  
  getTasksByStatus: (status: TaskStatus) => {
    return get().tasks.filter(task => task.status === status);
  },
  
  getTasksByPriority: (priority: 'low' | 'medium' | 'high') => {
    return get().tasks.filter(task => task.priority === priority);
  },
  
  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter(task => 
      task.status !== 'completed' && 
      task.status !== 'cancelled' && 
      new Date(task.dueDate) < now
    );
  },
  
  getTasksAssignedBy: (userId: string) => {
    return get().tasks.filter(task => task.createdBy === userId);
  },
  
  searchTasks: (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return get().tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery)
    );
  },
  
  getTasksStats: () => {
    const tasks = get().tasks;
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
        new Date(t.dueDate) < now
      ).length,
    };
  },
}));