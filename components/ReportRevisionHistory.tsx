import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ReportRevision } from '@/types';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/constants/colors';
import { getUser } from '@/constants/mockData';
import { formatDateTime } from '@/utils/dateUtils';
import { History, ChevronDown, ChevronUp, FileText } from 'lucide-react-native';

interface ReportRevisionHistoryProps {
  revisions: ReportRevision[];
  currentRevision: number;
}

export const ReportRevisionHistory: React.FC<ReportRevisionHistoryProps> = ({
  revisions,
  currentRevision,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (revisions.length === 0) {
    return null;
  }

  const sortedRevisions = [...revisions].sort((a, b) => b.version - a.version);

  const renderRevision = ({ item }: { item: ReportRevision }) => {
    const author = getUser(item.authorId);
    const isCurrent = item.version === currentRevision;
    
    return (
      <View style={[styles.revisionItem, isCurrent && styles.currentRevision]}>
        <View style={styles.revisionHeader}>
          <View style={styles.revisionInfo}>
            <Avatar
              uri={author?.avatar}
              name={author?.name || 'Неизвестный'}
              size={32}
            />
            <View style={styles.revisionDetails}>
              <View style={styles.revisionTitleRow}>
                <Text style={styles.revisionVersion}>
                  Версия {item.version}
                </Text>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Текущая</Text>
                  </View>
                )}
              </View>
              <Text style={styles.revisionAuthor}>
                {author?.name || 'Неизвестный'}
              </Text>
              <Text style={styles.revisionDate}>
                {formatDateTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.revisionContent}>
          <Text style={styles.revisionTitle}>{item.title}</Text>
          <Text style={styles.revisionText} numberOfLines={3}>
            {item.content}
          </Text>
          
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsInfo}>
              <FileText size={14} color={colors.textSecondary} />
              <Text style={styles.attachmentsCount}>
                {item.attachments.length} вложений
              </Text>
            </View>
          )}

          {item.comment && (
            <View style={styles.revisionComment}>
              <Text style={styles.revisionCommentLabel}>Комментарий:</Text>
              <Text style={styles.revisionCommentText}>{item.comment}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <History size={20} color={colors.textSecondary} />
          <Text style={styles.title}>
            История изменений ({revisions.length})
          </Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <FlatList
          data={sortedRevisions}
          renderItem={renderRevision}
          keyExtractor={(item) => item.id}
          style={styles.revisionsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  revisionsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    maxHeight: 400,
    nestedScrollEnabled: true,
  },
  revisionItem: {
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
    paddingLeft: 12,
    marginBottom: 16,
  },
  currentRevision: {
    borderLeftColor: colors.primary,
  },
  revisionHeader: {
    marginBottom: 8,
  },
  revisionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revisionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  revisionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  revisionVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  currentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  revisionAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  revisionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  revisionContent: {
    paddingLeft: 44,
  },
  revisionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  revisionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  attachmentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentsCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  revisionComment: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: colors.warning,
  },
  revisionCommentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  revisionCommentText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
});