import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { DocumentCard } from '@/components/DocumentCard';
import { FolderOpen, Plus, Filter, Grid3X3, List, FileCheck, Clock, FileX, FilePlus } from 'lucide-react-native';

// Mock data for documents
const mockDocuments = [
  {
    id: '1',
    title: 'Приказ о назначении дежурного по части',
    type: 'Приказ',
    size: '2.4 МБ',
    createdAt: '15.01.2024',
    author: 'Майор Иванов И.И.',
    status: 'approved' as const,
  },
  {
    id: '2',
    title: 'Отчет о проведении учений',
    type: 'Отчет',
    size: '5.1 МБ',
    createdAt: '14.01.2024',
    author: 'Капитан Петров П.П.',
    status: 'pending' as const,
  },
  {
    id: '3',
    title: 'Инструкция по технике безопасности',
    type: 'Инструкция',
    size: '1.8 МБ',
    createdAt: '13.01.2024',
    author: 'Лейтенант Сидоров С.С.',
    status: 'draft' as const,
  },
  {
    id: '4',
    title: 'Рапорт о происшествии',
    type: 'Рапорт',
    size: '0.9 МБ',
    createdAt: '12.01.2024',
    author: 'Старшина Козлов А.В.',
    status: 'rejected' as const,
  },
  {
    id: '5',
    title: 'План боевой подготовки на февраль',
    type: 'План',
    size: '3.2 МБ',
    createdAt: '11.01.2024',
    author: 'Майор Иванов И.И.',
    status: 'approved' as const,
  },
];

const filterChips = [
  { id: 'all', label: 'Все', count: mockDocuments.length },
  { id: 'approved', label: 'Утвержденные', count: mockDocuments.filter(d => d.status === 'approved').length },
  { id: 'pending', label: 'На рассмотрении', count: mockDocuments.filter(d => d.status === 'pending').length },
  { id: 'draft', label: 'Черновики', count: mockDocuments.filter(d => d.status === 'draft').length },
  { id: 'rejected', label: 'Отклоненные', count: mockDocuments.filter(d => d.status === 'rejected').length },
];

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(['all']);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDocuments = useMemo(() => {
    let filtered = mockDocuments;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        doc.author.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (!selectedFilters.includes('all')) {
      filtered = filtered.filter(doc => 
        selectedFilters.includes(doc.status)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchQuery, selectedFilters]);

  const handleFilterPress = (filterId: string) => {
    if (filterId === 'all') {
      setSelectedFilters(['all']);
    } else {
      const newFilters = selectedFilters.includes('all') 
        ? [filterId]
        : selectedFilters.includes(filterId)
          ? selectedFilters.filter(id => id !== filterId)
          : [...selectedFilters.filter(id => id !== 'all'), filterId];
      
      setSelectedFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleDocumentPress = (document: any) => {
    console.log('Document pressed:', document);
    Alert.alert('Документ', `Открыть документ: ${document.title}?`);
  };

  const handleDocumentDownload = (document: any) => {
    console.log('Download document:', document);
    Alert.alert('Скачивание', `Скачать документ: ${document.title}?`);
  };

  const getStatsData = () => {
    const approved = mockDocuments.filter(d => d.status === 'approved').length;
    const pending = mockDocuments.filter(d => d.status === 'pending').length;
    const draft = mockDocuments.filter(d => d.status === 'draft').length;
    const rejected = mockDocuments.filter(d => d.status === 'rejected').length;
    
    return [
      { label: 'Утвержденные', count: approved, color: colors.success, icon: FileCheck },
      { label: 'На рассмотрении', count: pending, color: colors.warning, icon: Clock },
      { label: 'Черновики', count: draft, color: colors.info, icon: FilePlus },
      { label: 'Отклоненные', count: rejected, color: colors.error, icon: FileX },
    ];
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Документооборот",
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 28,
            fontWeight: '700' as const,
          },
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.primarySoft }]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.primary }]}
                onPress={() => console.log('Add document')}
              >
                <Plus size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />

      {/* Hero Section with Stats */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Управление документами</Text>
          <Text style={styles.heroSubtitle}>
            Всего документов: {mockDocuments.length}
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          {getStatsData().map((stat, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.statCard, { borderLeftColor: stat.color }]}
              onPress={() => {
                if (stat.label === 'Утвержденные') handleFilterPress('approved');
                else if (stat.label === 'На рассмотрении') handleFilterPress('pending');
                else if (stat.label === 'Черновики') handleFilterPress('draft');
                else if (stat.label === 'Отклоненные') handleFilterPress('rejected');
              }}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <stat.icon size={18} color={stat.color} />
              </View>
              <Text style={styles.statCount}>{stat.count}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search and Controls */}
      <View style={styles.controlsSection}>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Поиск по названию, типу, автору..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.viewControls}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={18} color={viewMode === 'list' ? colors.primary : colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Grid3X3 size={18} color={viewMode === 'grid' ? colors.primary : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersSection}>
          <FilterChips
            chips={filterChips}
            selectedChips={selectedFilters}
            onChipPress={handleFilterPress}
            style={styles.filtersContainer}
          />
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'документ' : 'документов'}
        </Text>
        <Text style={styles.resultsSubtext}>
          из {mockDocuments.length} всего
        </Text>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredDocuments.length > 0 ? (
          <View style={[
            styles.documentsList,
            viewMode === 'grid' && styles.documentsGrid
          ]}>
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onPress={handleDocumentPress}
                onDownload={handleDocumentDownload}
                style={[
                  styles.documentCard,
                  viewMode === 'grid' && styles.documentCardGrid
                ]}
                viewMode={viewMode}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <FolderOpen size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Документы не найдены</Text>
            <Text style={styles.emptyDescription}>
              Попробуйте изменить параметры поиска или фильтры
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedFilters(['all']);
              }}
            >
              <Text style={styles.emptyButtonText}>Сбросить фильтры</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Section
  heroSection: {
    backgroundColor: colors.background,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  heroContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Stats Cards
  statsContainer: {
    paddingLeft: 20,
  },
  statsContent: {
    paddingRight: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    minWidth: 120,
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Controls Section
  controlsSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchContainer: {
    flex: 1,
  },
  viewControls: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  // Filters Section
  filtersSection: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filtersContainer: {
    paddingVertical: 12,
  },

  // Results Header
  resultsHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  resultsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  documentsList: {
    padding: 20,
    gap: 16,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentCard: {
    marginBottom: 0,
  },
  documentCardGrid: {
    width: '48%',
    marginBottom: 16,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});