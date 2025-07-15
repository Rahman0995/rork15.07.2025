import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { ReportComment } from '@/types';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { getUser } from '@/constants/mockData';
import { formatDateTime } from '@/utils/dateUtils';
import { MessageSquare, Send } from 'lucide-react-native';

interface ReportCommentsProps {
  reportId: string;
  comments: ReportComment[];
}

export const ReportComments: React.FC<ReportCommentsProps> = ({
  reportId,
  comments,
}) => {
  const [newComment, setNewComment] = useState('');
  const { addComment, isLoading } = useReportsStore();
  const { user: currentUser } = useAuthStore();

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Ошибка', 'Введите текст комментария');
      return;
    }

    try {
      await addComment(reportId, newComment.trim());
      setNewComment('');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить комментарий');
    }
  };

  const renderComment = ({ item }: { item: ReportComment }) => {
    const author = getUser(item.authorId);
    
    return (
      <View style={styles.commentItem}>
        <Avatar
          uri={author?.avatar}
          name={author?.name || 'Неизвестный'}
          size={32}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>
              {author?.name || 'Неизвестный'}
            </Text>
            <Text style={styles.commentDate}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
          {item.isRevision && (
            <View style={styles.revisionBadge}>
              <Text style={styles.revisionBadgeText}>Доработка</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageSquare size={20} color={colors.textSecondary} />
        <Text style={styles.title}>Комментарии ({comments.length})</Text>
      </View>

      {comments.length > 0 ? (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noComments}>Комментариев пока нет</Text>
      )}

      {currentUser && (
        <View style={styles.addCommentContainer}>
          <Avatar
            uri={currentUser.avatar}
            name={currentUser.name}
            size={32}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Добавить комментарий..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: newComment.trim() ? 1 : 0.5 }
              ]}
              onPress={handleAddComment}
              disabled={!newComment.trim() || isLoading}
            >
              <Send size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  commentsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  noComments: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  revisionBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  revisionBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
});