import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type NotificationType = 'task_assigned' | 'task_due' | 'report_created' | 'report_approved' | 'report_rejected' | 'report_revision_requested' | 'report_revised' | 'chat_message';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface NotificationSettings {
  taskAssigned: boolean;
  taskDue: boolean;
  reportCreated: boolean;
  reportApproved: boolean;
  reportRejected: boolean;
  reportRevisionRequested: boolean;
  reportRevised: boolean;
  chatMessage: boolean;
  pushEnabled: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  expoPushToken: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  createNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  getUnreadCount: (userId: string) => number;
  registerForPushNotifications: () => Promise<void>;
  scheduleTaskReminder: (taskId: string, title: string, dueDate: string) => Promise<void>;
  cancelTaskReminder: (taskId: string) => Promise<void>;
}

const defaultSettings: NotificationSettings = {
  taskAssigned: true,
  taskDue: true,
  reportCreated: true,
  reportApproved: true,
  reportRejected: true,
  reportRevisionRequested: true,
  reportRevised: true,
  chatMessage: true,
  pushEnabled: true,
};

// Configure notification handler
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: defaultSettings,
      isLoading: false,
      error: null,
      expoPushToken: null,
      
      fetchNotifications: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, this would fetch from API
          const mockNotifications: AppNotification[] = [
            {
              id: '1',
              type: 'task_assigned',
              title: 'Новая задача',
              body: 'Вам назначена задача: Подготовить отчет о состоянии техники',
              read: false,
              createdAt: new Date().toISOString(),
              userId,
              data: { taskId: '1' }
            },
            {
              id: '2',
              type: 'report_approved',
              title: 'Отчет утвержден',
              body: 'Ваш отчет "Отчет о проведении учений" был утвержден',
              read: false,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              userId,
              data: { reportId: '1' }
            },
          ];
          
          set({ 
            notifications: mockNotifications.filter(n => n.userId === userId),
            isLoading: false 
          });
        } catch (error) {
          set({ error: 'Ошибка при загрузке уведомлений', isLoading: false });
        }
      },
      
      createNotification: async (notificationData) => {
        const newNotification: AppNotification = {
          id: `${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...notificationData,
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications],
        }));
        
        // Send push notification if enabled
        const { settings } = get();
        if (Platform.OS !== 'web' && settings.pushEnabled) {
          // Map notification types to setting keys
          const typeToSettingMap: Record<NotificationType, keyof NotificationSettings> = {
            'task_assigned': 'taskAssigned',
            'task_due': 'taskDue',
            'report_created': 'reportCreated',
            'report_approved': 'reportApproved',
            'report_rejected': 'reportRejected',
            'report_revision_requested': 'reportRevisionRequested',
            'report_revised': 'reportRevised',
            'chat_message': 'chatMessage',
          };
          
          const settingKey = typeToSettingMap[notificationData.type];
          if (settingKey && settings[settingKey]) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: notificationData.title,
                body: notificationData.body,
                data: notificationData.data,
              },
              trigger: null,
            });
          }
        }
      },
      
      markAsRead: async (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        }));
      },
      
      markAllAsRead: async (userId: string) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.userId === userId
              ? { ...notification, read: true }
              : notification
          ),
        }));
      },
      
      deleteNotification: async (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== notificationId),
        }));
      },
      
      updateSettings: async (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      getUnreadCount: (userId: string) => {
        const { notifications } = get();
        return notifications.filter(n => n.userId === userId && !n.read).length;
      },
      
      registerForPushNotifications: async () => {
        if (Platform.OS === 'web') {
          console.log('Push notifications not supported on web');
          return;
        }
        
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          
          if (finalStatus !== 'granted') {
            throw new Error('Permission not granted for push notifications');
          }
          
          const token = (await Notifications.getExpoPushTokenAsync({
            projectId: '0bffb82a-ba27-4f8f-889a-624d89941f86'
          })).data;
          set({ expoPushToken: token });
          
          console.log('Push token:', token);
        } catch (error) {
          console.error('Error registering for push notifications:', error);
          set({ error: 'Ошибка при регистрации push-уведомлений' });
        }
      },
      
      scheduleTaskReminder: async (taskId: string, title: string, dueDate: string) => {
        if (Platform.OS === 'web') return;
        
        const { settings } = get();
        if (!settings.taskDue || !settings.pushEnabled) return;
        
        const dueDateObj = new Date(dueDate);
        const reminderDate = new Date(dueDateObj.getTime() - 24 * 60 * 60 * 1000); // 1 day before
        const now = new Date();
        
        if (reminderDate > now) {
          const secondsUntilReminder = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Напоминание о задаче',
              body: `Завтра истекает срок выполнения задачи: ${title}`,
              data: { taskId, type: 'task_reminder' },
            },
            trigger: {
              type: 'timeInterval',
              seconds: secondsUntilReminder,
            } as any,
            identifier: `task_reminder_${taskId}`,
          });
        }
      },
      
      cancelTaskReminder: async (taskId: string) => {
        if (Platform.OS === 'web') return;
        
        await Notifications.cancelScheduledNotificationAsync(`task_reminder_${taskId}`);
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        settings: state.settings,
        expoPushToken: state.expoPushToken,
      }),
    }
  )
);