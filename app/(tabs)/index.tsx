import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useReportsStore } from '@/store/reportsStore';
import { trpc } from '@/lib/trpc';
import { TaskCard } from '@/components/TaskCard';
import { ReportCard } from '@/components/ReportCard';
import { Button } from '@/components/Button';
import { FloatingMenu, FloatingActionButton } from '@/components/FloatingMenu';
import { useTheme } from '@/constants/theme';
import { formatDate } from '@/utils/dateUtils';
import { FileText, CheckSquare, Plus, ArrowRight, Calendar, Users, TrendingUp, Shield, Activity, Clock } from 'lucide-react-native';
import { Task, Report } from '@/types';
import { notifyGlobalScroll } from './_layout';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTasksStore();
  const { reports, fetchReports, isLoading: reportsLoading } = useReportsStore();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const [scrollY, setScrollY] = useState(0);
  
  // Test tRPC connection
  const { data: backendTest, isLoading: backendLoading } = trpc.example.hi.useQuery(
    { name: user?.name || 'Anonymous' },
    { enabled: isAuthenticated }
  );
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchReports();
      
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
  }, [isAuthenticated]);
  
  const userTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter(task => task.assignedTo === user.id)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [tasks, user]);
  
  const recentReports = useMemo(() => {
    return reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [reports]);
  
  const handleRefresh = () => {
    fetchTasks();
    fetchReports();
  };
  
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);
    notifyGlobalScroll(currentScrollY);
  };
  
  const navigateToTask = (task: Task) => {
    router.push(`/task/${task.id}`);
  };
  
  const navigateToReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  // Show loading if not initialized or not authenticated or user data is not available
  if (!isInitialized || !isAuthenticated || !user) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.authText}>Загрузка...</Text>
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
        onScroll={handleScroll}
        scrollEventThrottle={8}
      >
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
            <View style={styles.dateContainer}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
            </View>
          </View>
          
          {backendTest && (
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <Activity size={12} color={colors.success} />
                <Text style={styles.statusText}>Система активна</Text>
              </View>
            </View>
          )}
        </View>

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
            <Text style={styles.statNumber}>{reports.length}</Text>
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
            {backendTest && (
              <TouchableOpacity 
                style={styles.backendTestButton}
                onPress={() => router.push('/settings/backend-test')}
              >
                <Text style={styles.backendTestText}>Тестировать Backend</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setIsMenuVisible(true)} />
      
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  date: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.successSoft,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
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
  backendTestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 16,
  },
  backendTestText: {
    fontSize: 13,
    fontWeight: '600',
  },
});