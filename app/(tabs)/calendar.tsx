import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { useTasksStore } from '@/store/tasksStore';
import { useAuthStore } from '@/store/authStore';
import { CalendarGrid } from '@/components/CalendarGrid';
import { CalendarTaskCard } from '@/components/CalendarTaskCard';
import { EventCard } from '@/components/EventCard';
import { Calendar, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Task, CalendarTask } from '@/types';

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { tasks, fetchTasks, isLoading } = useTasksStore();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const styles = createStyles(colors);

  useEffect(() => {
    fetchTasks();
  }, []);

  const getTasksForDate = (date: Date): Task[] => {
    if (!tasks) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getTasksForSelectedDate = () => {
    return getTasksForDate(selectedDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMonthYear = () => {
    return selectedDate.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchTasks}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <Text style={styles.title}>Календарь</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/event/create')}
            >
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{formatMonthYear()}</Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <CalendarGrid
            currentDate={selectedDate}
            selectedDate={selectedDate.toISOString().split('T')[0]}
            onDateSelect={(dateString: string) => setSelectedDate(new Date(dateString))}
            events={[]}
            tasks={(tasks || []).map(task => ({ ...task, startDate: task.dueDate }))}
          />
        </View>

        {/* Selected Date Tasks */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Задачи на {formatSelectedDate()}
            </Text>
            <Text style={styles.taskCount}>
              {getTasksForSelectedDate().length}
            </Text>
          </View>

          {getTasksForSelectedDate().length > 0 ? (
            <View style={styles.tasksContainer}>
              {getTasksForSelectedDate().map(task => (
                <CalendarTaskCard
                  key={task.id}
                  task={task}
                  onPress={() => router.push(`/task/${task.id}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={colors.inactive} />
              <Text style={styles.emptyTitle}>Нет задач на эту дату</Text>
              <Text style={styles.emptyDescription}>
                Выберите другую дату или создайте новую задачу
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ближайшие события</Text>
          </View>
          
          <View style={styles.eventsContainer}>
            <EventCard
              event={{
                id: '1',
                title: 'Планерка отдела',
                description: 'Еженедельная планерка отдела',
                type: 'meeting',
                status: 'scheduled',
                startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
                organizer: 'user1',
                participants: ['user1', 'user2', 'user3', 'user4', 'user5'],
                isAllDay: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                unit: 'battalion'
              }}
              onPress={() => {}}
            />
            <EventCard
              event={{
                id: '2',
                title: 'Сдача отчета',
                description: 'Сдача месячного отчета',
                type: 'other',
                status: 'scheduled',
                startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
                organizer: 'user1',
                participants: ['user1'],
                isAllDay: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                unit: 'battalion'
              }}
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Month Navigation
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  
  // Calendar
  calendarContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Tasks Section
  tasksSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tasksContainer: {
    gap: 12,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Events Section
  eventsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 120,
  },
  eventsContainer: {
    gap: 12,
  },
});