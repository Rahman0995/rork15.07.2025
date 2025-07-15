import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReportStatus, TaskStatus, TaskPriority, EventStatus } from '@/types';
import { colors } from '@/constants/colors';

interface StatusBadgeProps {
  status: ReportStatus | TaskStatus | TaskPriority | EventStatus;
  size?: 'small' | 'medium';
  color?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium', color }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
      case 'completed':
        return colors.success;
      case 'rejected':
      case 'cancelled':
        return colors.error;
      case 'pending':
        return colors.warning;
      case 'needs_revision':
        return colors.info;
      case 'in_progress':
        return colors.info;
      case 'draft':
        return colors.inactive;
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      case 'scheduled':
        return colors.info;
      default:
        return color || colors.inactive;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Утвержден';
      case 'rejected':
        return 'Отклонен';
      case 'pending':
        return 'На рассмотрении';
      case 'needs_revision':
        return 'Доработка';
      case 'in_progress':
        return 'В процессе';
      case 'completed':
        return 'Выполнено';
      case 'cancelled':
        return 'Отменено';
      case 'draft':
        return 'Черновик';
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      case 'scheduled':
        return 'Запланировано';
      default:
        return status;
    }
  };

  const statusColor = getStatusColor();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: statusColor + '15',
        borderColor: statusColor + '30',
      },
      size === 'small' && styles.smallContainer
    ]}>
      <View style={[
        styles.dot,
        { backgroundColor: statusColor }
      ]} />
      <Text style={[
        styles.text, 
        { color: statusColor },
        size === 'small' && styles.smallText
      ]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  smallContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  smallText: {
    fontSize: 11,
  },
});