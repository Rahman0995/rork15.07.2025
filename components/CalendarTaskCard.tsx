import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarTask } from '@/types';
import { colors } from '@/constants/colors';
import { Clock, AlertCircle, CheckCircle, User } from 'lucide-react-native';
import { StatusBadge } from './StatusBadge';

interface CalendarTaskCardProps {
  task: CalendarTask;
  onPress: () => void;
}

const PRIORITY_COLORS = {
  low: colors.success,
  medium: colors.warning,
  high: colors.error
};

const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
};

const STATUS_COLORS = {
  pending: colors.warning,
  in_progress: colors.info,
  completed: colors.success,
  cancelled: colors.error
};

export const CalendarTaskCard: React.FC<CalendarTaskCardProps> = ({ task, onPress }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertCircle size={14} color={PRIORITY_COLORS.high} />;
      case 'medium':
        return <Clock size={14} color={PRIORITY_COLORS.medium} />;
      case 'low':
        return <CheckCircle size={14} color={PRIORITY_COLORS.low} />;
      default:
        return <Clock size={14} color={colors.textSecondary} />;
    }
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <StatusBadge 
            status={task.status}
          />
        </View>
        
        <View style={styles.priorityRow}>
          {getPriorityIcon()}
          <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>
            {PRIORITY_LABELS[task.priority]} приоритет
          </Text>
        </View>
        
        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.details}>
          {task.startDate && task.endDate && !task.isAllDay && (
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {formatTime(task.startDate)} - {formatTime(task.endDate)}
              </Text>
            </View>
          )}
          
          {task.isAllDay && (
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>Весь день</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <User size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>Исполнитель: {task.assignedTo}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
});