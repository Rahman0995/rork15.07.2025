import { User, Report, ChatMessage, Task, ReportComment } from '@/types';

// PRODUCTION READY - Minimal mock data to prevent crashes during development
// Real data will be populated from the backend

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    rank: 'Полковник',
    role: 'battalion_commander',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    unit: 'Батальон А',
    email: 'admin@mil.ru',
    phone: '+7 (900) 123-45-67',
  }
];

export const mockReports: Report[] = [];

export const mockTasks: Task[] = [];

export const mockChatMessages: Record<string, ChatMessage[]> = {};

export const mockChats: any[] = [];

// Utility functions - minimal implementation to prevent crashes
export const getUser = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getReport = (id: string): Report | undefined => {
  return mockReports.find(report => report.id === id);
};

export const getTask = (id: string): Task | undefined => {
  return mockTasks.find(task => task.id === id);
};

export const getUserTasks = (userId: string): Task[] => {
  return mockTasks.filter(task => task.assignedTo === userId);
};

export const getUserReports = (userId: string): Report[] => {
  return mockReports.filter(report => report.authorId === userId);
};

export const getUnitReports = (unit: string): Report[] => {
  return mockReports.filter(report => report.unit === unit);
};

export const getUnitUsers = (unit: string): User[] => {
  return mockUsers.filter(user => user.unit === unit);
};

export const getChatMessages = (chatId: string): ChatMessage[] => {
  return mockChatMessages[chatId] || [];
};

export const getUserChats = (userId: string) => {
  return mockChats.filter(chat => 
    chat.participants?.includes(userId) || 
    (chat.isGroup && chat.participants?.includes(userId))
  );
};

// Export report comments separately for backend routes
export const mockReportComments: ReportComment[] = [];