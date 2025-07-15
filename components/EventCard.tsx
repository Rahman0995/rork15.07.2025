import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarEvent } from '@/types';
import { colors } from '@/constants/colors';
import { Clock, MapPin, Users } from 'lucide-react-native';
import { StatusBadge } from './StatusBadge';

interface EventCardProps {
  event: CalendarEvent;
  onPress: () => void;
}

const EVENT_TYPE_LABELS = {
  training: 'Обучение',
  meeting: 'Совещание',
  exercise: 'Учения',
  inspection: 'Инспекция',
  ceremony: 'Церемония',
  other: 'Другое'
};

const EVENT_STATUS_COLORS = {
  scheduled: colors.info,
  in_progress: colors.warning,
  completed: colors.success,
  cancelled: colors.error
};

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.colorBar, { backgroundColor: event.color || colors.primary }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <StatusBadge 
            status={event.status}
          />
        </View>
        
        <Text style={styles.type}>{EVENT_TYPE_LABELS[event.type]}</Text>
        
        {event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {event.isAllDay 
                ? 'Весь день'
                : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`
              }
            </Text>
          </View>
          
          {event.location && (
            <View style={styles.detailItem}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={styles.detailText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {event.participants.length} участников
            </Text>
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
  colorBar: {
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
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 8,
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