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
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { mockUsers } from '@/constants/mockData';
import { Paperclip, X, Image, FileText, Video, AlertTriangle, Clock, CheckCircle } from 'lucide-react-native';

export default function CreateReportScreen() {
  const router = useRouter();
  const { createReport, isLoading } = useReportsStore();
  const { user: currentUser } = useAuthStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{ name: string; type: 'file' | 'image' | 'video' }[]>([]);
  
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [approversError, setApproversError] = useState('');
  
  // Get potential approvers based on user hierarchy
  const potentialApprovers = mockUsers.filter(user => 
    user.role === 'battalion_commander' || 
    (user.role === 'company_commander' && user.unit !== currentUser?.unit)
  );
  
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Введите название отчета');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (!content.trim()) {
      setContentError('Введите содержание отчета');
      isValid = false;
    } else {
      setContentError('');
    }
    
    if (selectedApprovers.length === 0) {
      setApproversError('Выберите хотя бы одного утверждающего');
      isValid = false;
    } else {
      setApproversError('');
    }
    
    return isValid;
  };
  
  const toggleApprover = (approverId: string) => {
    setSelectedApprovers(prev => 
      prev.includes(approverId) 
        ? prev.filter(id => id !== approverId)
        : [...prev, approverId]
    );
  };
  
  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };
  
  const getPriorityIcon = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'high': return <AlertTriangle size={16} color={colors.error} />;
      case 'medium': return <Clock size={16} color={colors.warning} />;
      case 'low': return <CheckCircle size={16} color={colors.success} />;
      default: return null;
    }
  };
  
  const handleAddAttachment = () => {
    // In a real app, this would open a file picker
    Alert.alert(
      'Добавление вложения',
      'Выберите тип вложения',
      [
        {
          text: 'Файл',
          onPress: () => {
            setAttachments([...attachments, { name: `document_${Date.now()}.pdf`, type: 'file' }]);
          },
        },
        {
          text: 'Изображение',
          onPress: () => {
            setAttachments([...attachments, { name: `image_${Date.now()}.jpg`, type: 'image' }]);
          },
        },
        {
          text: 'Видео',
          onPress: () => {
            setAttachments([...attachments, { name: `video_${Date.now()}.mp4`, type: 'video' }]);
          },
        },
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ]
    );
  };
  
  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !currentUser) return;
    
    try {
      await createReport({
        title,
        content,
        authorId: currentUser.id,
        status: 'pending',
        type: 'text',
        priority,
        dueDate: dueDate || undefined,
        approvers: selectedApprovers,
        currentApprover: selectedApprovers[0],
        attachments: attachments.map((att, index) => ({
          id: `${index + 1}`,
          name: att.name,
          type: att.type,
          url: '#',
        })),
        unit: currentUser.unit,
      });
      
      Alert.alert(
        'Успешно',
        'Отчет успешно создан',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать отчет');
    }
  };
  
  const getAttachmentIcon = (type: 'file' | 'image' | 'video') => {
    switch (type) {
      case 'file':
        return <FileText size={20} color={colors.primary} />;
      case 'image':
        return <Image size={20} color={colors.primary} />;
      case 'video':
        return <Video size={20} color={colors.primary} />;
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: 'Создание отчета' }} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Input
            label="Название отчета"
            placeholder="Введите название отчета"
            value={title}
            onChangeText={setTitle}
            error={titleError}
          />
        </View>
        
        <View style={styles.formSection}>
          <Input
            label="Содержание отчета"
            placeholder="Введите содержание отчета"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={styles.contentInput}
            error={contentError}
          />
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.priorityContainer}>
            <Text style={styles.sectionTitle}>Приоритет</Text>
            <View style={styles.priorityButtons}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    priority === level && styles.activePriorityButton,
                    { borderColor: priority === level ? getPriorityColor(level) : colors.border }
                  ]}
                  onPress={() => setPriority(level)}
                >
                  {getPriorityIcon(level)}
                  <Text style={[
                    styles.priorityButtonText,
                    priority === level && { color: getPriorityColor(level) }
                  ]}>
                    {level === 'low' ? 'Низкий' : level === 'medium' ? 'Средний' : 'Высокий'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Input
            label="Срок выполнения (необязательно)"
            placeholder="Введите срок"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.approversContainer}>
            <Text style={styles.sectionTitle}>Утверждающие</Text>
            {approversError ? <Text style={styles.errorText}>{approversError}</Text> : null}
            <View style={styles.approversList}>
              {potentialApprovers.map((approver, index) => (
                <TouchableOpacity
                  key={approver.id}
                  style={[
                    styles.approverItem,
                    selectedApprovers.includes(approver.id) && styles.selectedApprover,
                    index === potentialApprovers.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => toggleApprover(approver.id)}
                >
                  <View style={styles.approverInfo}>
                    <Text style={styles.approverName}>{approver.name}</Text>
                    <Text style={styles.approverRank}>{approver.rank}</Text>
                    <Text style={styles.approverUnit}>{approver.unit}</Text>
                  </View>
                  {selectedApprovers.includes(approver.id) && (
                    <CheckCircle size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.attachmentsContainer}>
            <View style={styles.attachmentsHeader}>
              <Text style={styles.attachmentsTitle}>Вложения</Text>
              <Button
                title="Добавить"
                onPress={handleAddAttachment}
                size="small"
                icon={<Paperclip size={18} color="white" />}
              />
            </View>
            
            {attachments.length > 0 ? (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <View key={index} style={[
                    styles.attachmentItem,
                    index === attachments.length - 1 && { borderBottomWidth: 0 }
                  ]}>
                    <View style={styles.attachmentInfo}>
                      {getAttachmentIcon(attachment.type)}
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveAttachment(index)}
                    >
                      <X size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noAttachmentsContainer}>
                <Text style={styles.noAttachments}>Нет вложений</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Отмена"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Создать отчет"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  contentInput: {
    minHeight: 140,
    paddingTop: 16,
  },
  attachmentsContainer: {
    gap: 16,
  },
  attachmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  attachmentsList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  attachmentName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  removeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.error + '15',
  },
  noAttachments: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 32,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  priorityContainer: {
    gap: 16,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 8,
    minHeight: 56,
  },
  activePriorityButton: {
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priorityButtonText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  approversContainer: {
    gap: 16,
  },
  approversList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  approverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    minHeight: 80,
  },
  selectedApprover: {
    backgroundColor: colors.primary + '12',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  approverInfo: {
    flex: 1,
    gap: 4,
  },
  approverName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  approverRank: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  approverUnit: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
    marginTop: -8,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noAttachmentsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
});