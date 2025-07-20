import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/constants/theme';

export const SupabaseStatus: React.FC = () => {
  const { colors } = useTheme();
  
  const isConfigured = !!supabase;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Статус Supabase</Text>
      
      <View style={styles.statusRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Конфигурация:</Text>
        <Text style={[styles.value, { color: isConfigured ? colors.success : colors.error }]}>
          {isConfigured ? '✅ Настроен' : '❌ Не настроен'}
        </Text>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>URL:</Text>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {url || 'НЕ НАСТРОЕН'}
        </Text>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Ключ:</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {key ? '✅ НАСТРОЕН' : '❌ НЕ НАСТРОЕН'}
        </Text>
      </View>
      
      {!isConfigured && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Настройте Supabase в .env файле для использования базы данных
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 2,
    textAlign: 'right' as const,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },
});