import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Report } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/utils/dateUtils';
import { useTheme } from '@/constants/theme';
import { FileText } from 'lucide-react-native';

interface SimpleReportCardProps {
  report: Report;
  onPress: (report: Report) => void;
}

const SimpleReportCardComponent: React.FC<SimpleReportCardProps> = ({ report, onPress }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const formattedDate = useMemo(() => formatDate(report.createdAt || ''), [report.createdAt]);

  const handlePress = useCallback(() => {
    onPress(report);
  }, [onPress, report]);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FileText size={20} color={colors.secondary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <StatusBadge status={report.status} />
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {report.content}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.unit}>{report.unit || 'Общий'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  unit: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
    backgroundColor: colors.secondarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export const SimpleReportCard = memo(SimpleReportCardComponent);