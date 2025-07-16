import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { useCalendarStore } from '@/store/calendarStore';
import { CalendarGrid } from '@/components/CalendarGrid';
import { EventCard } from '@/components/EventCard';
import { CalendarTaskCard } from '@/components/CalendarTaskCard';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react-native';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export default function CalendarScreen() {
  const {
    events,
    tasks,
    selectedDate,
    viewMode,
    setSelectedDate,
    setViewMode,
    getEventsByDate,
    getTasksByDate
  } = useCalendarStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const selectedEvents = getEventsByDate(selectedDate);
  const selectedTasks = getTasksByDate(selectedDate);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };
  
  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Календарь',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton}>
                <Filter size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Сегодня</Text>
          </TouchableOpacity>
        </View>
        
        {/* Calendar Grid */}
        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          events={events}
          tasks={tasks}
          onDateSelect={setSelectedDate}
        />
        
        {/* Selected Date Info */}
        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateTitle}>
            {formatSelectedDate()}
          </Text>
          <View style={styles.counters}>
            {selectedEvents.length > 0 && (
              <View style={styles.counter}>
                <View style={[styles.counterDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.counterText}>
                  {selectedEvents.length} событий
                </Text>
              </View>
            )}
            {selectedTasks.length > 0 && (
              <View style={styles.counter}>
                <View style={[styles.counterDot, { backgroundColor: colors.secondary }]} />
                <Text style={styles.counterText}>
                  {selectedTasks.length} задач
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Events List */}
        {selectedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>События</Text>
            {selectedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => {/* Navigate to event details */}}
              />
            ))}
          </View>
        )}
        
        {/* Tasks List */}
        {selectedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Задачи</Text>
            {selectedTasks.map(task => (
              <CalendarTaskCard
                key={task.id}
                task={task}
                onPress={() => {/* Navigate to task details */}}
              />
            ))}
          </View>
        )}
        
        {/* Empty State */}
        {selectedEvents.length === 0 && selectedTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Нет событий</Text>
            <Text style={styles.emptyStateText}>
              На выбранную дату нет запланированных событий или задач
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    minWidth: 140,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.card,
  },
  selectedDateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  selectedDateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'capitalize',
    letterSpacing: -0.2,
  },
  counters: {
    flexDirection: 'row',
    gap: 16,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counterText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});