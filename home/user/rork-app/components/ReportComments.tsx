import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { ReportComment } from '@/types';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/constants/colors';
import { formatDateTime } from '@/utils/dateUtils';
import { getUser } from '@/constants/mockData';
import { Send, MessageSquare } from 'lucide-react-native';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';

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
  const { currentUser } = useAuthStore();

  const handleSubmit = async () => {
    if (newComment.trim() && currentUser) {
      try {
        await addComment(reportId, newComment.trim());
        setNewComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const renderComment = ({ item }: { item: ReportComment }) => {
    const author = getUser(item.authorId);
    
    return (
      <View style={styles.commentItem}>
        <Avatar 
          uri={author?.avatar}
          name={author?.name || 'Unknown'} 
          size={32} 
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>{author?.name || 'Unknown'}</Text>
            <Text style={styles.commentDate}>{formatDateTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
          {item.isRevision && (
            <View style={styles.revisionBadge}>
              <Text style={styles.revisionText}>Revision</Text>
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
        <Text style={styles.title}>Comments ({comments.length})</Text>
      </View>
      
      {comments.length > 0 ? (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>No comments yet</Text>
      )}
      
      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!newComment.trim() || isLoading}
        >
          <Send size={20} color={newComment.trim() ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  revisionText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginVertical: 16,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});