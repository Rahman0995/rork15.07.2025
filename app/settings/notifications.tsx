import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useNotificationsStore } from '@/store/notificationsStore';
import { colors } from '@/constants/colors';
import { 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Clock,
  CheckCircle,
  XCircle,
  Smartphone
} from 'lucide-react-native';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, registerForPushNotifications } = useNotificationsStore();
  
  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    await updateSettings({ [key]: value });
    
    if (key === 'pushEnabled' && value) {
      try {
        await registerForPushNotifications();
      } catch (error) {
        Alert.alert(
          'Ошибка',
          'Не удалось зарегистрировать push-уведомления. Проверьте разрешения в настройках устройства.',
          [{ text: 'OK' }]
        );
        // Revert the setting
        await updateSettings({ [key]: false });
      }
    }
  };
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    key: keyof typeof settings,
    disabled = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.disabledItem]}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, disabled && styles.disabledText]}>
          {description}
        </Text>
      </View>
      <Switch
        value={settings[key] as boolean}
        onValueChange={(value) => handleToggle(key, value)}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={settings[key] ? colors.primary : colors.inactive}
        disabled={disabled}
      />
    </View>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: 'Настройки уведомлений' }} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push-уведомления</Text>
        {renderSettingItem(
          <Smartphone size={20} color={colors.primary} />,
          'Push-уведомления',
          'Получать уведомления на устройство',
          'pushEnabled'
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Задачи</Text>
        {renderSettingItem(
          <CheckSquare size={20} color={colors.primary} />,
          'Назначение задач',
          'Уведомления о новых назначенных задачах',
          'taskAssigned',
          !settings.pushEnabled
        )}
        {renderSettingItem(
          <Clock size={20} color={colors.warning} />,
          'Сроки выполнения',
          'Напоминания о приближающихся сроках',
          'taskDue',
          !settings.pushEnabled
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Отчеты</Text>
        {renderSettingItem(
          <FileText size={20} color={colors.info} />,
          'Новые отчеты',
          'Уведомления о создании новых отчетов',
          'reportCreated',
          !settings.pushEnabled
        )}
        {renderSettingItem(
          <CheckCircle size={20} color={colors.success} />,
          'Утверждение отчетов',
          'Уведомления об утверждении ваших отчетов',
          'reportApproved',
          !settings.pushEnabled
        )}
        {renderSettingItem(
          <XCircle size={20} color={colors.error} />,
          'Отклонение отчетов',
          'Уведомления об отклонении ваших отчетов',
          'reportRejected',
          !settings.pushEnabled
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Сообщения</Text>
        {renderSettingItem(
          <MessageSquare size={20} color={colors.secondary} />,
          'Новые сообщения',
          'Уведомления о новых сообщениях в чате',
          'chatMessage',
          !settings.pushEnabled
        )}
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Информация</Text>
        <Text style={styles.infoText}>
          Для получения push-уведомлений необходимо разрешить их в настройках устройства. 
          Уведомления о сроках выполнения задач отправляются за 24 часа до истечения срока.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    backgroundColor: colors.card,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  disabledText: {
    color: colors.inactive,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});