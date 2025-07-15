import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { CalendarEvent, CalendarTask } from '@/types';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: string;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  onDateSelect: (date: string) => void;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  events,
  tasks,
  onDateSelect
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and adjust for Monday start
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
  
  const days = [];
  const current = new Date(startDate);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };
  
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = task.startDate 
        ? new Date(task.startDate).toISOString().split('T')[0]
        : new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };
  
  const isSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
  };
  
  return (
    <View style={styles.container}>
      {/* Days header */}
      <View style={styles.daysHeader}>
        {DAYS.map(day => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.grid}>
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const dayTasks = getTasksForDate(date);
          const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected(date) && styles.selectedDay,
                isToday(date) && styles.today,
                !isCurrentMonth(date) && styles.otherMonth
              ]}
              onPress={() => onDateSelect(date.toISOString().split('T')[0])}
            >
              <Text style={[
                styles.dayText,
                isSelected(date) && styles.selectedDayText,
                isToday(date) && styles.todayText,
                !isCurrentMonth(date) && styles.otherMonthText
              ]}>
                {date.getDate()}
              </Text>
              
              {hasItems && (
                <View style={styles.indicators}>
                  {dayEvents.length > 0 && (
                    <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
                  )}
                  {dayTasks.length > 0 && (
                    <View style={[styles.indicator, { backgroundColor: colors.secondary }]} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  today: {
    backgroundColor: colors.primaryLight + '20',
  },
  otherMonth: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectedDayText: {
    color: colors.card,
    fontWeight: '600',
  },
  todayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  otherMonthText: {
    color: colors.textSecondary,
  },
  indicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});