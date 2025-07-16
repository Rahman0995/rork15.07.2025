import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDueDate } from '@/utils/dateUtils';
import { useTheme } from '@/constants/theme';
import { getUser } from '@/constants/mockData';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const assignedTo = getUser(task.assignedTo);
  const assignedBy = getUser(task.createdBy);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const daysUntil = getDaysUntil(task.dueDate);
  
  const getStatusIcon = () => {
    if (task.status === 'completed') {
      return <CheckCircle size={20} color={colors.success} />;
    } else if (daysUntil < 0) {
      return <AlertCircle size={20} color={colors.error} />;
    } else if (daysUntil <= 2) {
      return <Clock size={20} color={colors.warning} />;
    } else {
      return <Clock size={20} color={colors.info} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        task.status === 'completed' && styles.completedContainer
      ]}
      onPress={() => onPress(task)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <StatusBadge status={task.status} />
          <StatusBadge status={task.priority} size="small" />
        </View>
        <View style={styles.dueContainer}>
          {getStatusIcon()}
          <Text style={[
            styles.dueDate,
            daysUntil < 0 ? styles.overdue : 
            daysUntil <= 2 ? styles.urgent : null
          ]}>
            {formatDueDate(task.dueDate)}
          </Text>
        </View>
      </View>
      
      <Text style={[
        styles.title,
        task.status === 'completed' && styles.completedTitle
      ]}>
        {task.title}
      </Text>
      
      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.assigneeInfo}>
          <View style={styles.assigneeContainer}>
            <Text style={styles.assigneeLabel}>Исполнитель:</Text>
            <Text style={styles.assigneeName}>{assignedTo?.name || 'Неизвестный'}</Text>
          </View>
          <Text style={styles.assignedByText}>
            Назначил: {assignedBy?.name || 'Неизвестный'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successLight,
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'column',
    gap: 8,
  },
  assigneeInfo: {
    gap: 4,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    marginRight: 6,
  },
  assigneeName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  overdue: {
    color: colors.error,
  },
  urgent: {
    color: colors.warning,
  },
  assignedByText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});