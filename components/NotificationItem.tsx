import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppNotification } from '@/store/notificationsStore';
import { Avatar } from './Avatar';
import { formatChatDate } from '@/utils/dateUtils';
import { useTheme } from '@/constants/theme';
import { 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react-native';

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onPress,
  onMarkAsRead 
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const getIcon = () => {
    switch (notification.type) {
      case 'task_assigned':
        return <CheckSquare size={20} color={colors.primary} />;
      case 'task_due':
        return <Clock size={20} color={colors.warning} />;
      case 'report_created':
        return <FileText size={20} color={colors.info} />;
      case 'report_approved':
        return <CheckCircle size={20} color={colors.success} />;
      case 'report_rejected':
        return <XCircle size={20} color={colors.error} />;
      case 'chat_message':
        return <MessageSquare size={20} color={colors.secondary} />;
      default:
        return <FileText size={20} color={colors.textSecondary} />;
    }
  };

  const getIconBackground = () => {
    switch (notification.type) {
      case 'task_assigned':
        return colors.primary + '15';
      case 'task_due':
        return colors.warning + '15';
      case 'report_created':
        return colors.info + '15';
      case 'report_approved':
        return colors.success + '15';
      case 'report_rejected':
        return colors.error + '15';
      case 'chat_message':
        return colors.secondary + '15';
      default:
        return colors.border;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        !notification.read && styles.unreadContainer
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconBackground() }]}>
        {getIcon()}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            !notification.read && styles.unreadTitle
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.time}>
            {formatChatDate(notification.createdAt)}
          </Text>
        </View>
        
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
        
        {!notification.read && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadContainer: {
    backgroundColor: colors.primary + '05',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});