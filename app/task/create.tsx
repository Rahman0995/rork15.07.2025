import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTasksStore } from '@/store/tasksStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/constants/colors';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { mockUsers } from '@/constants/mockData';
import { TaskPriority } from '@/types';

export default function CreateTaskScreen() {
  const router = useRouter();
  const { createTask, isLoading } = useTasksStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<TaskPriority>('medium');
  
  const [titleError, setTitleError] = useState('');
  const [assigneeError, setAssigneeError] = useState('');
  
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Введите название задачи');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (!assignedTo) {
      setAssigneeError('Выберите исполнителя');
      isValid = false;
    } else {
      setAssigneeError('');
    }
    
    return isValid;
  };
  
  const handleSelectAssignee = () => {
    // In a real app, this would open a modal with a list of users
    Alert.alert(
      'Выбор исполнителя',
      'Выберите исполнителя задачи',
      [
        ...mockUsers.map(u => ({
          text: `${u.rank} ${u.name}`,
          onPress: () => setAssignedTo(u.id),
        })),
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ]
    );
  };
  
  const handleSelectPriority = () => {
    Alert.alert(
      'Выбор приоритета',
      'Выберите приоритет задачи',
      [
        {
          text: 'Высокий',
          onPress: () => setPriority('high'),
        },
        {
          text: 'Средний',
          onPress: () => setPriority('medium'),
        },
        {
          text: 'Низкий',
          onPress: () => setPriority('low'),
        },
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ]
    );
  };
  
  const handleSelectDueDate = () => {
    // In a real app, this would open a date picker
    Alert.alert(
      'Выбор срока выполнения',
      'В реальном приложении здесь будет календарь',
      [
        {
          text: 'OK',
          onPress: () => {},
        },
      ]
    );
  };
  
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    if (!validateForm() || !user) {
      console.log('Validation failed or no user');
      return;
    }
    
    console.log('Starting task creation...');
    try {
      await createTask({
        title,
        description,
        assignedTo,
        assignedBy: user.id,
        dueDate: new Date(dueDate).toISOString(),
        status: 'pending',
        priority,
      });
      
      console.log('Task creation completed, showing success alert');
      Alert.alert(
        'Успешно',
        'Задача успешно создана',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Success alert OK pressed');
              // Navigate back to the home screen
              router.replace('/(tabs)/');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Ошибка', 'Не удалось создать задачу. Попробуйте еще раз.');
    }
  };
  
  const selectedUser = mockUsers.find(u => u.id === assignedTo);
  
  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
    }
  };
  
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: 'Создание задачи' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Input
          label="Название задачи"
          placeholder="Введите название задачи"
          value={title}
          onChangeText={setTitle}
          error={titleError}
        />
        
        <Input
          label="Описание задачи"
          placeholder="Введите описание задачи"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={styles.descriptionInput}
        />
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Исполнитель</Text>
          <TouchableOpacity 
            style={[styles.selectButton, assigneeError ? styles.selectButtonError : null]}
            onPress={handleSelectAssignee}
          >
            {selectedUser ? (
              <View style={styles.selectedUser}>
                <Avatar 
                  uri={selectedUser.avatar} 
                  name={selectedUser.name} 
                  size={32} 
                />
                <View style={styles.selectedUserInfo}>
                  <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                  <Text style={styles.selectedUserRank}>{selectedUser.rank}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.selectButtonText}>Выберите исполнителя</Text>
            )}
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {assigneeError ? <Text style={styles.errorText}>{assigneeError}</Text> : null}
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Приоритет</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={handleSelectPriority}
            >
              <View style={styles.priorityBadge}>
                <View style={[
                  styles.priorityDot, 
                  { backgroundColor: getPriorityColor(priority) }
                ]} />
                <Text style={styles.priorityText}>{getPriorityText(priority)}</Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Срок выполнения</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={handleSelectDueDate}
            >
              <View style={styles.dateContainer}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.dateText}>{dueDate}</Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Отмена"
            onPress={() => {
              console.log('Cancel button pressed');
              router.replace('/(tabs)/');
            }}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Создать задачу"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  descriptionInput: {
    height: 120,
    paddingTop: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectButtonError: {
    borderColor: colors.error,
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedUserInfo: {
    marginLeft: 8,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectedUserRank: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    color: colors.text,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
  },
});