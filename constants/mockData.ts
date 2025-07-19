import { User, Report, ChatMessage, Task, ReportComment } from '@/types';

// PRODUCTION READY - All mock data removed for server deployment
// These arrays are now empty and will be populated from the backend

export const mockUsers: User[] = [];

export const mockReports: Report[] = [];

export const mockTasks: Task[] = [];

export const mockChatMessages: Record<string, ChatMessage[]> = {};

export const mockChats = [];

// Utility functions - now return empty arrays since we're using real backend data
export const getUser = (id: string): User | undefined => {
  return undefined; // Will be fetched from backend
};

export const getReport = (id: string): Report | undefined => {
  return undefined; // Will be fetched from backend
};

export const getTask = (id: string): Task | undefined => {
  return undefined; // Will be fetched from backend
};

export const getUserTasks = (userId: string): Task[] => {
  return []; // Will be fetched from backend
};

export const getUserReports = (userId: string): Report[] => {
  return []; // Will be fetched from backend
};

export const getUnitReports = (unit: string): Report[] => {
  return []; // Will be fetched from backend
};

export const getUnitUsers = (unit: string): User[] => {
  return []; // Will be fetched from backend
};

export const getChatMessages = (chatId: string): ChatMessage[] => {
  return []; // Will be fetched from backend
};

export const getUserChats = (userId: string) => {
  return []; // Will be fetched from backend
};

// Export report comments separately for backend routes
export const mockReportComments: ReportComment[] = [];