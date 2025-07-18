import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useReportsStore } from '@/store/reportsStore';
import { useTheme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Plus, CheckSquare, FileText, X } from 'lucide-react-native';
import { Task, Report } from '@/types';

interface QuickAddCardProps {
  type: 'task' | 'report';
  onClose: () => void;
}

export function QuickAddCard({ type, onClose }: QuickAddCardProps) {
  const { user } = useAuthStore();
  const { addTask } = useTasksStore();
  const { addReport } = useReportsStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !user) {
      Alert.alert('Ошибка', `Заполните название ${type === 'task' ? 'задачи' : 'отчета'}`);
      return;
    }

    if (type === 'task') {
      const newTask: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        assignedTo: user.id,
        createdBy: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTask(newTask);
      Alert.alert('Успешно', 'Задача создана');
    } else {
      if (!description.trim()) {
        Alert.alert('Ошибка', 'Заполните содержание отчета');
        return;
      }

      const newReport: Report = {
        id: Date.now().toString(),
        title: title.trim(),
        content: description.trim(),
        authorId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        type: 'text',
        attachments: [],
        unit: user.unit || undefined,
        priority: 'medium',
        approvers: [],
        currentApprover: null,
        approvals: [],
        comments: [],
        revisions: [],
        currentRevision: 1,
      };
      addReport(newReport);
      Alert.alert('Успешно', 'Отчет создан');
    }

    setTitle('');
    setDescription('');
    onClose();
  };

  const Icon = type === 'task' ? CheckSquare : FileText;
  const color = type === 'task' ? colors.primary : colors.secondary;

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon size={16} color={color} />
          </View>
          <Text style={styles.title}>
            Быстрое создание {type === 'task' ? 'задачи' : 'отчета'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={`Название ${type === 'task' ? 'задачи' : 'отчета'}`}
          placeholderTextColor={colors.textTertiary}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder={type === 'task' ? 'Описание (необязательно)' : 'Содержание отчета'}
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
        />

        <View style={styles.actions}>
          <Button
            title={`Создать ${type === 'task' ? 'задачу' : 'отчет'}`}
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: color }]}
            disabled={!title.trim() || (type === 'report' && !description.trim())}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 8,
  },
  submitButton: {
    height: 40,
  },
});