import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedChips: string[];
  onChipPress: (chipId: string) => void;
  style?: any;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  selectedChips,
  onChipPress,
  style
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={style}
    >
      {chips.map((chip) => {
        const isSelected = selectedChips.includes(chip.id);
        return (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.chip,
              isSelected && styles.chipSelected
            ]}
            onPress={() => onChipPress(chip.id)}
          >
            <Text style={[
              styles.chipText,
              isSelected && styles.chipTextSelected
            ]}>
              {chip.label}
              {chip.count !== undefined && ` (${chip.count})`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.white,
  },
});