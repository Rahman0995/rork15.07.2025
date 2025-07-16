import { z } from 'zod';
import { publicProcedure } from '../../create-context';

const mockNotifications = [
  {
    id: '1',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: Equipment Check',
    type: 'task' as const,
    userId: '1',
    read: false,
    createdAt: new Date().toISOString(),
    data: { taskId: '1' },
  },
  {
    id: '2',
    title: 'Report Approved',
    message: 'Your security report has been approved',
    type: 'report' as const,
    userId: '1',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    data: { reportId: '1' },
  },
  {
    id: '3',
    title: 'New Message',
    message: 'You have a new message from Manager',
    type: 'chat' as const,
    userId: '1',
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    data: { chatId: '1' },
  },
];

export const getNotificationsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    read: z.boolean().optional(),
    type: z.enum(['task', 'report', 'chat', 'system']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let notifications = mockNotifications.filter(n => n.userId === input.userId);
    
    if (input.read !== undefined) {
      notifications = notifications.filter(n => n.read === input.read);
    }
    
    if (input.type) {
      notifications = notifications.filter(n => n.type === input.type);
    }
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (input.offset || input.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 20;
      notifications = notifications.slice(offset, offset + limit);
    }
    
    return {
      notifications,
      total: mockNotifications.filter(n => n.userId === input.userId).length,
    };
  });

export const markNotificationAsReadProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    userId: z.string(),
  }))
  .mutation(({ input }) => {
    const notification = mockNotifications.find(n => n.id === input.id && n.userId === input.userId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    notification.read = true;
    return { success: true };
  });

export const markAllNotificationsAsReadProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(({ input }) => {
    const userNotifications = mockNotifications.filter(n => n.userId === input.userId);
    let updatedCount = 0;
    
    userNotifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        updatedCount++;
      }
    });
    
    return { success: true, updatedCount };
  });

export const createNotificationProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    message: z.string(),
    type: z.enum(['task', 'report', 'chat', 'system']),
    userId: z.string(),
    data: z.record(z.string(), z.unknown()).optional(),
  }))
  .mutation(({ input }) => {
    const newNotification = {
      id: `notification_${Date.now()}`,
      title: input.title,
      message: input.message,
      type: input.type,
      userId: input.userId,
      read: false,
      createdAt: new Date().toISOString(),
      data: input.data || {},
    };
    
    mockNotifications.push(newNotification as any);
    return newNotification;
  });

export const deleteNotificationProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    userId: z.string(),
  }))
  .mutation(({ input }) => {
    const notificationIndex = mockNotifications.findIndex(n => 
      n.id === input.id && n.userId === input.userId
    );
    
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }
    
    const deletedNotification = mockNotifications.splice(notificationIndex, 1)[0];
    return { success: true, deletedNotification };
  });

export const getUnreadCountProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }) => {
    const unreadCount = mockNotifications.filter(n => 
      n.userId === input.userId && !n.read
    ).length;
    
    return { unreadCount };
  });