import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useReportsStore } from '@/store/reportsStore';
import { TaskCard } from '@/components/TaskCard';
import { ReportCard } from '@/components/ReportCard';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/dateUtils';
import { FileText, CheckSquare, Plus, ArrowRight, Calendar, Users, TrendingUp } from 'lucide-react-native';
import { Task, Report } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTasksStore();
  const { reports, fetchReports, isLoading: reportsLoading } = useReportsStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchReports();
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
    <ScrollView 
      style={styles.container}
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
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Добро пожаловать,</Text>
            <Text style={styles.name}>{user.rank} {user.name}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/reports')}>
          <View style={styles.statIconContainer}>
            <CheckSquare size={20} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{userTasks.length}</Text>
          <Text style={styles.statLabel}>Активных задач</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/reports')}>
          <View style={styles.statIconContainer}>
            <FileText size={20} color={colors.secondary} />
          </View>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Отчетов</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/analytics')}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={20} color={colors.success} />
          </View>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Выполнено</Text>
        </TouchableOpacity>
      </View>
      
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
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/task/create')}
        >
          <Plus size={18} color={colors.primary} />
          <Text style={styles.createButtonText}>Создать задачу</Text>
        </TouchableOpacity>
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
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/report/create')}
        >
          <Plus size={18} color={colors.primary} />
          <Text style={styles.createButtonText}>Создать отчет</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  authText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  authButton: {
    minWidth: 120,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
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
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  sectionActionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  
  // Cards Container
  cardsContainer: {
    gap: 12,
  },
  
  // Empty State
  emptyStateContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  
  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});