import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';

export default function SupabaseTestScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Тест Supabase',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
        }} 
      />
      <SupabaseConnectionTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});