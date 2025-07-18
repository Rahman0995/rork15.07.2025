// Database schema types - no longer using Drizzle ORM
export interface User {
  id: string;
  name: string;
  rank: string;
  role: string;
  avatar: string;
  unit: string;
  email: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  authorId: string;
  status: string;
  type?: string;
  unit?: string;
  priority?: string;
  dueDate?: Date;
  currentApprover?: string;
  currentRevision?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  dueDate: Date;
  status: string;
  priority: string;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Additional interfaces for other entities
export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  type: string;
  read: boolean;
  createdAt?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer: string;
  unit: string;
  color?: string;
  isAllDay: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: string;
  createdAt?: Date;
}