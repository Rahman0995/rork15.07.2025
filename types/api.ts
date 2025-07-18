// This file contains type definitions for the API
// Using any types since we can't import from backend due to Metro config

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Simple AppRouter type for client-side usage
export type AppRouter = {
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

// Type inference helpers (will be any due to AppRouter being any)
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;