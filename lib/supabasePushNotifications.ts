import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настройка push-уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const pushNotifications = {
  // Регистрация устройства для push-уведомлений
  registerForPushNotifications: async (userId: string) => {
    if (!supabase) {
      console.warn('Supabase не настроен');
      return null;
    }

    try {
      // Получаем разрешение на уведомления
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Разрешение на push-уведомления не получено');
        return null;
      }

      // Получаем push-токен
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Сохраняем токен в Supabase
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: userId,
          push_token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Ошибка сохранения push-токена:', error);
        return null;
      }

      return token;
    } catch (error) {
      console.error('Ошибка регистрации push-уведомлений:', error);
      return null;
    }
  },

  // Отправка push-уведомления
  sendPushNotification: async (userId: string, title: string, body: string, data?: any) => {
    if (!supabase) {
      console.warn('Supabase не настроен');
      return;
    }

    try {
      // Получаем push-токен пользователя
      const { data: tokenData, error } = await supabase
        .from('user_push_tokens')
        .select('push_token')
        .eq('user_id', userId)
        .single();

      if (error || !tokenData?.push_token) {
        console.warn('Push-токен не найден для пользователя:', userId);
        return;
      }

      // Отправляем уведомление через Expo Push API
      const message = {
        to: tokenData.push_token,
        sound: 'default',
        title,
        body,
        data: data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push-уведомление отправлено:', result);
    } catch (error) {
      console.error('Ошибка отправки push-уведомления:', error);
    }
  },

  // Подписка на уведомления
  subscribeToNotifications: (callback: (notification: any) => void) => {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return subscription;
  },

  // Обработка нажатия на уведомление
  subscribeToNotificationResponse: (callback: (response: any) => void) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return subscription;
  },
};