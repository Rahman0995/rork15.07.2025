import { mysqlTable, varchar, text, int, boolean, timestamp, bigint, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rank: varchar('rank', { length: 100 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  avatar: text('avatar').notNull(),
  unit: varchar('unit', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Reports table
export const reports = mysqlTable('reports', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  authorId: varchar('author_id', { length: 255 }).notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  type: varchar('type', { length: 50 }).default('text'),
  unit: varchar('unit', { length: 255 }),
  priority: varchar('priority', { length: 50 }).default('medium'),
  dueDate: timestamp('due_date'),
  currentApprover: varchar('current_approver', { length: 255 }),
  currentRevision: int('current_revision').default(1),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Tasks table
export const tasks = mysqlTable('tasks', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  assignedTo: varchar('assigned_to', { length: 255 }).notNull().references(() => users.id),
  createdBy: varchar('created_by', { length: 255 }).notNull().references(() => users.id),
  dueDate: timestamp('due_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Chats table
export const chats = mysqlTable('chats', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  isGroup: boolean('is_group').notNull().default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Chat participants table
export const chatParticipants = mysqlTable('chat_participants', {
  id: varchar('id', { length: 255 }).primaryKey(),
  chatId: varchar('chat_id', { length: 255 }).notNull().references(() => chats.id),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').default(sql`CURRENT_TIMESTAMP`),
});

// Chat messages table
export const chatMessages = mysqlTable('chat_messages', {
  id: varchar('id', { length: 255 }).primaryKey(),
  chatId: varchar('chat_id', { length: 255 }).notNull().references(() => chats.id),
  senderId: varchar('sender_id', { length: 255 }).notNull().references(() => users.id),
  text: text('text'),
  type: varchar('type', { length: 50 }).notNull().default('text'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Calendar events table
export const calendarEvents = mysqlTable('calendar_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('scheduled'),
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date').notNull(),
  location: varchar('location', { length: 500 }),
  organizer: varchar('organizer', { length: 255 }).notNull().references(() => users.id),
  unit: varchar('unit', { length: 255 }).notNull(),
  color: varchar('color', { length: 20 }),
  isAllDay: boolean('is_all_day').notNull().default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Event participants table
export const eventParticipants = mysqlTable('event_participants', {
  id: varchar('id', { length: 255 }).primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull().references(() => calendarEvents.id),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).default('invited'), // invited, accepted, declined
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Attachments table
export const attachments = mysqlTable('attachments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  url: text('url').notNull(),
  size: bigint('size', { mode: 'number' }),
  duration: int('duration'), // for voice messages
  entityType: varchar('entity_type', { length: 100 }).notNull(), // 'report', 'message', 'comment'
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Report comments table
export const reportComments = mysqlTable('report_comments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  reportId: varchar('report_id', { length: 255 }).notNull().references(() => reports.id),
  authorId: varchar('author_id', { length: 255 }).notNull().references(() => users.id),
  content: text('content').notNull(),
  isRevision: boolean('is_revision').notNull().default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Report approvals table
export const reportApprovals = mysqlTable('report_approvals', {
  id: varchar('id', { length: 255 }).primaryKey(),
  reportId: varchar('report_id', { length: 255 }).notNull().references(() => reports.id),
  approverId: varchar('approver_id', { length: 255 }).notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Report revisions table
export const reportRevisions = mysqlTable('report_revisions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  reportId: varchar('report_id', { length: 255 }).notNull().references(() => reports.id),
  version: int('version').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull().references(() => users.id),
  authorId: varchar('author_id', { length: 255 }).notNull().references(() => users.id),
  changes: text('changes'),
  comment: text('comment'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Notifications table
export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  read: boolean('read').notNull().default(false),
  data: text('data'), // JSON string for additional data
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User activity log table - to track all user actions
export const userActivityLog = mysqlTable('user_activity_log', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  action: varchar('action', { length: 255 }).notNull(), // 'create', 'update', 'delete', 'view', 'login', 'logout'
  entityType: varchar('entity_type', { length: 100 }).notNull(), // 'report', 'task', 'message', 'event', 'user'
  entityId: varchar('entity_id', { length: 255 }),
  details: text('details'), // JSON string with additional details
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User sessions table
export const userSessions = mysqlTable('user_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  token: varchar('token', { length: 500 }).notNull().unique(),
  deviceInfo: text('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  isActive: boolean('is_active').notNull().default(true),
  lastActivity: timestamp('last_activity').default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp('expires_at').notNull(),
});