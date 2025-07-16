import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';
import { Sun, Moon, Monitor } from 'lucide-react-native';

export const ThemeDemo = () => {
  const { colors, isDark, theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primarySoft }]}>
          {theme === 'dark' ? (
            <Moon size={24} color={colors.primary} />
          ) : (
            <Sun size={24} color={colors.primary} />
          )}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Текущая тема: {isDark ? 'Темная' : 'Светлая'}
        </Text>
      </View>
      
      <View style={styles.colorGrid}>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.primary }]} />
          <Text style={[styles.colorLabel, { color: colors.text }]}>Primary</Text>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.secondary }]} />
          <Text style={[styles.colorLabel, { color: colors.text }]}>Secondary</Text>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.success }]} />
          <Text style={[styles.colorLabel, { color: colors.text }]}>Success</Text>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.error }]} />
          <Text style={[styles.colorLabel, { color: colors.text }]}>Error</Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Тема автоматически применяется ко всем компонентам приложения. 
        Переключите тему в настройках выше, чтобы увидеть изменения.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorGrid: {
    marginBottom: 16,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});