import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDueDate } from '@/utils/dateUtils';
import { useTheme } from '@/constants/theme';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';

interface SimpleTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

const SimpleTaskCardComponent: React.FC<SimpleTaskCardProps> = ({ task, onPress }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const daysUntil = useMemo(() => {
    const date = new Date(task.dueDate || '');
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [task.dueDate]);
  
  const statusIcon = useMemo(() => {
    if (task.status === 'completed') {
      return <CheckCircle size={20} color={colors.success} />;
    } else if (daysUntil < 0) {
      return <AlertCircle size={20} color={colors.error} />;
    } else if (daysUntil <= 2) {
      return <Clock size={20} color={colors.warning} />;
    } else {
      return <Clock size={20} color={colors.info} />;
    }
  }, [task.status, daysUntil, colors]);

  const handlePress = useCallback(() => {
    onPress(task);
  }, [onPress, task]);

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        task.status === 'completed' && styles.completedContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <StatusBadge status={task.status} />
        <View style={styles.dueContainer}>
          {statusIcon}
          <Text style={[
            styles.dueDate,
            daysUntil < 0 ? styles.overdue : 
            daysUntil <= 2 ? styles.urgent : null
          ]}>
            {formatDueDate(task.dueDate || '')}
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
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  completedContainer: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successLight,
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  overdue: {
    color: colors.error,
  },
  urgent: {
    color: colors.warning,
  },
});

export const SimpleTaskCard = memo(SimpleTaskCardComponent);