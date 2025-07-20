import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SMSTest } from '@/components/SMSTest';

export default function SMSTestPage() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'SMS Тест',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Тестирование SMS</Text>
          <Text style={styles.subtitle}>
            Проверка интеграции с Supabase Auth SMS
          </Text>
        </View>
        
        <SMSTest />
        
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Инструкции по настройке:</Text>
          <Text style={styles.instructionText}>
            1. Убедитесь, что в Supabase включена SMS аутентификация
          </Text>
          <Text style={styles.instructionText}>
            2. Настройте SMS провайдера (Twilio, MessageBird и т.д.)
          </Text>
          <Text style={styles.instructionText}>
            3. Добавьте webhook URL в настройках Supabase Auth
          </Text>
          <Text style={styles.instructionText}>
            4. Проверьте, что backend запущен и доступен
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  instructions: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});