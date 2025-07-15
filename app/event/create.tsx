import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { useCalendarStore } from '@/store/calendarStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { EventType, EventStatus } from '@/types';
import { Calendar, Clock, MapPin, Users, Type } from 'lucide-react-native';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'training', label: 'Обучение' },
  { value: 'meeting', label: 'Совещание' },
  { value: 'exercise', label: 'Учения' },
  { value: 'inspection', label: 'Инспекция' },
  { value: 'ceremony', label: 'Церемония' },
  { value: 'other', label: 'Другое' },
];

const EVENT_COLORS = [
  '#2E5A88', '#6B8E23', '#D32F2F', '#F9A825', '#7B1FA2', '#00796B'
];

export default function CreateEventScreen() {
  const { addEvent } = useCalendarStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('training');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название события');
      return;
    }
    
    if (!startDate) {
      Alert.alert('Ошибка', 'Выберите дату начала');
      return;
    }
    
    if (!isAllDay && (!startTime || !endTime)) {
      Alert.alert('Ошибка', 'Выберите время начала и окончания');
      return;
    }
    
    setLoading(true);
    
    try {
      const startDateTime = isAllDay 
        ? new Date(startDate).toISOString()
        : new Date(`${startDate}T${startTime}`).toISOString();
        
      const endDateTime = isAllDay
        ? new Date(endDate || startDate).toISOString()
        : new Date(`${endDate || startDate}T${endTime}`).toISOString();
      
      addEvent({
        title: title.trim(),
        description: description.trim(),
        type,
        status: 'scheduled' as EventStatus,
        startDate: startDateTime,
        endDate: endDateTime,
        location: location.trim() || undefined,
        organizer: user?.id || '',
        participants: [],
        isAllDay,
        unit: user?.unit || '',
        color: selectedColor,
      });
      
      Alert.alert('Успех', 'Событие создано', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать событие');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Новое событие',
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
                Сохранить
              </Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Название *</Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Введите название события"
            />
          </View>
          
          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Описание</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Описание события"
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Event Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Тип события</Text>
            <View style={styles.typeSelector}>
              {EVENT_TYPES.map((eventType) => (
                <TouchableOpacity
                  key={eventType.value}
                  style={[
                    styles.typeOption,
                    type === eventType.value && styles.typeOptionSelected
                  ]}
                  onPress={() => setType(eventType.value)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    type === eventType.value && styles.typeOptionTextSelected
                  ]}>
                    {eventType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* All Day Toggle */}
          <View style={styles.field}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Весь день</Text>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={isAllDay ? colors.primary : colors.inactive}
              />
            </View>
          </View>
          
          {/* Start Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Дата начала *</Text>
            <Input
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          {/* Start Time */}
          {!isAllDay && (
            <View style={styles.field}>
              <Text style={styles.label}>Время начала *</Text>
              <Input
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
              />
            </View>
          )}
          
          {/* End Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Дата окончания</Text>
            <Input
              value={endDate}
              onChangeText={setEndDate}
              placeholder={startDate || "YYYY-MM-DD"}
            />
          </View>
          
          {/* End Time */}
          {!isAllDay && (
            <View style={styles.field}>
              <Text style={styles.label}>Время окончания *</Text>
              <Input
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
              />
            </View>
          )}
          
          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Место проведения</Text>
            <Input
              value={location}
              onChangeText={setLocation}
              placeholder="Введите место проведения"
            />
          </View>
          
          {/* Color Picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Цвет события</Text>
            <View style={styles.colorPicker}>
              {EVENT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Создать событие"
          onPress={handleSubmit}
          loading={loading}
          style={styles.createButton}
        />
      </View>
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
  saveButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: colors.inactive,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: 12,
    color: colors.text,
  },
  typeOptionTextSelected: {
    color: colors.card,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  createButton: {
    marginTop: 0,
  },
});