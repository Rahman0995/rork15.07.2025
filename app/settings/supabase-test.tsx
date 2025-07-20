import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SupabaseTest } from '@/components/SupabaseTest';

export default function SupabaseTestScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Тест Supabase',
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
        }} 
      />
      <SupabaseTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});