import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import { NotificationItem } from '@/components/NotificationItem';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { Settings, CheckCheck, Trash2 } from 'lucide-react-native';
import { AppNotification } from '@/store/notificationsStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    isLoading 
  } = useNotificationsStore();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user]);
  
  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadNotifications = userNotifications.filter(n => !n.read);
  
  const handleNotificationPress = async (notification: AppNotification) => {
    if (isSelectionMode) {
      toggleSelection(notification.id);
      return;
    }
    
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
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
        if (notification.data?.reportId) {
          router.push(`/report/${notification.data.reportId}`);
        }
        break;
      case 'chat_message':
        if (notification.data?.chatId) {
          router.push(`/chat/${notification.data.chatId}`);
        }
        break;
    }
  };
  
  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
  };
  
  const handleDeleteSelected = () => {
    Alert.alert(
      'Удаление уведомлений',
      `Удалить выбранные уведомления (${selectedNotifications.length})?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          onPress: async () => {
            for (const id of selectedNotifications) {
              await deleteNotification(id);
            }
            setSelectedNotifications([]);
            setIsSelectionMode(false);
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>Уведомления</Text>
        {unreadNotifications.length > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unreadNotifications.length}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/settings/notifications')}
        >
          <Settings size={20} color={colors.primary} />
        </TouchableOpacity>
        
        {unreadNotifications.length > 0 && (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleMarkAllAsRead}
          >
            <CheckCheck size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  
  const renderSelectionHeader = () => (
    <View style={styles.selectionHeader}>
      <TouchableOpacity 
        onPress={() => {
          setIsSelectionMode(false);
          setSelectedNotifications([]);
        }}
      >
        <Text style={styles.cancelText}>Отмена</Text>
      </TouchableOpacity>
      
      <Text style={styles.selectionCount}>
        Выбрано: {selectedNotifications.length}
      </Text>
      
      {selectedNotifications.length > 0 && (
        <TouchableOpacity onPress={handleDeleteSelected}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
  
  if (!user) return null;
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Уведомления",
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }} 
      />
      
      {isSelectionMode ? renderSelectionHeader() : renderHeader()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : userNotifications.length > 0 ? (
        <FlatList
          data={userNotifications}
          renderItem={({ item }) => (
            <View style={styles.notificationWrapper}>
              <NotificationItem 
                notification={item} 
                onPress={handleNotificationPress}
              />
              {isSelectionMode && (
                <TouchableOpacity 
                  style={styles.selectionButton}
                  onPress={() => toggleSelection(item.id)}
                >
                  <View style={[
                    styles.selectionCircle,
                    selectedNotifications.includes(item.id) && styles.selectedCircle
                  ]}>
                    {selectedNotifications.includes(item.id) && (
                      <View style={styles.selectionDot} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => user && fetchNotifications(user.id)}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У вас нет уведомлений</Text>
        </View>
      )}
      
      {userNotifications.length > 0 && !isSelectionMode && (
        <View style={styles.bottomActions}>
          <Button
            title="Выбрать"
            onPress={() => setIsSelectionMode(true)}
            variant="outline"
            size="small"
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primarySoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cancelText: {
    color: colors.primary,
    fontSize: 16,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationWrapper: {
    position: 'relative',
  },
  selectionButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});