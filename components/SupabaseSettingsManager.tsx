import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { Button } from '@/components/Button';
import { useUserSettings, useOfflineSync, usePushNotifications } from '@/lib/supabaseHooksExtended';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { analytics } from '@/lib/supabaseAnalytics';
import { offlineSync } from '@/lib/supabaseOfflineSync';

export const SupabaseSettingsManager: React.FC = () => {
  const { user } = useSupabaseAuth();
  const { settings, loading, updateSettings } = useUserSettings(user?.id);
  const { pendingCount, syncing, syncNow } = useOfflineSync();
  const { registered: pushRegistered } = usePushNotifications(user?.id);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSettingChange = async (key: string, value: any) => {
    await updateSettings({ [key]: value });
    
    // Отслеживаем изменение настройки
    if (analyticsEnabled) {
      await analytics.track('setting_changed', { setting: key, value }, user?.id);
    }
  };

  const clearOfflineData = async () => {
    Alert.alert(
      'Очистить офлайн данные',
      'Это действие удалит все несинхронизированные изменения. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            await offlineSync.clearOfflineActions();
            Alert.alert('Успешно', 'Офлайн данные очищены');
          },
        },
      ]
    );
  };

  const exportAnalytics = async () => {
    if (!user?.id) return;

    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 дней назад
      
      const { data, error } = await analytics.getAnalytics(startDate, endDate);
      
      if (error) {
        Alert.alert('Ошибка', 'Не удалось экспортировать аналитику');
        return;
      }

      // В реальном приложении здесь можно сохранить данные в файл или отправить по email
      Alert.alert('Экспорт аналитики', `Найдено ${data?.length || 0} событий за последние 30 дней`);
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при экспорте аналитики');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка настроек...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Настройки Supabase</Text>

      {/* Основные настройки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Основные настройки</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Тема</Text>
          <View style={styles.themeButtons}>
            {['light', 'dark', 'auto'].map((theme) => (
              <Button
                key={theme}
                title={theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Темная' : 'Авто'}
                onPress={() => handleSettingChange('theme', theme)}
                variant={settings?.theme === theme ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Язык</Text>
          <View style={styles.themeButtons}>
            {['ru', 'en'].map((lang) => (
              <Button
                key={lang}
                title={lang === 'ru' ? 'Русский' : 'English'}
                onPress={() => handleSettingChange('language', lang)}
                variant={settings?.language === lang ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>
        </View>
      </View>

      {/* Настройки уведомлений */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Уведомления</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Уведомления включены</Text>
          <Switch
            value={settings?.notifications_enabled}
            onValueChange={(value) => handleSettingChange('notifications_enabled', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push-уведомления</Text>
          <View style={styles.switchContainer}>
            <Switch
              value={settings?.push_notifications_enabled}
              onValueChange={(value) => handleSettingChange('push_notifications_enabled', value)}
              disabled={!settings?.notifications_enabled}
            />
            <Text style={styles.statusText}>
              {pushRegistered ? '✅ Зарегистрировано' : '❌ Не зарегистрировано'}
            </Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email уведомления</Text>
          <Switch
            value={settings?.email_notifications_enabled}
            onValueChange={(value) => handleSettingChange('email_notifications_enabled', value)}
            disabled={!settings?.notifications_enabled}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Звук</Text>
          <Switch
            value={settings?.sound_enabled}
            onValueChange={(value) => handleSettingChange('sound_enabled', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Вибрация</Text>
          <Switch
            value={settings?.vibration_enabled}
            onValueChange={(value) => handleSettingChange('vibration_enabled', value)}
          />
        </View>
      </View>

      {/* Синхронизация */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Синхронизация</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Несинхронизированных действий: {pendingCount}</Text>
          <Button
            title={syncing ? 'Синхронизация...' : 'Синхронизировать'}
            onPress={syncNow}
            disabled={syncing || pendingCount === 0}
            size="small"
          />
        </View>

        <Button
          title="Очистить офлайн данные"
          onPress={clearOfflineData}
          variant="secondary"
          disabled={pendingCount === 0}
        />
      </View>

      {/* Аналитика */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Аналитика</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Сбор аналитики</Text>
          <Switch
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
          />
        </View>

        <Button
          title="Экспортировать аналитику"
          onPress={exportAnalytics}
          variant="secondary"
          disabled={!analyticsEnabled}
        />
      </View>

      {/* Информация */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация</Text>
        <Text style={styles.infoText}>
          Пользователь: {user?.email}
        </Text>
        <Text style={styles.infoText}>
          ID: {user?.id}
        </Text>
        <Text style={styles.infoText}>
          Последний вход: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Неизвестно'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});