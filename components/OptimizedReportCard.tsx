import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Report } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { formatDate } from '@/utils/dateUtils';
import { useTheme } from '@/constants/theme';
import { getUser } from '@/constants/mockData';
import { FileText, Paperclip } from 'lucide-react-native';

interface OptimizedReportCardProps {
  report: Report;
  onPress: (report: Report) => void;
  index?: number;
}

const OptimizedReportCardComponent: React.FC<OptimizedReportCardProps> = ({ report, onPress, index = 0 }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  // Memoize expensive calculations
  const author = useMemo(() => {
    const user = getUser(report.authorId || '');
    return user || { name: 'Неизвестный', avatar: undefined };
  }, [report.authorId]);
  const formattedDate = useMemo(() => formatDate(report.createdAt || ''), [report.createdAt]);
  const hasAttachments = useMemo(() => report.attachments && report.attachments.length > 0, [report.attachments]);

  const handlePress = useCallback(() => {
    onPress(report);
  }, [onPress, report]);

  // Staggered animation for list items
  const animatedValue = useMemo(() => new Animated.Value(0), []);
  
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, index]);

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
        {...(Platform.OS === 'ios' && {
          // iOS-specific optimizations
          shouldRasterizeIOS: true,
          renderToHardwareTextureAndroid: true,
        })}
      >
        <View style={styles.header}>
          <View style={styles.authorContainer}>
            <Avatar 
              uri={author.avatar} 
              name={author.name} 
              size={40} 
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{author.name}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
          <StatusBadge status={report.status} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FileText size={22} color={colors.secondary} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {report.content}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.metaContainer}>
            <Text style={styles.unit}>{report.unit || 'Общий'}</Text>
            {hasAttachments && (
              <View style={styles.attachments}>
                <Paperclip size={14} color={colors.textTertiary} />
                <Text style={styles.attachmentsText}>
                  {report.attachments!.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unit: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600' as const,
    backgroundColor: colors.secondarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  attachmentsText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 4,
    fontWeight: '600' as const,
  },
});

export const OptimizedReportCard = memo(OptimizedReportCardComponent);