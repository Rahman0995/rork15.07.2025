import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { useCalendarStore } from '@/store/calendarStore';
import { useAuthStore } from '@/store/authStore';
import { mockUsers } from '@/constants/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  UserPlus,
  Play,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';

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

const EVENT_STATUS_LABELS = {
  scheduled: 'Запланировано',
  in_progress: 'В процессе',
  completed: 'Завершено',
  cancelled: 'Отменено'
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, updateEvent, deleteEvent } = useCalendarStore();
  const { user } = useAuthStore();
  
  const event = events.find(e => e.id === id);
  const [loading, setLoading] = useState(false);
  
  if (!event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Событие не найдено' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Событие не найдено</Text>
        </View>
      </View>
    );
  }
  
  const organizer = mockUsers.find(u => u.id === event.organizer);
  const participants = mockUsers.filter(u => event.participants.includes(u.id));
  const canEdit = user?.id === event.organizer || user?.role === 'admin';
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };
  
  const handleStatusChange = async (newStatus: typeof event.status) => {
    if (!canEdit) return;
    
    setLoading(true);
    try {
      updateEvent(event.id, { status: newStatus });
      Alert.alert('Успех', 'Статус события обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить статус');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = () => {
    if (!canEdit) return;
    
    Alert.alert(
      'Удалить событие',
      'Вы уверены, что хотите удалить это событие?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            deleteEvent(event.id);
            router.back();
          }
        }
      ]
    );
  };
  
  const startDateTime = formatDateTime(event.startDate);
  const endDateTime = formatDateTime(event.endDate);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Детали события',
          headerRight: () => canEdit ? (
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton}>
                <Edit3 size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : null
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.colorBar, { backgroundColor: event.color || colors.primary }]} />
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{event.title}</Text>
              <StatusBadge 
                status={event.status}
              />
            </View>
            <Text style={styles.eventType}>{EVENT_TYPE_LABELS[event.type]}</Text>
            {event.description && (
              <Text style={styles.description}>{event.description}</Text>
            )}
          </View>
        </View>
        
        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Дата и время</Text>
          </View>
          
          <View style={styles.dateTimeInfo}>
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>Начало:</Text>
              <Text style={styles.dateTimeValue}>
                {startDateTime.date}
                {!event.isAllDay && ` в ${startDateTime.time}`}
              </Text>
            </View>
            
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>Окончание:</Text>
              <Text style={styles.dateTimeValue}>
                {endDateTime.date}
                {!event.isAllDay && ` в ${endDateTime.time}`}
              </Text>
            </View>
            
            {event.isAllDay && (
              <View style={styles.allDayBadge}>
                <Clock size={14} color={colors.primary} />
                <Text style={styles.allDayText}>Весь день</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Location */}
        {event.location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Место проведения</Text>
            </View>
            <Text style={styles.locationText}>{event.location}</Text>
          </View>
        )}
        
        {/* Organizer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Организатор</Text>
          </View>
          
          {organizer && (
            <View style={styles.userRow}>
              <Avatar user={organizer} size={40} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{organizer.name}</Text>
                <Text style={styles.userRole}>{organizer.rank} • {organizer.unit}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Participants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              Участники ({participants.length})
            </Text>
            {canEdit && (
              <TouchableOpacity style={styles.addButton}>
                <UserPlus size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          {participants.length > 0 ? (
            <View style={styles.participantsList}>
              {participants.map(participant => (
                <View key={participant.id} style={styles.userRow}>
                  <Avatar user={participant} size={36} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{participant.name}</Text>
                    <Text style={styles.userRole}>{participant.rank} • {participant.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Участники не добавлены</Text>
          )}
        </View>
        
        {/* Status Actions */}
        {canEdit && event.status !== 'completed' && event.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Действия</Text>
            <View style={styles.actionButtons}>
              {event.status === 'scheduled' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}
                  onPress={() => handleStatusChange('in_progress')}
                  disabled={loading}
                >
                  <Play size={16} color={colors.warning} />
                  <Text style={[styles.actionButtonText, { color: colors.warning }]}>
                    Начать
                  </Text>
                </TouchableOpacity>
              )}
              
              {event.status === 'in_progress' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
                  onPress={() => handleStatusChange('completed')}
                  disabled={loading}
                >
                  <CheckCircle size={16} color={colors.success} />
                  <Text style={[styles.actionButtonText, { color: colors.success }]}>
                    Завершить
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                onPress={() => handleStatusChange('cancelled')}
                disabled={loading}
              >
                <XCircle size={16} color={colors.error} />
                <Text style={[styles.actionButtonText, { color: colors.error }]}>
                  Отменить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorBar: {
    width: 4,
  },
  headerContent: {
    flex: 1,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    padding: 4,
  },
  dateTimeInfo: {
    gap: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  allDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  allDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  participantsList: {
    gap: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});