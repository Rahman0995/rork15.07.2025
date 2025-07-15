export type UserRole = 'battalion_commander' | 'company_commander' | 'officer' | 'soldier' | 'admin';

export interface User {
  id: string;
  name: string;
  rank: string;
  role: UserRole;
  avatar: string;
  unit: string;
  email: string;
  phone: string;
}

export type ReportStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_revision';
export type ReportType = 'text' | 'file' | 'video';

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'video';
  url: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorId: string;
  content: string;
  createdAt: string;
  isRevision: boolean;
  attachments?: Attachment[];
}

export interface ReportApproval {
  id: string;
  reportId: string;
  approverId: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  comment?: string;
  createdAt: string;
}

export interface ReportRevision {
  id: string;
  reportId: string;
  version: number;
  title: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  createdBy: string;
  authorId: string;
  changes?: string;
  comment?: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  type: ReportType;
  attachments: Attachment[];
  unit: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  approvers: string[]; // List of user IDs who can approve this report
  currentApprover?: string; // Current approver in the workflow
  approvals: ReportApproval[];
  comments: ReportComment[];
  revisions: ReportRevision[];
  currentRevision: number;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt?: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'voice';

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'voice';
  url: string;
  size?: number;
  duration?: number; // for voice messages in seconds
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  type: MessageType;
  attachment?: MessageAttachment;
  createdAt: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isGroup: boolean;
  name?: string;
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export type EventType = 'training' | 'meeting' | 'exercise' | 'inspection' | 'ceremony' | 'other';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
  participants: string[];
  isAllDay: boolean;
  createdAt: string;
  updatedAt: string;
  unit: string;
  color?: string;
}

export interface CalendarTask extends Task {
  startDate?: string;
  endDate?: string;
  isAllDay?: boolean;
}