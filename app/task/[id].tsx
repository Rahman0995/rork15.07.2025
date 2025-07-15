import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTasksStore } from '@/store/tasksStore';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { formatDateTime, formatDueDate } from '@/utils/dateUtils';
import { getUser } from '@/constants/mockData';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  CheckCircle, 
  XCircle,
  Edit
} from 'lucide-react-native';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, getTaskById, updateTaskStatus, isLoading } = useTasksStore();
  const { user } = useAuthStore();
  
  const task = getTaskById(id);
  const assignedTo = task ? getUser(task.assignedTo) : null;
  const assignedBy = task ? getUser(task.assignedBy) : null;
  
  const isAssignedToCurrentUser = user?.id === task?.assignedTo;
  const canUpdateStatus = isAssignedToCurrentUser || user?.id === task?.assignedBy;
  
  const handleComplete = () => {
    Alert.alert(
      'Завершение задачи',
      'Вы уверены, что хотите отметить задачу как выполненную?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Завершить',
          onPress: () => {
            if (id) {
              updateTaskStatus(id, 'completed');
            }
          },
        },
      ]
    );
  };
  
  const handleCancel = () => {
    Alert.alert(
      'Отмена задачи',
      'Вы уверены, что хотите отменить эту задачу?',
      [
        {
          text: 'Нет',
          style: 'cancel',
        },
        {
          text: 'Отменить задачу',
          onPress: () => {
            if (id) {
              updateTaskStatus(id, 'cancelled');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  if (isLoading || !task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const daysUntil = getDaysUntil(task.dueDate);
  
  const getStatusIcon = () => {
    if (task.status === 'completed') {
      return <CheckCircle size={24} color={colors.success} />;
    } else if (daysUntil < 0) {
      return <AlertTriangle size={24} color={colors.error} />;
    } else if (daysUntil <= 2) {
      return <Clock size={24} color={colors.warning} />;
    } else {
      return <Clock size={24} color={colors.info} />;
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{ 
          title: 'Задача',
          headerRight: () => (
            <TouchableOpacity onPress={() => {}}>
              <Edit size={20} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <CheckSquare size={24} color={colors.primary} />
          <Text style={styles.title}>{task.title}</Text>
        </View>
        <StatusBadge status={task.status} />
      </View>
      
      <View style={styles.metaContainer}>
        <View style={styles.priorityContainer}>
          <Text style={styles.priorityLabel}>Приоритет:</Text>
          <StatusBadge status={task.priority} size="small" />
        </View>
        
        <View style={styles.dueContainer}>
          <Text style={styles.dueLabel}>Срок выполнения:</Text>
          <View style={styles.dueInfo}>
            {getStatusIcon()}
            <Text style={[
              styles.dueDate,
              daysUntil < 0 ? styles.overdue : 
              daysUntil <= 2 ? styles.urgent : null
            ]}>
              {formatDueDate(task.dueDate)} ({formatDateTime(task.dueDate)})
            </Text>
          </View>
        </View>
        
        <View style={styles.assigneeContainer}>
          <Text style={styles.assigneeLabel}>Исполнитель:</Text>
          <View style={styles.assigneeInfo}>
            <Avatar 
              uri={assignedTo?.avatar} 
              name={assignedTo?.name || 'Неизвестный'} 
              size={32} 
            />
            <View style={styles.assigneeTextContainer}>
              <Text style={styles.assigneeName}>{assignedTo?.name || 'Неизвестный'}</Text>
              <Text style={styles.assigneeRank}>{assignedTo?.rank || ''}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.assignerContainer}>
          <Text style={styles.assignerLabel}>Назначил:</Text>
          <View style={styles.assignerInfo}>
            <Avatar 
              uri={assignedBy?.avatar} 
              name={assignedBy?.name || 'Неизвестный'} 
              size={32} 
            />
            <View style={styles.assignerTextContainer}>
              <Text style={styles.assignerName}>{assignedBy?.name || 'Неизвестный'}</Text>
              <Text style={styles.assignerRank}>{assignedBy?.rank || ''}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Дата создания:</Text>
          <Text style={styles.date}>{formatDateTime(task.createdAt)}</Text>
        </View>
        
        {task.completedAt && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Дата выполнения:</Text>
            <Text style={styles.date}>{formatDateTime(task.completedAt)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Описание задачи</Text>
        <Text style={styles.descriptionText}>{task.description}</Text>
      </View>
      
      {canUpdateStatus && task.status !== 'completed' && task.status !== 'cancelled' && (
        <View style={styles.actionsContainer}>
          <Button
            title="Выполнено"
            onPress={handleComplete}
            style={styles.completeButton}
            icon={<CheckCircle size={18} color="white" />}
          />
          <Button
            title="Отменить"
            onPress={handleCancel}
            variant="danger"
            style={styles.cancelButton}
            icon={<XCircle size={18} color="white" />}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  metaContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  dueContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dueLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dueDate: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  overdue: {
    color: colors.error,
    fontWeight: '500',
  },
  urgent: {
    color: colors.warning,
    fontWeight: '500',
  },
  assigneeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  assigneeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  assigneeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assigneeTextContainer: {
    marginLeft: 8,
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  assigneeRank: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  assignerContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  assignerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  assignerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assignerTextContainer: {
    marginLeft: 8,
  },
  assignerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  assignerRank: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  date: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  descriptionContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  completeButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
});