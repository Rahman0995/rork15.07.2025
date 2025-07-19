import { Task, TaskStatus, TaskPriority, Report, ReportStatus, User, CalendarEvent, EventType, EventStatus, Chat, ChatMessage, MessageType } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Colonel Smith',
    rank: 'Colonel',
    role: 'battalion_commander',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    unit: '1st Battalion',
    email: 'colonel.smith@military.gov',
    phone: '+1-555-0101',
  },
  {
    id: 'user-2',
    name: 'Captain Johnson',
    rank: 'Captain',
    role: 'company_commander',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    unit: 'Alpha Company',
    email: 'captain.johnson@military.gov',
    phone: '+1-555-0102',
  },
  {
    id: 'user-3',
    name: 'Lieutenant Davis',
    rank: 'Lieutenant',
    role: 'officer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    unit: 'Bravo Company',
    email: 'lieutenant.davis@military.gov',
    phone: '+1-555-0103',
  },
  {
    id: 'user-4',
    name: 'Sergeant Wilson',
    rank: 'Sergeant',
    role: 'soldier',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    unit: 'Charlie Company',
    email: 'sergeant.wilson@military.gov',
    phone: '+1-555-0104',
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Security Report',
    description: 'Prepare and submit the monthly security assessment report for the base perimeter.',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Equipment Inspection',
    description: 'Conduct routine inspection of all equipment in Alpha Company.',
    assignedTo: 'user-3',
    createdBy: 'user-2',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Training Schedule Review',
    description: 'Review and approve the training schedule for next month.',
    assignedTo: 'user-1',
    createdBy: 'user-1',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    priority: 'low',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: 'report-1',
    title: 'Monthly Security Assessment',
    content: 'This report covers the security assessment for the month of January 2024...',
    authorId: 'user-2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    type: 'text',
    unit: 'Alpha Company',
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    approvers: ['user-1'],
    currentApprover: 'user-1',
  },
  {
    id: 'report-2',
    title: 'Equipment Status Report',
    content: 'Current status of all equipment in Bravo Company...',
    authorId: 'user-3',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    type: 'text',
    unit: 'Bravo Company',
    priority: 'medium',
    approvers: ['user-2'],
    currentApprover: 'user-2',
  },
];

// Mock Calendar Events
export const mockEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Morning Briefing',
    description: 'Daily morning briefing for all company commanders.',
    type: 'meeting',
    status: 'scheduled',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    location: 'Conference Room A',
    organizer: 'user-1',
    participants: ['user-1', 'user-2', 'user-3'],
    isAllDay: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unit: '1st Battalion',
    color: '#3B82F6',
  },
  {
    id: 'event-2',
    title: 'Combat Training Exercise',
    description: 'Field training exercise for Alpha and Bravo companies.',
    type: 'training',
    status: 'scheduled',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: 'Training Ground B',
    organizer: 'user-2',
    participants: ['user-2', 'user-3', 'user-4'],
    isAllDay: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unit: 'Alpha Company',
    color: '#10B981',
  },
];

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'user-1',
    text: 'Good morning everyone. Please review the security report by EOD.',
    type: 'text',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'user-2',
    text: 'Roger that, Colonel. Will have it ready by 1700 hours.',
    type: 'text',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-3',
    senderId: 'user-3',
    text: 'Equipment inspection completed. All systems operational.',
    type: 'text',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
  },
];

// Mock Chats
export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    participants: ['user-1', 'user-2', 'user-3'],
    lastMessage: mockChatMessages[2],
    unreadCount: 1,
    isGroup: true,
    name: 'Command Staff',
  },
  {
    id: 'chat-2',
    participants: ['user-1', 'user-2'],
    lastMessage: mockChatMessages[1],
    unreadCount: 0,
    isGroup: false,
  },
];