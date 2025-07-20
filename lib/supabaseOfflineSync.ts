import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/lib/commonjs';

interface OfflineAction {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export const offlineSync = {
  // Сохранение действия для офлайн синхронизации
  saveOfflineAction: async (table: string, action: 'insert' | 'update' | 'delete', data: any) => {
    try {
      const offlineAction: OfflineAction = {
        id: `${Date.now()}_${Math.random()}`,
        table,
        action,
        data,
        timestamp: new Date().toISOString(),
      };

      const existingActions = await AsyncStorage.getItem('offline_actions');
      const actions: OfflineAction[] = existingActions ? JSON.parse(existingActions) : [];
      actions.push(offlineAction);

      await AsyncStorage.setItem('offline_actions', JSON.stringify(actions));
      console.log('Офлайн действие сохранено:', offlineAction);
    } catch (error) {
      console.error('Ошибка сохранения офлайн действия:', error);
    }
  },

  // Синхронизация офлайн действий
  syncOfflineActions: async () => {
    if (!supabase) {
      console.warn('Supabase не настроен');
      return;
    }

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('Нет подключения к интернету, синхронизация отложена');
        return;
      }

      const existingActions = await AsyncStorage.getItem('offline_actions');
      if (!existingActions) {
        return;
      }

      const actions: OfflineAction[] = JSON.parse(existingActions);
      const successfulActions: string[] = [];

      for (const action of actions) {
        try {
          let result;
          
          switch (action.action) {
            case 'insert':
              result = await supabase.from(action.table).insert(action.data);
              break;
            case 'update':
              result = await supabase.from(action.table).update(action.data).eq('id', action.data.id);
              break;
            case 'delete':
              result = await supabase.from(action.table).delete().eq('id', action.data.id);
              break;
          }

          if (!result?.error) {
            successfulActions.push(action.id);
            console.log('Офлайн действие синхронизировано:', action);
          } else {
            console.error('Ошибка синхронизации действия:', result.error);
          }
        } catch (error) {
          console.error('Ошибка выполнения офлайн действия:', error);
        }
      }

      // Удаляем успешно синхронизированные действия
      if (successfulActions.length > 0) {
        const remainingActions = actions.filter(action => !successfulActions.includes(action.id));
        await AsyncStorage.setItem('offline_actions', JSON.stringify(remainingActions));
        console.log(`Синхронизировано ${successfulActions.length} офлайн действий`);
      }
    } catch (error) {
      console.error('Ошибка синхронизации офлайн действий:', error);
    }
  },

  // Автоматическая синхронизация при подключении к интернету
  startAutoSync: () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('Подключение к интернету восстановлено, запуск синхронизации...');
        offlineSync.syncOfflineActions();
      }
    });

    return unsubscribe;
  },

  // Получение количества несинхронизированных действий
  getPendingActionsCount: async (): Promise<number> => {
    try {
      const existingActions = await AsyncStorage.getItem('offline_actions');
      if (!existingActions) {
        return 0;
      }
      const actions: OfflineAction[] = JSON.parse(existingActions);
      return actions.length;
    } catch (error) {
      console.error('Ошибка получения количества офлайн действий:', error);
      return 0;
    }
  },

  // Очистка всех офлайн действий
  clearOfflineActions: async () => {
    try {
      await AsyncStorage.removeItem('offline_actions');
      console.log('Офлайн действия очищены');
    } catch (error) {
      console.error('Ошибка очистки офлайн действий:', error);
    }
  },
};