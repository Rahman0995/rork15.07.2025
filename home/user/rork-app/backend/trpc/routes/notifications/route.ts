import { z } from 'zod';
import { publicProcedure } from '../../create-context';

type NotificationType = 'task_assigned' | 'report_approved' | 'report_rejected' | 'report_needs_revision' | 'message' | 'event_reminder' | 'system';
type NotificationPriority = 'low' | 'medium' | 'high';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// Mock данные для уведомлений
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Новая задача',
    message: 'Вам назначена новая задача: "Подготовить отчет о состоянии техники"',
    type: 'task_assigned',
    priority: 'high',
    read: false,
    createdAt: new Date(2025, 7, 15, 10, 30).toISOString(),
    data: { taskId: '1' },
  },
  {
    id: '2',
    userId: '3',
    title: 'Отчет одобрен',
    message: 'Ваш отчет "Отчет о проведении учений" был одобрен',
    type: 'report_approved',
    priority: 'medium',
    read: true,
    createdAt: new Date(2025, 7, 14, 16, 45).toISOString(),
    data: { reportId: '1' },
  },
  {
    id: '3',
    userId: '2',
    title: 'Требуется доработка',
    message: 'Отчет "Отчет о состоянии личного состава" требует доработки',
    type: 'report_needs_revision',
    priority: 'high',
    read: false,
    createdAt: new Date(2025, 7, 14, 14, 20).toISOString(),
    data: { reportId: '4' },
  },
  {
    id: '4',
    userId: '1',
    title: 'Новое сообщение',
    message: 'Майор Петров: "Техника проверена и готова к использованию."',
    type: 'message',
    priority: 'medium',
    read: false,
    createdAt: new Date(2025, 7, 14, 10, 30).toISOString(),
    data: { chatId: 'chat_1_2', messageId: '6' },
  },
  {
    id: '5',
    userId: '2',
    title: 'Напоминание о событии',
    message: 'Через 1 час: Совещание командиров в штабе батальона',
    type: 'event_reminder',
    priority: 'high',
    read: false,
    createdAt: new Date(2025, 7, 16, 9, 0).toISOString(),
    data: { eventId: '2' },
  },
  {
    id: '6',
    userId: '3',
    title: 'Системное уведомление',
    message: 'Плановое обновление системы запланировано на 22:00',
    type: 'system',
    priority: 'low',
    read: true,
    createdAt: new Date(2025, 7, 13, 18, 0).toISOString(),
  },
];

export const getNotificationsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    read: z.boolean().optional(),
    type: z.enum(['task_assigned', 'report_approved', 'report_rejected', 'report_needs_revision', 'message', 'event_reminder', 'system']).optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  }))
  .query(({ input }) => {
    let notifications = mockNotifications.filter(n => n.userId === input.userId);
    
    if (input.read !== undefined) {
      notifications = notifications.filter(n => n.read === input.read);
    }
    
    if (input.type) {
      notifications = notifications.filter(n => n.type === input.type);
    }
    
    // Сортировка по дате создания (новые первыми)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const paginatedNotifications = notifications.slice(input.offset, input.offset + input.limit);
    
    return {
      notifications: paginatedNotifications,
      total: notifications.length,
      unreadCount: mockNotifications.filter(n => n.userId === input.userId && !n.read).length,
    };
  });

export const markNotificationAsReadProcedure = publicProcedure
  .input(z.object({
    notificationId: z.string(),
    userId: z.string(),
  }))
  .mutation(({ input }) => {
    const notification = mockNotifications.find(n => 
      n.id === input.notificationId && n.userId === input.userId
    );
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    notification.read = true;
    return notification;
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
    userId: z.string(),
    title: z.string(),
    message: z.string(),
    type: z.enum(['task_assigned', 'report_approved', 'report_rejected', 'report_needs_revision', 'message', 'event_reminder', 'system']),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    data: z.record(z.any()).optional(),
  }))
  .mutation(({ input }) => {
    const newNotification: Notification = {
      id: `notification_${Date.now()}`,
      ...input,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    mockNotifications.push(newNotification);
    return newNotification;
  });

export const deleteNotificationProcedure = publicProcedure
  .input(z.object({
    notificationId: z.string(),
    userId: z.string(),
  }))
  .mutation(({ input }) => {
    const notificationIndex = mockNotifications.findIndex(n => 
      n.id === input.notificationId && n.userId === input.userId
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