import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Server, Database, CheckCircle, XCircle, Loader } from 'lucide-react-native';

export default function BackendTestScreen() {
  const { user } = useAuthStore();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  // Test basic connection
  const { data: connectionTest, isLoading: connectionLoading, error: connectionError } = trpc.example.hi.useQuery(
    { name: user?.name || 'Test User' }
  );

  // Get tasks from backend
  const { data: backendTasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.tasks.getAll.useQuery(
    { assignedTo: user?.id }
  );

  // Get reports from backend
  const { data: backendReports, isLoading: reportsLoading, refetch: refetchReports } = trpc.reports.getAll.useQuery(
    { authorId: user?.id }
  );

  // Create task mutation
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      Alert.alert('Успех', 'Задача создана успешно!');
      setTaskTitle('');
      setTaskDescription('');
      refetchTasks();
    },
    onError: (error) => {
      Alert.alert('Ошибка', `Не удалось создать задачу: ${error.message}`);
    },
  });

  // Create report mutation
  const createReportMutation = trpc.reports.create.useMutation({
    onSuccess: () => {
      Alert.alert('Успех', 'Отчет создан успешно!');
      setReportTitle('');
      setReportContent('');
      refetchReports();
    },
    onError: (error) => {
      Alert.alert('Ошибка', `Не удалось создать отчет: ${error.message}`);
    },
  });

  const handleCreateTask = () => {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля для задачи');
      return;
    }

    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDescription,
      assignedTo: user?.id || 'user1',
      createdBy: user?.id || 'user1',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  const handleCreateReport = () => {
    if (!reportTitle.trim() || !reportContent.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля для отчета');
      return;
    }

    createReportMutation.mutate({
      title: reportTitle,
      content: reportContent,
      authorId: user?.id || 'user1',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Connection Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Server size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Статус подключения</Text>
        </View>
        
        <View style={styles.statusCard}>
          {connectionLoading ? (
            <View style={styles.statusRow}>
              <Loader size={16} color={colors.primary} />
              <Text style={styles.statusText}>Подключение...</Text>
            </View>
          ) : connectionError ? (
            <View style={styles.statusRow}>
              <XCircle size={16} color={colors.error} />
              <Text style={[styles.statusText, { color: colors.error }]}>
                Ошибка: {connectionError.message}
              </Text>
            </View>
          ) : connectionTest ? (
            <View>
              <View style={styles.statusRow}>
                <CheckCircle size={16} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Подключено к backend
                </Text>
              </View>
              <Text style={styles.statusDetails}>
                {connectionTest.message}
              </Text>
              <Text style={styles.statusDetails}>
                Время сервера: {new Date(connectionTest.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Tasks from Backend */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Database size={20} color={colors.secondary} />
          <Text style={styles.sectionTitle}>Задачи из Backend</Text>
        </View>
        
        {tasksLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={styles.dataContainer}>
            {backendTasks && backendTasks.tasks && backendTasks.tasks.length > 0 ? (
              backendTasks.tasks.map((task: any) => (
                <View key={task.id} style={styles.dataItem}>
                  <Text style={styles.dataTitle}>{task.title}</Text>
                  <Text style={styles.dataDescription}>{task.description}</Text>
                  <Text style={styles.dataStatus}>Статус: {task.status}</Text>
                  <Text style={styles.dataStatus}>Приоритет: {task.priority}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Нет задач</Text>
            )}
          </View>
        )}
      </View>

      {/* Reports from Backend */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Database size={20} color={colors.accent} />
          <Text style={styles.sectionTitle}>Отчеты из Backend</Text>
        </View>
        
        {reportsLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={styles.dataContainer}>
            {backendReports && backendReports.reports && backendReports.reports.length > 0 ? (
              backendReports.reports.map((report: any) => (
                <View key={report.id} style={styles.dataItem}>
                  <Text style={styles.dataTitle}>{report.title}</Text>
                  <Text style={styles.dataDescription}>{report.content}</Text>
                  <Text style={styles.dataStatus}>Статус: {report.status}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Нет отчетов</Text>
            )}
          </View>
        )}
      </View>

      {/* Create Task */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Создать задачу</Text>
        <Input
          placeholder="Название задачи"
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={styles.input}
        />
        <Input
          placeholder="Описание задачи"
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Button
          title="Создать задачу"
          onPress={handleCreateTask}
          loading={createTaskMutation.isPending}
          style={styles.button}
        />
      </View>

      {/* Create Report */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Создать отчет</Text>
        <Input
          placeholder="Название отчета"
          value={reportTitle}
          onChangeText={setReportTitle}
          style={styles.input}
        />
        <Input
          placeholder="Содержание отчета"
          value={reportContent}
          onChangeText={setReportContent}
          multiline
          numberOfLines={4}
          style={styles.input}
        />
        <Button
          title="Создать отчет"
          onPress={handleCreateReport}
          loading={createReportMutation.isPending}
          style={styles.button}
        />
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
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: colors.text,
  },
  statusDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dataContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dataItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dataDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dataStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});