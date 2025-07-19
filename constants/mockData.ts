import { User, Report, ChatMessage, Task, ReportComment } from '@/types';

// DEPRECATED - This file is kept for backward compatibility only
// All data is now fetched from the real backend database

console.warn('⚠️ mockData.ts is deprecated. Use real backend data instead.');

// Empty arrays - real data comes from backend
export const mockUsers: User[] = [];
export const mockReports: Report[] = [];
export const mockTasks: Task[] = [];
export const mockChatMessages: Record<string, ChatMessage[]> = {};
export const mockChats: any[] = [];
export const mockReportComments: ReportComment[] = [];

// Deprecated utility functions - use backend queries instead
export const getUser = (id: string): User | undefined => {
  console.warn('getUser() is deprecated. Use trpc.users.getById.query() instead.');
  return undefined;
};

export const getReport = (id: string): Report | undefined => {
  console.warn('getReport() is deprecated. Use trpc.reports.getById.query() instead.');
  return undefined;
};

export const getTask = (id: string): Task | undefined => {
  console.warn('getTask() is deprecated. Use trpc.tasks.getById.query() instead.');
  return undefined;
};

export const getUserTasks = (userId: string): Task[] => {
  console.warn('getUserTasks() is deprecated. Use trpc.tasks.getAll.query({ assignedTo: userId }) instead.');
  return [];
};

export const getUserReports = (userId: string): Report[] => {
  console.warn('getUserReports() is deprecated. Use trpc.reports.getAll.query({ authorId: userId }) instead.');
  return [];
};

export const getUnitReports = (unit: string): Report[] => {
  console.warn('getUnitReports() is deprecated. Use trpc.reports.getAll.query({ unit }) instead.');
  return [];
};

export const getUnitUsers = (unit: string): User[] => {
  console.warn('getUnitUsers() is deprecated. Use trpc.users.getByUnit.query({ unit }) instead.');
  return [];
};

export const getChatMessages = (chatId: string): ChatMessage[] => {
  console.warn('getChatMessages() is deprecated. Use trpc.chat.getMessages.query({ chatId }) instead.');
  return [];
};

export const getUserChats = (userId: string) => {
  console.warn('getUserChats() is deprecated. Use trpc.chat.getAll.query({ userId }) instead.');
  return [];
};