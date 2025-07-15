import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ReportComments } from '../../components/ReportComments';
import { ReportRevisionHistory } from '../../components/ReportRevisionHistory';
import { colors } from '@/constants/colors';
import { formatDateTime } from '@/utils/dateUtils';
import { getUser } from '@/constants/mockData';
import { 
  FileText, 
  Paperclip, 
  Download, 
  CheckCircle, 
  XCircle,
  Edit,
  AlertCircle,
  MessageSquare,
  History
} from 'lucide-react-native';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    reports, 
    getReportById, 
    updateReportStatus, 
    approveReport,
    rejectReport,
    requestRevision,
    submitRevision,
    isLoading 
  } = useReportsStore();
  const currentUser = useAuthStore(state => state.user);
  
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionTitle, setRevisionTitle] = useState('');
  const [revisionContent, setRevisionContent] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision' | null>(null);
  
  const report = getReportById(id);
  const author = report ? getUser(report.author) : null;
  
  const canApprove = currentUser && report?.approvers.includes(currentUser.id);
  const isAuthor = currentUser && report?.author === currentUser.id;
  const canRevise = isAuthor && report?.status === 'needs_revision';
  
  const handleAction = (type: 'approve' | 'reject' | 'revision') => {
    setActionType(type);
    setActionComment('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!id || !actionType) return;

    try {
      switch (actionType) {
        case 'approve':
          await approveReport(id, actionComment || undefined);
          break;
        case 'reject':
          if (!actionComment.trim()) {
            Alert.alert('Ошибка', 'Укажите причину отклонения');
            return;
          }
          await rejectReport(id, actionComment);
          break;
        case 'revision':
          if (!actionComment.trim()) {
            Alert.alert('Ошибка', 'Укажите что нужно доработать');
            return;
          }
          await requestRevision(id, actionComment);
          break;
      }
      setShowActionModal(false);
      setActionType(null);
      setActionComment('');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выполнить действие');
    }
  };

  const handleRevision = () => {
    if (!report) return;
    setRevisionTitle(report.title);
    setRevisionContent(report.content);
    setShowRevisionModal(true);
  };

  const submitRevisionHandler = async () => {
    if (!id || !revisionTitle.trim() || !revisionContent.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      await submitRevision(id, revisionTitle, revisionContent, report?.attachments || []);
      setShowRevisionModal(false);
      setRevisionTitle('');
      setRevisionContent('');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить доработку');
    }
  };
  
  if (isLoading || !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{ 
          title: 'Отчет',
          headerRight: () => canRevise ? (
            <TouchableOpacity onPress={handleRevision}>
              <Edit size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : undefined,
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FileText size={24} color={colors.primary} />
          <Text style={styles.title}>{report.title}</Text>
        </View>
        <StatusBadge status={report.status} />
      </View>
      
      <View style={styles.metaContainer}>
        <View style={styles.authorContainer}>
          <Avatar 
            uri={author?.avatar} 
            name={author?.name || 'Неизвестный'} 
            size={40} 
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{author?.name || 'Неизвестный'}</Text>
            <Text style={styles.authorRank}>{author?.rank || ''}</Text>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Дата создания:</Text>
          <Text style={styles.date}>{formatDateTime(report.createdAt)}</Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Обновлено:</Text>
          <Text style={styles.date}>{formatDateTime(report.updatedAt)}</Text>
        </View>
        
        <View style={styles.unitContainer}>
          <Text style={styles.unitLabel}>Подразделение:</Text>
          <Text style={styles.unit}>{report.unit}</Text>
        </View>
        
        {report.priority && (
          <View style={styles.unitContainer}>
            <Text style={styles.unitLabel}>Приоритет:</Text>
            <Text style={[styles.unit, { color: getPriorityColor(report.priority) }]}>
              {getPriorityText(report.priority)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentBox}>
        <Text style={styles.contentText}>{report.content}</Text>
      </View>
      
      {report.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <View style={styles.attachmentsHeader}>
            <Paperclip size={20} color={colors.textSecondary} />
            <Text style={styles.attachmentsTitle}>Вложения</Text>
          </View>
          
          {report.attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <View style={styles.attachmentInfo}>
                <FileText size={20} color={colors.primary} />
                <Text style={styles.attachmentName}>{attachment.name}</Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Download size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Revision History */}
      <ReportRevisionHistory 
        revisions={report.revisions} 
        currentRevision={report.currentRevision} 
      />
      
      {/* Comments */}
      <ReportComments 
        reportId={id}
        comments={report.comments}
      />
      
      {/* Approval Actions */}
      {canApprove && (report.status === 'pending' || report.status === 'needs_revision') && (
        <View style={styles.actionsContainer}>
          <Button
            title="Утвердить"
            onPress={() => handleAction('approve')}
            style={styles.approveButton}
            icon={<CheckCircle size={18} color="white" />}
          />
          <Button
            title="Доработка"
            onPress={() => handleAction('revision')}
            style={[styles.revisionButton, { backgroundColor: colors.warning }]}
            icon={<AlertCircle size={18} color="white" />}
          />
          <Button
            title="Отклонить"
            onPress={() => handleAction('reject')}
            variant="danger"
            style={styles.rejectButton}
            icon={<XCircle size={18} color="white" />}
          />
        </View>
      )}
      
      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' ? 'Утверждение отчета' :
               actionType === 'reject' ? 'Отклонение отчета' :
               'Запрос доработки'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder={
                actionType === 'approve' ? 'Комментарий (необязательно)' :
                actionType === 'reject' ? 'Укажите причину отклонения' :
                'Укажите что нужно доработать'
              }
              value={actionComment}
              onChangeText={setActionComment}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Отмена"
                onPress={() => setShowActionModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={
                  actionType === 'approve' ? 'Утвердить' :
                  actionType === 'reject' ? 'Отклонить' :
                  'Отправить'
                }
                onPress={confirmAction}
                loading={isLoading}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor:
                      actionType === 'approve' ? colors.success :
                      actionType === 'reject' ? colors.error :
                      colors.warning
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Revision Modal */}
      <Modal
        visible={showRevisionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRevisionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Доработка отчета</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Заголовок отчета"
              value={revisionTitle}
              onChangeText={setRevisionTitle}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Содержание отчета"
              value={revisionContent}
              onChangeText={setRevisionContent}
              multiline
              numberOfLines={6}
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Отмена"
                onPress={() => setShowRevisionModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Отправить"
                onPress={submitRevisionHandler}
                loading={isLoading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  metaContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  authorRank: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  date: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  unitContainer: {
    flexDirection: 'row',
  },
  unitLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  unit: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  contentBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  attachmentsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  attachmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  downloadButton: {
    padding: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    marginLeft: 8,
  },
  revisionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return colors.error;
    case 'medium': return colors.warning;
    case 'low': return colors.success;
    default: return colors.textSecondary;
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return priority;
  }
};