import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useReportsStore } from '@/store/reportsStore';
import { useTasksStore } from '@/store/tasksStore';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { UserStatsCard } from '@/components/UserStatsCard';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { mockUsers } from '@/constants/mockData';
import { exportToPDF, exportToExcel, shareReport } from '@/utils/exportUtils';
import { 
  BarChart2, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckSquare,
  Download,
  Share,
  Calendar,
  Filter
} from 'lucide-react-native';

type AnalyticsTab = 'overview' | 'units' | 'users' | 'trends';
type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const { reports } = useReportsStore();
  const { tasks } = useTasksStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  // Calculate statistics
  const totalReports = reports.length;
  const approvedReports = reports.filter(r => r.status === 'approved').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const rejectedReports = reports.filter(r => r.status === 'rejected').length;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const reportApprovalRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0;
  
  // Mock data for enhanced analytics
  const unitsData = [
    { name: 'Рота Б-1', reports: 12, tasks: 18, completion: 75, trend: 5 },
    { name: 'Рота Б-2', reports: 8, tasks: 15, completion: 60, trend: -2 },
    { name: 'Рота Б-3', reports: 10, tasks: 12, completion: 83, trend: 8 },
    { name: 'Рота Б-4', reports: 6, tasks: 10, completion: 70, trend: 3 },
  ];
  
  const performanceData = useMemo(() => [
    { label: 'Пн', value: 85 },
    { label: 'Вт', value: 78 },
    { label: 'Ср', value: 92 },
    { label: 'Чт', value: 88 },
    { label: 'Пт', value: 95 },
    { label: 'Сб', value: 82 },
    { label: 'Вс', value: 79 },
  ], []);
  
  const userStats = useMemo(() => 
    mockUsers.map(u => ({
      user: u,
      tasksCompleted: Math.floor(Math.random() * 20) + 5,
      tasksTotal: Math.floor(Math.random() * 30) + 10,
      reportsSubmitted: Math.floor(Math.random() * 15) + 3,
      completionRate: Math.floor(Math.random() * 40) + 60,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      trendValue: Math.floor(Math.random() * 20) - 10,
    })).sort((a, b) => b.completionRate - a.completionRate)
  , []);
  
  const barChartData = unitsData.map(unit => ({
    label: unit.name.replace('Рота ', ''),
    value: unit.completion,
    color: unit.completion >= 80 ? colors.success : 
           unit.completion >= 60 ? colors.warning : colors.error,
  }));
  
  const pieChartData = [
    { label: 'Выполнено', value: completedTasks, color: colors.success },
    { label: 'В процессе', value: inProgressTasks, color: colors.info },
    { label: 'Ожидает', value: pendingTasks, color: colors.warning },
  ];
  
  const reportsPieData = [
    { label: 'Утверждено', value: approvedReports, color: colors.success },
    { label: 'На рассмотрении', value: pendingReports, color: colors.warning },
    { label: 'Отклонено', value: rejectedReports, color: colors.error },
  ];
  
  const handleExport = (type: 'pdf' | 'excel') => {
    // Convert analytics data to array format for export
    const analyticsArray = [
      {
        section: 'Общая статистика',
        totalReports,
        totalTasks,
        taskCompletionRate: `${taskCompletionRate}%`,
        reportApprovalRate: `${reportApprovalRate}%`,
        timeRange,
      },
      ...unitsData.map(unit => ({
        section: 'Подразделения',
        name: unit.name,
        reports: unit.reports,
        tasks: unit.tasks,
        completion: `${unit.completion}%`,
        trend: `${unit.trend > 0 ? '+' : ''}${unit.trend}%`,
      })),
      ...userStats.map(stats => ({
        section: 'Пользователи',
        name: stats.user.name,
        tasksCompleted: stats.tasksCompleted,
        tasksTotal: stats.tasksTotal,
        reportsSubmitted: stats.reportsSubmitted,
        completionRate: `${stats.completionRate}%`,
        trend: `${stats.trendValue > 0 ? '+' : ''}${stats.trendValue}%`,
      })),
    ];
    
    const exportData = {
      title: `Аналитический отчет - ${new Date().toLocaleDateString('ru-RU')}`,
      data: analyticsArray,
      type,
    };
    
    if (type === 'pdf') {
      exportToPDF(exportData);
    } else {
      exportToExcel(exportData);
    }
  };
  
  const renderTabButton = (tab: AnalyticsTab, title: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
  
  const renderTimeRangeButton = (range: TimeRange, label: string) => (
    <TouchableOpacity
      style={[
        styles.timeRangeButton,
        timeRange === range && styles.activeTimeRangeButton
      ]}
      onPress={() => setTimeRange(range)}
    >
      <Text style={[
        styles.timeRangeText,
        timeRange === range && styles.activeTimeRangeText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <FileText size={24} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{totalReports}</Text>
          <Text style={styles.statTitle}>Отчеты</Text>
          <Text style={styles.statSubtitle}>{approvedReports} утверждено</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <CheckSquare size={24} color={colors.secondary} />
          </View>
          <Text style={styles.statValue}>{totalTasks}</Text>
          <Text style={styles.statTitle}>Задачи</Text>
          <Text style={styles.statSubtitle}>{completedTasks} выполнено</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <PieChartIcon size={24} color={colors.success} />
          </View>
          <Text style={styles.statValue}>{taskCompletionRate}%</Text>
          <Text style={styles.statTitle}>Выполнение</Text>
          <Text style={styles.statSubtitle}>задач</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={24} color={colors.info} />
          </View>
          <Text style={styles.statValue}>{reportApprovalRate}%</Text>
          <Text style={styles.statTitle}>Утверждение</Text>
          <Text style={styles.statSubtitle}>отчетов</Text>
        </View>
      </View>
      
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Статус задач</Text>
        <PieChart data={pieChartData} size={140} />
      </View>
      
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Статус отчетов</Text>
        <PieChart data={reportsPieData} size={140} />
      </View>
      
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Производительность за неделю</Text>
        <LineChart data={performanceData} height={180} />
      </View>
    </View>
  );
  
  const renderUnitsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Эффективность подразделений</Text>
        <BarChart data={barChartData} height={220} />
      </View>
      
      {unitsData.map((unit, index) => (
        <View key={index} style={styles.unitCard}>
          <View style={styles.unitHeader}>
            <Text style={styles.unitName}>{unit.name}</Text>
            <View style={styles.unitTrend}>
              <Text style={styles.unitCompletion}>{unit.completion}%</Text>
              <View style={styles.trendIndicator}>
                <TrendingUp 
                  size={16} 
                  color={unit.trend >= 0 ? colors.success : colors.error} 
                />
                <Text style={[
                  styles.trendValue,
                  { color: unit.trend >= 0 ? colors.success : colors.error }
                ]}>
                  {unit.trend > 0 ? `+${unit.trend}%` : `${unit.trend}%`}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${unit.completion}%` }]} />
          </View>
          
          <View style={styles.unitStats}>
            <Text style={styles.unitStat}>Отчеты: {unit.reports}</Text>
            <Text style={styles.unitStat}>Задачи: {unit.tasks}</Text>
          </View>
        </View>
      ))}
    </View>
  );
  
  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Рейтинг пользователей</Text>
        <Text style={styles.sectionSubtitle}>
          Отсортировано по проценту выполнения задач
        </Text>
      </View>
      
      {userStats.map((stats, index) => (
        <UserStatsCard 
          key={stats.user.id} 
          stats={stats}
          onPress={(user) => {
            Alert.alert(
              'Детальная статистика',
              `Подробная статистика для ${user.name} будет доступна в следующей версии.`
            );
          }}
        />
      ))}
    </View>
  );
  
  const renderTrendsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Динамика выполнения задач</Text>
        <LineChart 
          data={[
            { label: 'Янв', value: 65 },
            { label: 'Фев', value: 72 },
            { label: 'Мар', value: 78 },
            { label: 'Апр', value: 85 },
            { label: 'Май', value: 82 },
            { label: 'Июн', value: 88 },
            { label: 'Июл', value: 92 },
          ]}
          color={colors.primary}
          height={200}
        />
      </View>
      
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Сравнение подразделений</Text>
        <BarChart 
          data={[
            { label: 'Б-1', value: 75, color: colors.primary },
            { label: 'Б-2', value: 60, color: colors.secondary },
            { label: 'Б-3', value: 83, color: colors.success },
            { label: 'Б-4', value: 70, color: colors.info },
          ]}
          height={200}
        />
      </View>
      
      <View style={styles.trendCard}>
        <Text style={styles.trendCardTitle}>Ключевые показатели</Text>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Средняя эффективность</Text>
          <View style={styles.trendValue}>
            <TrendingUp size={16} color={colors.success} />
            <Text style={[styles.trendText, { color: colors.success }]}>+5.2%</Text>
          </View>
        </View>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Время выполнения задач</Text>
          <View style={styles.trendValue}>
            <TrendingUp size={16} color={colors.success} />
            <Text style={[styles.trendText, { color: colors.success }]}>-12%</Text>
          </View>
        </View>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Качество отчетов</Text>
          <View style={styles.trendValue}>
            <TrendingUp size={16} color={colors.success} />
            <Text style={[styles.trendText, { color: colors.success }]}>+8.7%</Text>
          </View>
        </View>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Аналитика</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => handleExport('pdf')}
          >
            <Download size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert(
              'Экспорт данных',
              'Выберите формат экспорта',
              [
                { text: 'PDF', onPress: () => handleExport('pdf') },
                { text: 'Excel', onPress: () => handleExport('excel') },
                { text: 'Отмена', style: 'cancel' },
              ]
            )}
          >
            <Share size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.timeRangeContainer}>
        <Calendar size={16} color={colors.textSecondary} />
        <Text style={styles.timeRangeLabel}>Период:</Text>
        <View style={styles.timeRangeButtons}>
          {renderTimeRangeButton('7d', '7 дней')}
          {renderTimeRangeButton('30d', '30 дней')}
          {renderTimeRangeButton('90d', '3 месяца')}
          {renderTimeRangeButton('1y', '1 год')}
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        {renderTabButton('overview', 'Обзор', <BarChart2 size={16} color={activeTab === 'overview' ? 'white' : colors.primary} />)}
        {renderTabButton('units', 'Подразделения', <Users size={16} color={activeTab === 'units' ? 'white' : colors.primary} />)}
        {renderTabButton('users', 'Пользователи', <Users size={16} color={activeTab === 'users' ? 'white' : colors.primary} />)}
        {renderTabButton('trends', 'Тренды', <TrendingUp size={16} color={activeTab === 'trends' ? 'white' : colors.primary} />)}
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'units' && renderUnitsTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'trends' && renderTrendsTab()}
      </ScrollView>
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
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeRangeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    marginRight: 12,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  activeTimeRangeButton: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeTimeRangeText: {
    color: 'white',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.primary,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  unitCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  unitTrend: {
    alignItems: 'flex-end',
  },
  unitCompletion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  unitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitStat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  trendCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  trendCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendLabel: {
    fontSize: 14,
    color: colors.text,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});