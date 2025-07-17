import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Поиск...",
  value,
  onChangeText,
  onClear,
  style
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchIcon}>
        <Search size={18} color={colors.textTertiary} />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {value.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={onClear || (() => onChangeText(''))}
        >
          <X size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    ...Platform.select({
      web: {
        outline: 'none',
      },
    }),
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});