import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useReportsStore } from '@/store/reportsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { trpc } from '@/lib/trpc';
import { TaskCard } from '@/components/TaskCard';
import { ReportCard } from '@/components/ReportCard';
import { Button } from '@/components/Button';
import { FloatingMenu, FloatingActionButton } from '@/components/FloatingMenu';
import { DataManager } from '@/components/DataManager';
import { QuickAddCard } from '@/components/QuickAddCard';
import { QuickActions } from '@/components/QuickActions';
import { StatusIndicator } from '@/components/StatusIndicator';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { NotificationBadge } from '@/components/NotificationBadge';
import { NetworkConnectionTest } from '@/components/NetworkConnectionTest';
import { Platform } from 'react-native';
import { useTheme } from '@/constants/theme';
import { formatDate } from '@/utils/dateUtils';
import { FileText, CheckSquare, Plus, ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react-native';
import { Task, Report } from '@/types';


const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTasksStore();
  const { reports, fetchReports, isLoading: reportsLoading } = useReportsStore();
  const { notifications, fetchNotifications } = useNotificationsStore();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDataManagerVisible, setIsDataManagerVisible] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'report' | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // Debug logging
  if (__DEV__) {
    console.log('Home render:', {
      isInitialized,
      isAuthenticated,
      hasUser: !!user,
      userName: user?.name,
      tasksCount: tasks?.length || 0,
      reportsCount: reports?.length || 0,
      tasksLoading,
      reportsLoading
    });
  }

  
  // Test tRPC connection (enabled for mobile with proper error handling)
  const { data: backendTest, isLoading: backendLoading, error: backendError } = trpc.example.hi.useQuery(
    { name: user?.name || 'Anonymous' },
    { 
      enabled: !!user, // Enable when user is available
      retry: 1, // Only retry once
      staleTime: 60000, // Cache for 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,

    }
  );
  
  // Log backend connection status
  useEffect(() => {
    if (__DEV__) {
      if (backendError) {
        console.warn('Backend connection failed:', backendError);
      } else if (backendTest) {
        console.log('Backend connected successfully:', backendTest);
      }
    }
  }, [backendTest, backendError]);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      if (__DEV__) console.log('Home: User authenticated, fetching data...');
      fetchTasks();
      fetchReports();
      fetchNotifications(user.id);
      
      // Animate content appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAuthenticated, user]);
  
  const userTasks = useMemo(() => {
    if (!user || !tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => task.assignedTo === user.id)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [tasks, user]);
  
  const recentReports = useMemo(() => {
    if (!reports) return [];
    return reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [reports]);
  
  const handleRefresh = () => {
    fetchTasks();
    fetchReports();
    if (user) {
      fetchNotifications(user.id);
    }
  };
  
  const unreadNotifications = notifications.filter(n => n.userId === user?.id && !n.read);
  

  
  const navigateToTask = (task: Task) => {
    router.push(`/task/${task.id}`);
  };
  
  const navigateToReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  // Show loading only if not initialized
  if (!isInitialized) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.authText}>Инициализация...</Text>
      </View>
    );
  }

  // If not authenticated, show a simple message (navigation should handle redirect)
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Требуется авторизация</Text>
        <Button 
          title="Войти" 
          onPress={() => router.push('/login')} 
          style={styles.authButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={tasksLoading || reportsLoading} 
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}

      >
        {/* Network Diagnostics (Development Only) */}
        {__DEV__ && <NetworkConnectionTest />}

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Shield size={24} color={colors.primary} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.greeting}>Добро пожаловать</Text>
                <Text style={styles.name}>{user.rank} {user.name}</Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <StatusIndicator 
                isOnline={true}
                serverStatus={backendError ? 'error' : (backendTest ? 'connected' : 'disconnected')}
              />
              {Platform.OS !== 'web' && backendError && (
                <Text style={styles.mockModeText}>Mock режим</Text>
              )}
            </View>

          </View>
          

        </View>

        {/* Quick Actions */}
        <QuickActions />

        {/* Quick Stats */}
      <Animated.View 
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/reports')}>
          <View style={[styles.statIconContainer, { backgroundColor: colors.primarySoft }]}>
            <CheckSquare size={20} color={colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{userTasks.length}</Text>
            <Text style={styles.statLabel}>Активных задач</Text>
          </View>
          <View style={styles.statTrend}>
            <Clock size={14} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/reports')}>
          <View style={[styles.statIconContainer, { backgroundColor: colors.secondarySoft }]}>
            <FileText size={20} color={colors.secondary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{reports?.length || 0}</Text>
            <Text style={styles.statLabel}>Отчетов</Text>
          </View>
          <View style={styles.statTrend}>
            <TrendingUp size={14} color={colors.success} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/analytics')}>
          <View style={[styles.statIconContainer, { backgroundColor: colors.successSoft }]}>
            <TrendingUp size={20} color={colors.success} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Выполнено</Text>
          </View>
          <View style={styles.statTrend}>
            <ArrowRight size={14} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Tasks Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionIconContainer}>
              <CheckSquare size={18} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Ваши задачи</Text>
          </View>
          <TouchableOpacity 
            style={styles.sectionAction}
            onPress={() => router.push('/(tabs)/reports')}
          >
            <Text style={styles.sectionActionText}>Все задачи</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {userTasks.length > 0 ? (
          <View style={styles.cardsContainer}>
            {userTasks.map(task => (
              <TaskCard key={task.id} task={task} onPress={navigateToTask} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <CheckSquare size={32} color={colors.inactive} />
            </View>
            <Text style={styles.emptyTitle}>Нет активных задач</Text>
            <Text style={styles.emptyDescription}>Создайте новую задачу или дождитесь назначения</Text>
          </View>
        )}
      </View>
      
      {/* Reports Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionIconContainer}>
              <FileText size={18} color={colors.secondary} />
            </View>
            <Text style={styles.sectionTitle}>Последние отчеты</Text>
          </View>
          <TouchableOpacity 
            style={styles.sectionAction}
            onPress={() => router.push('/(tabs)/reports')}
          >
            <Text style={styles.sectionActionText}>Все отчеты</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {recentReports.length > 0 ? (
          <View style={styles.cardsContainer}>
            {recentReports.map(report => (
              <ReportCard key={report.id} report={report} onPress={navigateToReport} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <FileText size={32} color={colors.inactive} />
            </View>
            <Text style={styles.emptyTitle}>Нет отчетов</Text>
            <Text style={styles.emptyDescription}>Создайте первый отчет для вашего подразделения</Text>
          </View>
        )}
      </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setIsDataManagerVisible(true)} />
      
      {/* Data Manager Modal */}
      <DataManager 
        visible={isDataManagerVisible} 
        onClose={() => setIsDataManagerVisible(false)} 
      />
      
      {/* Floating Menu */}
      <FloatingMenu 
        visible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  authButton: {
    minWidth: 120,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
    fontWeight: '500',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mockModeText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '500',
  },


  
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
    width: '100%',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 16,
  },
  statTrend: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  
  // Section Styles
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  
  // Cards Container
  cardsContainer: {
    gap: 12,
  },
  
  // Empty State
  emptyStateContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  
  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

});