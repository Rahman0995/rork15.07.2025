import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import { NotificationItem } from '@/components/NotificationItem';
import { Bell, Settings, Filter, Check, Trash2 } from 'lucide-react-native';
import { AppNotification } from '@/store/notificationsStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotificationsStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const styles = createStyles(colors);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id]);

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleNotificationPress = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type and data
    switch (notification.type) {
      case 'task_assigned':
      case 'task_due':
        if (notification.data?.taskId) {
          router.push(`/task/${notification.data.taskId}`);
        }
        break;
      case 'report_created':
      case 'report_approved':
      case 'report_rejected':
      case 'report_revision_requested':
      case 'report_revised':
        if (notification.data?.reportId) {
          router.push(`/report/${notification.data.reportId}`);
        }
        break;
      case 'chat_message':
        if (notification.data?.chatId) {
          router.push(`/chat/${notification.data.chatId}`);
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead(user.id);
    }
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
  };

  const getFilterButtonStyle = (filterType: typeof filter) => [
    styles.filterButton,
    filter === filterType && styles.filterButtonActive
  ];

  const getFilterTextStyle = (filterType: typeof filter) => [
    styles.filterButtonText,
    filter === filterType && styles.filterButtonTextActive
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Bell size={24} color={colors.primary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>Уведомления</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings/notifications')}
          >
            <Settings size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setFilter('all')}
          >
            <Text style={getFilterTextStyle('all')}>
              Все ({notifications?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getFilterButtonStyle('unread')}
            onPress={() => setFilter('unread')}
          >
            <Text style={getFilterTextStyle('unread')}>
              Непрочитанные ({unreadCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getFilterButtonStyle('read')}
            onPress={() => setFilter('read')}
          >
            <Text style={getFilterTextStyle('read')}>
              Прочитанные ({(notifications?.length || 0) - unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        {unreadCount > 0 && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
            >
              <Check size={16} color={colors.primary} />
              <Text style={styles.actionButtonText}>Отметить все как прочитанные</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => user?.id && fetchNotifications(user.id)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          <View style={styles.notificationsContainer}>
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color={colors.inactive} />
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'Нет уведомлений' : 
               filter === 'unread' ? 'Нет непрочитанных уведомлений' : 
               'Нет прочитанных уведомлений'}
            </Text>
            <Text style={styles.emptyDescription}>
              {filter === 'all' 
                ? 'Уведомления о новых задачах, сообщениях и событиях будут появляться здесь'
                : filter === 'unread'
                ? 'Все уведомления прочитаны'
                : 'Прочитанные уведомления будут отображаться здесь'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Filter
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.primary,
  },
  
  // Actions
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  
  // Notifications
  notificationsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 1,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});