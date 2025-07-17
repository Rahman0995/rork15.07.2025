import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { PersonCard } from '@/components/PersonCard';
import { Users } from 'lucide-react-native';

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

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Личный состав",
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
          placeholder="Поиск по имени, званию, должности..."
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
            <Users size={24} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Личный состав</Text>
            <Text style={styles.headerSubtitle}>
              Найдено: {filteredPersonnel.length} из {mockPersonnel.length}
            </Text>
          </View>
        </View>

        <View style={styles.personnelList}>
          {filteredPersonnel.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onPress={handlePersonPress}
              style={styles.personCard}
            />
          ))}
        </View>

        {filteredPersonnel.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Никого не найдено</Text>
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
  personnelList: {
    padding: 20,
    gap: 12,
  },
  personCard: {
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