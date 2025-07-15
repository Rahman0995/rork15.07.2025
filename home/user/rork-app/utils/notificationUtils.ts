import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationType } from '@/store/notificationsStore';

export interface NotificationConfig {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: boolean;
  priority?: 'default' | 'high' | 'max';
  categoryId?: string;
}

export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    task_assigned: '📋',
    task_due: '⏰',
    report_created: '📄',
    report_approved: '✅',
    report_rejected: '❌',
    report_revision_requested: '🔄',
    report_revised: '📝',
    chat_message: '💬',
  };
  
  return iconMap[type] || '📢';
};

export const getNotificationColor = (type: NotificationType): string => {
  const colorMap: Record<NotificationType, string> = {
    task_assigned: '#2196F3',
    task_due: '#FF9800',
    report_created: '#4CAF50',
    report_approved: '#4CAF50',
    report_rejected: '#F44336',
    report_revision_requested: '#FF9800',
    report_revised: '#2196F3',
    chat_message: '#9C27B0',
  };
  
  return colorMap[type] || '#757575';
};

export const formatNotificationTitle = (type: NotificationType, data?: any): string => {
  const icon = getNotificationIcon(type);
  
  const titleMap: Record<NotificationType, string> = {
    task_assigned: `${icon} Новая задача`,
    task_due: `${icon} Срок выполнения задачи`,
    report_created: `${icon} Новый отчет`,
    report_approved: `${icon} Отчет утвержден`,
    report_rejected: `${icon} Отчет отклонен`,
    report_revision_requested: `${icon} Требуется доработка`,
    report_revised: `${icon} Отчет доработан`,
    chat_message: `${icon} Новое сообщение`,
  };
  
  return titleMap[type] || `${icon} Уведомление`;
};

export const scheduleLocalNotification = async (config: NotificationConfig): Promise<string | null> => {
  if (Platform.OS === 'web') {
    console.log('Local notifications not supported on web');
    return null;
  }
  
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        data: config.data,
        sound: config.sound !== false,
        badge: config.badge !== false ? 1 : undefined,
        priority: config.priority === 'high' ? Notifications.AndroidNotificationPriority.HIGH : 
                 config.priority === 'max' ? Notifications.AndroidNotificationPriority.MAX :
                 Notifications.AndroidNotificationPriority.DEFAULT,
        categoryIdentifier: config.categoryId,
      },
      trigger: null, // Show immediately
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const scheduleDelayedNotification = async (
  config: NotificationConfig,
  delaySeconds: number
): Promise<string | null> => {
  if (Platform.OS === 'web') {
    console.log('Delayed notifications not supported on web');
    return null;
  }
  
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        data: config.data,
        sound: config.sound !== false,
        badge: config.badge !== false ? 1 : undefined,
      },
      trigger: {
        seconds: delaySeconds,
      } as any,
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling delayed notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const getBadgeCount = async (): Promise<number> => {
  if (Platform.OS === 'web') return 0;
  
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
};

export const setBadgeCount = async (count: number): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

export const clearBadge = async (): Promise<void> => {
  await setBadgeCount(0);
};

export const createNotificationCategories = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.setNotificationCategoryAsync('task', [
      {
        identifier: 'mark_complete',
        buttonTitle: 'Выполнено',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'view_task',
        buttonTitle: 'Открыть',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
    
    await Notifications.setNotificationCategoryAsync('report', [
      {
        identifier: 'approve',
        buttonTitle: 'Утвердить',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'view_report',
        buttonTitle: 'Открыть',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
    
    await Notifications.setNotificationCategoryAsync('chat', [
      {
        identifier: 'reply',
        buttonTitle: 'Ответить',
        textInput: {
          submitButtonTitle: 'Отправить',
          placeholder: 'Введите сообщение...',
        },
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'view_chat',
        buttonTitle: 'Открыть',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  } catch (error) {
    console.error('Error creating notification categories:', error);
  }
};

export const handleNotificationResponse = (response: Notifications.NotificationResponse): void => {
  const { notification, actionIdentifier } = response;
  const { data } = notification.request.content;
  
  console.log('Notification response:', { actionIdentifier, data });
  
  switch (actionIdentifier) {
    case 'mark_complete':
      // Handle task completion
      if (data?.taskId) {
        // Navigate to task or update task status
        console.log('Mark task complete:', data.taskId);
      }
      break;
      
    case 'approve':
      // Handle report approval
      if (data?.reportId) {
        console.log('Approve report:', data.reportId);
      }
      break;
      
    case 'reply':
      // Handle chat reply
      if (data?.chatId && response.userText) {
        console.log('Reply to chat:', data.chatId, response.userText);
      }
      break;
      
    case 'view_task':
    case 'view_report':
    case 'view_chat':
      // Handle navigation to specific screen
      console.log('Navigate to:', actionIdentifier, data);
      break;
      
    default:
      // Default action (tap notification)
      console.log('Default notification action:', data);
      break;
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('Notification permissions not required on web');
    return true;
  }
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const getNotificationSettings = async () => {
  if (Platform.OS === 'web') {
    return {
      allowsAlert: true,
      allowsBadge: true,
      allowsSound: true,
    };
  }
  
  try {
    const settings = await Notifications.getPermissionsAsync();
    return {
      allowsAlert: settings.ios?.allowsAlert ?? settings.android?.importance !== undefined,
      allowsBadge: settings.ios?.allowsBadge ?? true,
      allowsSound: settings.ios?.allowsSound ?? true,
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      allowsAlert: false,
      allowsBadge: false,
      allowsSound: false,
    };
  }
};