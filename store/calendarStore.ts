import { create } from 'zustand';
import { CalendarEvent, CalendarTask, EventType, EventStatus } from '@/types';

interface CalendarStore {
  events: CalendarEvent[];
  tasks: CalendarTask[];
  selectedDate: string;
  viewMode: 'month' | 'week' | 'day';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  
  // Events
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  getEventsByDateRange: (startDate: string, endDate: string) => CalendarEvent[];
  getEventsByType: (type: EventType) => CalendarEvent[];
  getEventsByStatus: (status: EventStatus) => CalendarEvent[];
  getEventsByUnit: (unit: string) => CalendarEvent[];
  getUpcomingEvents: (days?: number) => CalendarEvent[];
  searchEvents: (query: string) => CalendarEvent[];
  
  // Tasks
  addTask: (task: Omit<CalendarTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<CalendarTask>) => void;
  deleteTask: (id: string) => void;
  getTasksByDate: (date: string) => CalendarTask[];
  getTasksByDateRange: (startDate: string, endDate: string) => CalendarTask[];
  getTasksByAssignee: (userId: string) => CalendarTask[];
  getOverdueTasks: () => CalendarTask[];
  
  // Combined
  getItemsByDate: (date: string) => (CalendarEvent | CalendarTask)[];
  getCalendarStats: () => {
    totalEvents: number;
    totalTasks: number;
    upcomingEvents: number;
    overdueTasks: number;
  };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Empty arrays for production - will be populated from backend
const mockEvents: CalendarEvent[] = [];
const mockTasks: CalendarTask[] = [];

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: mockEvents,
  tasks: mockTasks,
  selectedDate: new Date().toISOString().split('T')[0],
  viewMode: 'month',
  isLoading: false,
  error: null,
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Events
  addEvent: (eventData) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },
  
  updateEvent: (id, updates) => {
    set((state) => ({
      events: state.events.map(event => 
        event.id === id 
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    }));
  },
  
  deleteEvent: (id) => {
    set((state) => ({
      events: state.events.filter(event => event.id !== id)
    }));
  },
  
  getEventsByDate: (date) => {
    const { events } = get();
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === date;
    });
  },
  
  getEventsByDateRange: (startDate, endDate) => {
    const { events } = get();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= end && eventEnd >= start;
    });
  },
  
  // Tasks
  addTask: (taskData) => {
    const newTask: CalendarTask = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    }));
  },
  
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }));
  },
  
  getTasksByDate: (date) => {
    const { tasks } = get();
    return tasks.filter(task => {
      if (task.startDate) {
        const taskDate = new Date(task.startDate).toISOString().split('T')[0];
        return taskDate === date;
      }
      const dueDate = new Date(task.dueDate).toISOString().split('T')[0];
      return dueDate === date;
    });
  },
  
  getTasksByDateRange: (startDate, endDate) => {
    const { tasks } = get();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return tasks.filter(task => {
      const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.dueDate);
      const taskEnd = task.endDate ? new Date(task.endDate) : new Date(task.dueDate);
      return taskStart <= end && taskEnd >= start;
    });
  },
  
  // Additional event methods
  getEventsByType: (type) => {
    const { events } = get();
    return events.filter(event => event.type === type);
  },
  
  getEventsByStatus: (status) => {
    const { events } = get();
    return events.filter(event => event.status === status);
  },
  
  getEventsByUnit: (unit) => {
    const { events } = get();
    return events.filter(event => event.unit === unit);
  },
  
  getUpcomingEvents: (days = 7) => {
    const { events } = get();
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= now && eventDate <= futureDate;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },
  
  searchEvents: (query) => {
    const { events } = get();
    const lowercaseQuery = query.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description.toLowerCase().includes(lowercaseQuery) ||
      event.location?.toLowerCase().includes(lowercaseQuery)
    );
  },
  
  // Additional task methods
  getTasksByAssignee: (userId) => {
    const { tasks } = get();
    return tasks.filter(task => task.assignedTo === userId);
  },
  
  getOverdueTasks: () => {
    const { tasks } = get();
    const now = new Date();
    return tasks.filter(task => 
      task.status !== 'completed' && 
      task.status !== 'cancelled' && 
      new Date(task.dueDate) < now
    );
  },
  
  // Combined methods
  getItemsByDate: (date) => {
    const events = get().getEventsByDate(date);
    const tasks = get().getTasksByDate(date);
    return [...events, ...tasks].sort((a, b) => {
      const aDate = 'startDate' in a && a.startDate 
        ? new Date(a.startDate) 
        : 'dueDate' in a 
          ? new Date(a.dueDate) 
          : new Date();
      const bDate = 'startDate' in b && b.startDate 
        ? new Date(b.startDate) 
        : 'dueDate' in b 
          ? new Date(b.dueDate) 
          : new Date();
      return aDate.getTime() - bDate.getTime();
    });
  },
  
  getCalendarStats: () => {
    const { events, tasks } = get();
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      totalEvents: events.length,
      totalTasks: tasks.length,
      upcomingEvents: events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= now && eventDate <= nextWeek;
      }).length,
      overdueTasks: tasks.filter(task => 
        task.status !== 'completed' && 
        task.status !== 'cancelled' && 
        new Date(task.dueDate) < now
      ).length,
    };
  }
}));