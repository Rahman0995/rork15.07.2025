import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';
import { Calendar } from 'lucide-react-native';

export default function CalendarTabScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <Calendar size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Календарь</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Календарь доступен через кнопку в шапке
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});