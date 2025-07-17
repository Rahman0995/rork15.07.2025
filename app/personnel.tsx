import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { PersonCard } from '@/components/PersonCard';
import { Users, Plus, Filter, Grid3X3, List, UserCheck, Clock, UserX } from 'lucide-react-native';

// Mock data for personnel
const mockPersonnel = [
  {
    id: '1',
    name: 'Иванов Иван Иванович',
    rank: 'Майор',
    position: 'Командир роты',
    unit: '1-я мотострелковая рота',
    phone: '+7 (999) 123-45-67',
    email: 'ivanov@unit.mil',
    location: 'Казарма №1',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Петров Петр Петрович',
    rank: 'Капитан',
    position: 'Заместитель командира',
    unit: '2-я мотострелковая рота',
    phone: '+7 (999) 234-56-78',
    email: 'petrov@unit.mil',
    location: 'Казарма №2',
    status: 'leave' as const,
  },
  {
    id: '3',
    name: 'Сидоров Сидор Сидорович',
    rank: 'Лейтенант',
    position: 'Командир взвода',
    unit: '1-я мотострелковая рота',
    phone: '+7 (999) 345-67-89',
    email: 'sidorov@unit.mil',
    location: 'Казарма №1',
    status: 'active' as const,
  },
  {
    id: '4',
    name: 'Козлов Андрей Викторович',
    rank: 'Старший лейтенант',
    position: 'Начальник связи',
    unit: 'Штаб батальона',
    phone: '+7 (999) 456-78-90',
    email: 'kozlov@unit.mil',
    location: 'Штабное здание',
    status: 'inactive' as const,
  },
];

const filterChips = [
  { id: 'all', label: 'Все', count: mockPersonnel.length },
  { id: 'active', label: 'Активные', count: mockPersonnel.filter(p => p.status === 'active').length },
  { id: 'leave', label: 'В отпуске', count: mockPersonnel.filter(p => p.status === 'leave').length },
  { id: 'inactive', label: 'Неактивные', count: mockPersonnel.filter(p => p.status === 'inactive').length },
];

export default function PersonnelScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(['all']);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPersonnel = useMemo(() => {
    let filtered = mockPersonnel;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(person => 
        person.name.toLowerCase().includes(query) ||
        person.rank.toLowerCase().includes(query) ||
        person.position.toLowerCase().includes(query) ||
        person.unit.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (!selectedFilters.includes('all')) {
      filtered = filtered.filter(person => 
        selectedFilters.includes(person.status)
      );
    }

    return filtered;
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

  const handlePersonPress = (person: any) => {
    console.log('Person pressed:', person);
    // Navigate to person details
  };

  const getStatsData = () => {
    const active = mockPersonnel.filter(p => p.status === 'active').length;
    const leave = mockPersonnel.filter(p => p.status === 'leave').length;
    const inactive = mockPersonnel.filter(p => p.status === 'inactive').length;
    
    return [
      { label: 'Активные', count: active, color: colors.success, icon: UserCheck },
      { label: 'В отпуске', count: leave, color: colors.warning, icon: Clock },
      { label: 'Неактивные', count: inactive, color: colors.error, icon: UserX },
    ];
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Личный состав",
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
                onPress={() => console.log('Add person')}
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
          <Text style={styles.heroTitle}>Управление персоналом</Text>
          <Text style={styles.heroSubtitle}>
            Всего сотрудников: {mockPersonnel.length}
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
                if (stat.label === 'Активные') handleFilterPress('active');
                else if (stat.label === 'В отпуске') handleFilterPress('leave');
                else if (stat.label === 'Неактивные') handleFilterPress('inactive');
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
            placeholder="Поиск по имени, званию, должности..."
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
          {filteredPersonnel.length} {filteredPersonnel.length === 1 ? 'сотрудник' : 'сотрудников'}
        </Text>
        <Text style={styles.resultsSubtext}>
          из {mockPersonnel.length} всего
        </Text>
      </View>

      {/* Personnel List */}
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
        {filteredPersonnel.length > 0 ? (
          <View style={[
            styles.personnelList,
            viewMode === 'grid' && styles.personnelGrid
          ]}>
            {filteredPersonnel.map((person, index) => (
              <PersonCard
                key={person.id}
                person={person}
                onPress={handlePersonPress}
                style={[
                  styles.personCard,
                  viewMode === 'grid' && styles.personCardGrid,
                  { 
                    opacity: 0,
                    transform: [{ translateY: 20 }]
                  }
                ]}
                viewMode={viewMode}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Users size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Никого не найдено</Text>
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
  personnelList: {
    padding: 20,
    gap: 16,
  },
  personnelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  personCard: {
    marginBottom: 0,
  },
  personCardGrid: {
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