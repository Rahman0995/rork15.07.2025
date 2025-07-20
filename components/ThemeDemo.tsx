import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

export function ThemeDemo() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Предварительный просмотр темы</Text>
      <View style={styles.colorRow}>
        <View style={[styles.colorBox, { backgroundColor: colors.primary }]} />
        <View style={[styles.colorBox, { backgroundColor: colors.secondary }]} />
        <View style={[styles.colorBox, { backgroundColor: colors.success }]} />
        <View style={[styles.colorBox, { backgroundColor: colors.warning }]} />
        <View style={[styles.colorBox, { backgroundColor: colors.error }]} />
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
});