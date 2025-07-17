import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { DocumentCard } from '@/components/DocumentCard';
import { FolderOpen } from 'lucide-react-native';

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

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Документы",
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }} 
      />
      
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Поиск по названию, типу, автору..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FilterChips
        chips={filterChips}
        selectedChips={selectedFilters}
        onChipPress={handleFilterPress}
        style={styles.filtersContainer}
      />

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
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <FolderOpen size={24} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Документы</Text>
            <Text style={styles.headerSubtitle}>
              Найдено: {filteredDocuments.length} из {mockDocuments.length}
            </Text>
          </View>
        </View>

        <View style={styles.documentsList}>
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onPress={handleDocumentPress}
              onDownload={handleDocumentDownload}
              style={styles.documentCard}
            />
          ))}
        </View>

        {filteredDocuments.length === 0 && (
          <View style={styles.emptyState}>
            <FolderOpen size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Документы не найдены</Text>
            <Text style={styles.emptyDescription}>
              Попробуйте изменить параметры поиска или фильтры
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filtersContainer: {
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  documentsList: {
    padding: 20,
    gap: 12,
  },
  documentCard: {
    marginBottom: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});