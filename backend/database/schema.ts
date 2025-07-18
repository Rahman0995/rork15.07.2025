import { mysqlTable, varchar, text, int, boolean, timestamp, bigint } from 'drizzle-orm/mysql-core';
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
export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  name: text('name'),
  isGroup: integer('is_group', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Chat participants table
export const chatParticipants = sqliteTable('chat_participants', {
  id: text('id').primaryKey(),
  chatId: text('chat_id').notNull().references(() => chats.id),
  userId: text('user_id').notNull().references(() => users.id),
  joinedAt: text('joined_at').default(sql`CURRENT_TIMESTAMP`),
});

// Chat messages table
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id').notNull().references(() => chats.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  text: text('text'),
  type: text('type').notNull().default('text'),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Calendar events table
export const calendarEvents = sqliteTable('calendar_events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('scheduled'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  location: text('location'),
  organizer: text('organizer').notNull().references(() => users.id),
  unit: text('unit').notNull(),
  color: text('color'),
  isAllDay: integer('is_all_day', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Event participants table
export const eventParticipants = sqliteTable('event_participants', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => calendarEvents.id),
  userId: text('user_id').notNull().references(() => users.id),
  status: text('status').default('invited'), // invited, accepted, declined
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Attachments table
export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  url: text('url').notNull(),
  size: integer('size'),
  duration: integer('duration'), // for voice messages
  entityType: text('entity_type').notNull(), // 'report', 'message', 'comment'
  entityId: text('entity_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Report comments table
export const reportComments = sqliteTable('report_comments', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id),
  authorId: text('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  isRevision: integer('is_revision', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Report approvals table
export const reportApprovals = sqliteTable('report_approvals', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id),
  approverId: text('approver_id').notNull().references(() => users.id),
  status: text('status').notNull(),
  comment: text('comment'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Report revisions table
export const reportRevisions = sqliteTable('report_revisions', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id),
  version: integer('version').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  authorId: text('author_id').notNull().references(() => users.id),
  changes: text('changes'),
  comment: text('comment'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  data: text('data'), // JSON string for additional data
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User activity log table - to track all user actions
export const userActivityLog = sqliteTable('user_activity_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'view', 'login', 'logout'
  entityType: text('entity_type').notNull(), // 'report', 'task', 'message', 'event', 'user'
  entityId: text('entity_id'),
  details: text('details'), // JSON string with additional details
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User sessions table
export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  deviceInfo: text('device_info'),
  ipAddress: text('ip_address'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastActivity: text('last_activity').default(sql`CURRENT_TIMESTAMP`),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(),
});