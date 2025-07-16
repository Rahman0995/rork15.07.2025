import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export const ThemeSelector = () => {
  const { colors, isDark } = useTheme();
  const { settings, updateSetting } = useSettingsStore();

  const themeOptions = [
    { key: 'system', label: 'Системная', icon: Monitor },
    { key: false, label: 'Светлая', icon: Sun },
    { key: true, label: 'Темная', icon: Moon },
  ] as const;

  const handleThemeChange = (theme: boolean | 'system') => {
    updateSetting('darkMode', theme);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Тема приложения</Text>
      <View style={[styles.optionsContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = settings.darkMode === option.key;
          
          return (
            <TouchableOpacity
              key={String(option.key)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderColor: colors.border,
                }
              ]}
              onPress={() => handleThemeChange(option.key)}
              activeOpacity={0.7}
            >
              <Icon 
                size={20} 
                color={isSelected ? colors.white : colors.textSecondary} 
              />
              <Text style={[
                styles.optionText,
                { 
                  color: isSelected ? colors.white : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '500'
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  optionText: {
    fontSize: 14,
  },
});