import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Report } from '@/types';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/dateUtils';
import { Clock, User } from 'lucide-react-native';

interface ReportApprovalCardProps {
  report: Report;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string) => void;
  onRequestRevision: (reportId: string) => void;
  onPress: (report: Report) => void;
}

export const ReportApprovalCard: React.FC<ReportApprovalCardProps> = ({
  report,
  onApprove,
  onReject,
  onRequestRevision,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(report)}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {report.title}
          </Text>
          <StatusBadge status={report.status} />
        </View>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <User size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>Автор: {report.author}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.content} numberOfLines={3}>
        {report.content}
      </Text>
      
      <View style={styles.actions}>
        <Button
          title="Утвердить"
          onPress={() => onApprove(report.id)}
          size="small"
          variant="primary"
          style={styles.actionButton}
        />
        <Button
          title="Доработка"
          onPress={() => onRequestRevision(report.id)}
          size="small"
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Отклонить"
          onPress={() => onReject(report.id)}
          size="small"
          variant="danger"
          style={styles.actionButton}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});