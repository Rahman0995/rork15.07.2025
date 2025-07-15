import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ReportRevision } from '@/types';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/constants/colors';
import { formatDateTime } from '@/utils/dateUtils';
import { getUser } from '@/constants/mockData';
import { History, CheckCircle } from 'lucide-react-native';

interface ReportRevisionHistoryProps {
  revisions: ReportRevision[];
  currentRevision: number;
}

export const ReportRevisionHistory: React.FC<ReportRevisionHistoryProps> = ({
  revisions,
  currentRevision,
}) => {
  if (revisions.length === 0) {
    return null;
  }

  const renderRevision = ({ item, index }: { item: ReportRevision; index: number }) => {
    const author = getUser(item.createdBy);
    const isCurrentRevision = item.version === currentRevision;
    
    return (
      <View style={styles.revisionItem}>
        <View style={styles.revisionHeader}>
          <View style={styles.revisionInfo}>
            <Avatar 
              uri={author?.avatar}
              name={author?.name || 'Unknown'} 
              size={32} 
            />
            <View style={styles.revisionMeta}>
              <View style={styles.revisionTitleRow}>
                <Text style={styles.revisionVersion}>Version {item.version}</Text>
                {isCurrentRevision && (
                  <View style={styles.currentBadge}>
                    <CheckCircle size={12} color={colors.success} />
                    <Text style={styles.currentText}>Current</Text>
                  </View>
                )}
              </View>
              <Text style={styles.revisionAuthor}>{author?.name || 'Unknown'}</Text>
              <Text style={styles.revisionDate}>{formatDateTime(item.createdAt)}</Text>
            </View>
          </View>
        </View>
        
        {item.changes && (
          <View style={styles.changesContainer}>
            <Text style={styles.changesTitle}>Changes:</Text>
            <Text style={styles.changesText}>{item.changes}</Text>
          </View>
        )}
        
        {item.comment && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentTitle}>Comment:</Text>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <History size={20} color={colors.textSecondary} />
        <Text style={styles.title}>Revision History ({revisions.length})</Text>
      </View>
      
      <FlatList
        data={revisions.sort((a, b) => b.version - a.version)}
        renderItem={renderRevision}
        keyExtractor={item => item.id}
        style={styles.revisionsList}
        showsVerticalScrollIndicator={false}
      />
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
  revisionsList: {
    maxHeight: 400,
  },
  revisionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  revisionHeader: {
    marginBottom: 12,
  },
  revisionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  revisionMeta: {
    flex: 1,
  },
  revisionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  revisionVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  currentText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '500',
  },
  revisionAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  revisionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  changesContainer: {
    marginBottom: 8,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  changesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  commentContainer: {
    marginBottom: 8,
  },
  commentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});