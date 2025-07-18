// This file contains type definitions for the API
// Using simplified types to avoid server-side dependencies

// Define a simplified AppRouter type that works with tRPC client
export type AppRouter = {
  _def: {
    _config: any;
    router: true;
    procedures: any;
    record: {
      example: {
        hi: any;
        getTasks: any;
        getReports: any;
        createTask: any;
        createReport: any;
      };
      auth: {
        login: any;
        logout: any;
        refreshToken: any;
        changePassword: any;
        resetPassword: any;
      };
      users: {
        getAll: any;
        getById: any;
        getByUnit: any;
        update: any;
        getCurrent: any;
      };
      reports: {
        getAll: any;
        getById: any;
        create: any;
        update: any;
        delete: any;
        addComment: any;
        approve: any;
        getForApproval: any;
      };
      tasks: {
        getAll: any;
        getById: any;
        create: any;
        update: any;
        delete: any;
        getStats: any;
      };
      chat: {
        getAll: any;
        getById: any;
        getMessages: any;
        sendMessage: any;
        markAsRead: any;
        create: any;
        delete: any;
        getUnreadCount: any;
      };
      calendar: {
        getEvents: any;
        getById: any;
        create: any;
        update: any;
        delete: any;
        getUpcoming: any;
      };
      notifications: {
        getAll: any;
        markAsRead: any;
        markAllAsRead: any;
        create: any;
        delete: any;
        getUnreadCount: any;
      };
      analytics: {
        getReportsAnalytics: any;
        getTasksAnalytics: any;
        getUserActivity: any;
        getDashboardStats: any;
      };
      media: {
        upload: any;
        getAll: any;
        getById: any;
        delete: any;
        generateUploadUrl: any;
        getStorageStats: any;
      };
    };
    lazy: boolean;
  };
  createCaller: any;
};

// Type inference helpers (simplified to avoid server dependencies)
export type RouterInputs = any;
export type RouterOutputs = any;

// Common API types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  unit?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdBy: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  type: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  createdAt: string;
  readBy: string[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  createdBy: string;
  attendees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  userId: string;
  read: boolean;
  createdAt: string;
}