import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import { ReportCard } from '@/components/ReportCard';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Plus, Search, Filter, CheckCircle2, Clock } from 'lucide-react-native';
import { Report, ReportStatus } from '@/types';

export default function ReportsScreen() {
  const router = useRouter();
  const { reports, fetchReports, getReportsForApproval, isLoading } = useReportsStore();
  const currentUser = useAuthStore(state => state.user);
  
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
            <ReportCard report={item} onPress={navigateToReport} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchReports}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
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
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
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
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
    marginRight: 8,
  },
  approvalButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
});