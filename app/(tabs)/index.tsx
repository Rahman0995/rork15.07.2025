import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { useTasks, useReports, useUserTasks, useUserReports } from '@/lib/supabaseHooks';
import { OptimizedTaskCard } from '@/components/OptimizedTaskCard';
import { OptimizedReportCard } from '@/components/OptimizedReportCard';
import { TaskCardSkeleton, ReportCardSkeleton, StatCardSkeleton } from '@/components/SkeletonLoader';
import { Button } from '@/components/Button';
import { FloatingMenu, FloatingActionButton } from '@/components/FloatingMenu';
import { QuickActions } from '@/components/QuickActions';
import { StatusIndicator } from '@/components/StatusIndicator';
import { SupabaseStatus } from '@/components/SupabaseStatus';
import { useBatchOptimizedQueries } from '@/hooks/useOptimizedQuery';
import { Platform } from 'react-native';
import { useTheme } from '@/constants/theme';
import { formatDate } from '@/utils/dateUtils';
import { FileText, CheckSquare, Plus, ArrowRight, TrendingUp, Shield, Clock, User } from 'lucide-react-native';


const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, initialized, loading } = useSupabaseAuth();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Optimized batch data fetching
  const { data, isLoading, refetchAll } = useBatchOptimizedQueries([
    {
      key: 'allTasks',
      queryKey: ['tasks'],
      queryFn: async () => {
        // Simulate API call - replace with actual Supabase call
        const { data: allTasks } = await useTasks();
        return allTasks;
      },
      options: { enabled: !!user }
    },
    {
      key: 'allReports', 
      queryKey: ['reports'],
      queryFn: async () => {
        const { data: allReports } = await useReports();
        return allReports;
      },
      options: { enabled: !!user }
    },
    {
      key: 'userTasks',
      queryKey: ['userTasks', user?.id],
      queryFn: async () => {
        const { data: userTasks } = await useUserTasks(user?.id ?? '');
        return userTasks;
      },
      options: { enabled: !!user?.id }
    },
    {
      key: 'userReports',
      queryKey: ['userReports', user?.id],
      queryFn: async () => {
        const { data: userReports } = await useUserReports(user?.id ?? '');
        return userReports;
      },
      options: { enabled: !!user?.id }
    }
  ]);

  // Fallback to individual hooks for now (until batch optimization is fully implemented)
  const { data: allTasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { data: allReports, isLoading: reportsLoading, refetch: refetchReports } = useReports();
  const { data: userTasks, refetch: refetchUserTasks } = useUserTasks(user?.id ?? '');
  const { data: userReports, refetch: refetchUserReports } = useUserReports(user?.id ?? '');
  
  // Debug logging
  if (__DEV__) {
    console.log('Home render:', {
      initialized,
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email,
      tasksCount: allTasks?.length || 0,
      reportsCount: allReports?.length || 0,
      userTasksCount: userTasks?.length || 0,
      userReportsCount: userReports?.length || 0,
      tasksLoading,
      reportsLoading,
      loading
    });
  }
  
  useEffect(() => {
    if (isAuthenticated && user) {
      if (__DEV__) console.log('Home: User authenticated, data will be fetched automatically by React Query');
      
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
  
  const displayTasks = useMemo(() => {
    if (!userTasks || !Array.isArray(userTasks)) return [];
    return userTasks
      .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
      .slice(0, 3);
  }, [userTasks]);
  
  const recentReports = useMemo(() => {
    if (!userReports || !Array.isArray(userReports)) return [];
    return userReports
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 3);
  }, [userReports]);
  
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchTasks(),
        refetchReports(),
        refetchUserTasks(),
        refetchUserReports()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Ошибка', 'Не удалось обновить данные');
    }
  }, [refetchTasks, refetchReports, refetchUserTasks, refetchUserReports]);
  

  const navigateToTask = useCallback((task: any) => {
    router.push(`/task/${task.id}`);
  }, [router]);
  
  const navigateToReport = useCallback((report: any) => {
    router.push(`/report/${report.id}`);
  }, [router]);

  // Show loading only if not initialized
  if (!initialized || loading) {
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
        <View style={styles.authIconContainer}>
          <User size={48} color={colors.primary} />
        </View>
        <Text style={styles.authTitle}>Добро пожаловать</Text>
        <Text style={styles.authText}>Войдите в систему для доступа к функциям приложения</Text>
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
        {/* Supabase Status (Development Only) */}
        {__DEV__ && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <SupabaseStatus />
          </View>
        )}

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Shield size={24} color={colors.primary} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.greeting}>Добро пожаловать</Text>
                <Text style={styles.name}>{user.user_metadata?.full_name || user.email}</Text>
                {user.user_metadata?.rank && (
                  <Text style={styles.rank}>{user.user_metadata.rank}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <StatusIndicator 
                isOnline={true}
                serverStatus="connected"
              />
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
        {(tasksLoading || reportsLoading) ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/reports')}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primarySoft }]}>
                <CheckSquare size={20} color={colors.primary} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{displayTasks.length}</Text>
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
                <Text style={styles.statNumber}>{recentReports?.length || 0}</Text>
                <Text style={styles.statLabel}>Отчетов</Text>
              </View>
              <View style={styles.statTrend}>
                <TrendingUp size={14} color={colors.success} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/analytics')}>
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
          </>
        )}
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
        
        {tasksLoading ? (
          <View style={styles.cardsContainer}>
            {[...Array(3)].map((_, index) => (
              <TaskCardSkeleton key={`task-skeleton-${index}`} />
            ))}
          </View>
        ) : displayTasks.length > 0 ? (
          <View style={styles.cardsContainer}>
            {displayTasks.map((task, index) => (
              <OptimizedTaskCard key={task.id} task={task} onPress={navigateToTask} index={index} />
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
        
        {reportsLoading ? (
          <View style={styles.cardsContainer}>
            {[...Array(3)].map((_, index) => (
              <ReportCardSkeleton key={`report-skeleton-${index}`} />
            ))}
          </View>
        ) : recentReports.length > 0 ? (
          <View style={styles.cardsContainer}>
            {recentReports.map((report, index) => (
              <OptimizedReportCard key={report.id} report={report} onPress={navigateToReport} index={index} />
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
    backgroundColor: colors.background,
  },
  authIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  authText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  authButton: {
    minWidth: 160,
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
    color: colors.text,
  },
  rank: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 2,
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