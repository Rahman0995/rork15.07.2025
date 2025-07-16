import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import { ReportCard } from '@/components/ReportCard';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { Plus, Search, Filter, CheckCircle2, Clock } from 'lucide-react-native';
import { Report, ReportStatus } from '@/types';
import { notifyGlobalScroll } from './_layout';

export default function ReportsScreen() {
  const router = useRouter();
  const { reports, fetchReports, getReportsForApproval, isLoading } = useReportsStore();
  const currentUser = useAuthStore(state => state.user);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const reportsForApproval = getReportsForApproval();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  useEffect(() => {
    let filtered = [...reports];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredReports(filtered);
  }, [reports, searchQuery, statusFilter]);
  
  const navigateToReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };
  
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    notifyGlobalScroll(currentScrollY);
  };
  
  const renderStatusFilter = (status: ReportStatus | 'all', label: string, key: string) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.filterButton,
        statusFilter === status && styles.activeFilterButton
      ]}
      onPress={() => setStatusFilter(status)}
    >
      <Text style={[
        styles.filterButtonText,
        statusFilter === status && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Поиск отчетов..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        </View>
        
        <View style={styles.headerButtons}>
          {currentUser && reportsForApproval.length > 0 && (
            <TouchableOpacity 
              style={styles.approvalButton}
              onPress={() => router.push('/reports/approvals')}
            >
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.approvalButtonText}>Утверждение</Text>
              {reportsForApproval.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{reportsForApproval.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          <Button
            title="Создать"
            onPress={() => router.push('/report/create')}
            size="small"
          />
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.filtersHeader}>
          <Filter size={16} color={colors.textSecondary} />
          <Text style={styles.filtersLabel}>Фильтры:</Text>
        </View>
        <View style={styles.filtersRow}>
          {[
            { key: 'all', label: 'Все' },
            { key: 'pending', label: 'На рассмотрении' },
            { key: 'approved', label: 'Утвержденные' },
            { key: 'rejected', label: 'Отклоненные' },
            { key: 'needs_revision', label: 'Доработка' },
            { key: 'draft', label: 'Черновики' }
          ].map(item => 
            renderStatusFilter(item.key as ReportStatus | 'all', item.label, item.key)
          )}
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredReports.length > 0 ? (
        <FlatList
          data={filteredReports}
          renderItem={({ item }) => (
            <ReportCard key={item.id} report={item} onPress={navigateToReport} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchReports}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || statusFilter !== 'all'
              ? 'Нет отчетов, соответствующих фильтрам'
              : 'Нет доступных отчетов'}
          </Text>
          <Button
            title="Создать отчет"
            onPress={() => router.push('/report/create')}
            style={styles.createButton}
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
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
    position: 'relative',
  },
  searchInput: {
    marginBottom: 0,
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  filtersContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filtersLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    marginRight: 8,
  },
  filtersRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
    lineHeight: 22,
  },
  createButton: {
    marginTop: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    position: 'relative',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  approvalButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -6,
    right: -6,
  },
  badgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
});