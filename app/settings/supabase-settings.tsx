import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SupabaseSettingsManager } from '@/components/SupabaseSettingsManager';

export default function SupabaseSettingsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Настройки Supabase',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: 'white',
        }} 
      />
      <SupabaseSettingsManager />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});