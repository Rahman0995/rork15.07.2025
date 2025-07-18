import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useReportsStore } from '@/store/reportsStore';
import { useTheme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Plus, FileText, CheckSquare, Users, Calendar } from 'lucide-react-native';
import { Task, Report } from '@/types';

interface DataManagerProps {
  visible: boolean;
  onClose: () => void;
}

export function DataManager({ visible, onClose }: DataManagerProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addTask } = useTasksStore();
  const { addReport } = useReportsStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [activeTab, setActiveTab] = useState<'task' | 'report'>('task');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  if (!visible) return null;

  const handleCreateTask = () => {
    if (!taskTitle.trim() || !user) {
      Alert.alert('Ошибка', 'Заполните название задачи');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      assignedTo: user.id,
      createdBy: user.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTask(newTask);
    setTaskTitle('');
    setTaskDescription('');
    Alert.alert('Успешно', 'Задача создана', [
      { text: 'OK', onPress: onClose }
    ]);
  };

  const handleCreateReport = () => {
    if (!reportTitle.trim() || !reportContent.trim() || !user) {
      Alert.alert('Ошибка', 'Заполните все поля отчета');
      return;
    }

    const newReport: Report = {
      id: Date.now().toString(),
      title: reportTitle.trim(),
      content: reportContent.trim(),
      authorId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      type: 'text',
      attachments: [],
      unit: user.unit ?? undefined,
      priority: 'medium',
      approvers: [],
      currentApprover: undefined,
      approvals: [],
      comments: [],
      revisions: [],
      currentRevision: 1,
    };

    addReport(newReport);
    setReportTitle('');
    setReportContent('');
    Alert.alert('Успешно', 'Отчет создан', [
      { text: 'OK', onPress: onClose }
    ]);
  };

  const quickActions = [
    {
      title: 'Создать задачу',
      icon: CheckSquare,
      color: colors.primary,
      onPress: () => router.push('/task/create')
    },
    {
      title: 'Создать отчет',
      icon: FileText,
      color: colors.secondary,
      onPress: () => router.push('/report/create')
    },
    {
      title: 'Календарь',
      icon: Calendar,
      color: colors.success,
      onPress: () => router.push('/(tabs)/calendar')
    },
    {
      title: 'Персонал',
      icon: Users,
      color: colors.warning,
      onPress: () => router.push('/personnel')
    }
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Добавить данные</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionButton, { borderColor: action.color + '30' }]}
                onPress={() => {
                  onClose();
                  action.onPress();
                }}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <action.icon size={20} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'task' && styles.activeTab]}
            onPress={() => setActiveTab('task')}
          >
            <CheckSquare size={16} color={activeTab === 'task' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'task' && styles.activeTabText]}>
              Задача
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'report' && styles.activeTab]}
            onPress={() => setActiveTab('report')}
          >
            <FileText size={16} color={activeTab === 'report' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'report' && styles.activeTabText]}>
              Отчет
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'task' ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Название задачи *</Text>
                <TextInput
                  style={styles.input}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder="Введите название задачи"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Описание</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  placeholder="Введите описание задачи"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Button
                title="Создать задачу"
                onPress={handleCreateTask}
                style={styles.createButton}
                disabled={!taskTitle.trim()}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Название отчета *</Text>
                <TextInput
                  style={styles.input}
                  value={reportTitle}
                  onChangeText={setReportTitle}
                  placeholder="Введите название отчета"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Содержание отчета *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reportContent}
                  onChangeText={setReportContent}
                  placeholder="Введите содержание отчета"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={6}
                />
              </View>

              <Button
                title="Создать отчет"
                onPress={handleCreateReport}
                style={styles.createButton}
                disabled={!reportTitle.trim() || !reportContent.trim()}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  quickActionsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: colors.primarySoft,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    marginTop: 20,
  },
});