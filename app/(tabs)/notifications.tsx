import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';
import { Bell } from 'lucide-react-native';

export default function NotificationsTabScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <Bell size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Уведомления</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Уведомления доступны через иконку в шапке
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