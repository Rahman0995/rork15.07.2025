import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useTheme } from '@/constants/theme';
import { useTasksStore } from '@/store/tasksStore';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  X,
  FileText,
  CheckSquare,
  Users
} from 'lucide-react-native';

interface DataManagerProps {
  visible: boolean;
  onClose: () => void;
}

export function DataManager({ visible, onClose }: DataManagerProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { tasks, fetchTasks, clearTasks } = useTasksStore();
  const { reports, fetchReports, clearReports } = useReportsStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTasks(),
        fetchReports(),
      ]);
      Alert.alert('Успешно', 'Данные обновлены');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить данные');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Очистить данные',
      'Вы уверены, что хотите очистить все локальные данные? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            clearTasks();
            clearReports();
            Alert.alert('Успешно', 'Локальные данные очищены');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    const data = {
      tasks,
      reports,
      exportDate: new Date().toISOString(),
      user: user?.id,
    };
    
    // In a real app, you would implement actual export functionality
    Alert.alert(
      'Экспорт данных',
      `Готово к экспорту:\n• Задач: ${tasks.length}\n• Отчетов: ${reports.length}\n\nВ реальном приложении данные будут сохранены в файл.`
    );
  };

  const DataCard = ({ 
    title, 
    count, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    count: number; 
    icon: any; 
    color: string; 
  }) => (
    <View style={[styles.dataCard, { borderLeftColor: color }]}>
      <View style={styles.dataCardHeader}>
        <View style={[styles.dataCardIcon, { backgroundColor: color + '20' }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={styles.dataCardTitle}>{title}</Text>
      </View>
      <Text style={styles.dataCardCount}>{count}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Database size={20} color={colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Управление данными</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Статистика данных</Text>
            <View style={styles.dataCards}>
              <DataCard
                title="Задачи"
                count={tasks.length}
                icon={CheckSquare}
                color={colors.primary}
              />
              <DataCard
                title="Отчеты"
                count={reports.length}
                icon={FileText}
                color={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Действия</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primarySoft }]}
                onPress={handleRefreshData}
                disabled={isLoading}
              >
                <View style={styles.actionIcon}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <RefreshCw size={18} color={colors.primary} />
                  )}
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.primary }]}>
                    Обновить данные
                  </Text>
                  <Text style={styles.actionDescription}>
                    Синхронизировать с сервером
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.successSoft }]}
                onPress={handleExportData}
              >
                <View style={styles.actionIcon}>
                  <Download size={18} color={colors.success} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.success }]}>
                    Экспорт данных
                  </Text>
                  <Text style={styles.actionDescription}>
                    Сохранить данные в файл
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.errorSoft }]}
                onPress={handleClearData}
              >
                <View style={styles.actionIcon}>
                  <Trash2 size={18} color={colors.error} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.error }]}>
                    Очистить данные
                  </Text>
                  <Text style={styles.actionDescription}>
                    Удалить все локальные данные
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Информация</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Данные хранятся локально на устройстве и синхронизируются с сервером при наличии подключения к интернету.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  dataCards: {
    flexDirection: 'row',
    gap: 12,
  },
  dataCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dataCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dataCardCount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});