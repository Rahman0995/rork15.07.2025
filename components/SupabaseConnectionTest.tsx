import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { supabase, auth, database } from '@/lib/supabase';

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Проверка подключения к Supabase...');
      
      if (!supabase) {
        addResult('❌ Supabase клиент не настроен');
        setConnectionStatus('error');
        return;
      }
      
      addResult('✅ Supabase клиент инициализирован');
      
      // Test database connection
      addResult('🔍 Тестирование подключения к базе данных...');
      const { data: users, error: usersError } = await database.users.getAll();
      
      if (usersError) {
        addResult(`❌ Ошибка получения пользователей: ${usersError.message}`);
      } else {
        addResult(`✅ Пользователи получены: ${users?.length || 0} записей`);
      }
      
      // Test auth
      addResult('🔍 Тестирование аутентификации...');
      const { user, error: authError } = await auth.getCurrentUser();
      
      if (authError) {
        addResult(`⚠️ Пользователь не авторизован: ${authError.message}`);
      } else if (user) {
        addResult(`✅ Текущий пользователь: ${user.email}`);
      } else {
        addResult('⚠️ Пользователь не авторизован');
      }
      
      // Test tasks
      addResult('🔍 Тестирование задач...');
      const { data: tasks, error: tasksError } = await database.tasks.getAll();
      
      if (tasksError) {
        addResult(`❌ Ошибка получения задач: ${tasksError.message}`);
      } else {
        addResult(`✅ Задачи получены: ${tasks?.length || 0} записей`);
      }
      
      // Test reports
      addResult('🔍 Тестирование отчетов...');
      const { data: reports, error: reportsError } = await database.reports.getAll();
      
      if (reportsError) {
        addResult(`❌ Ошибка получения отчетов: ${reportsError.message}`);
      } else {
        addResult(`✅ Отчеты получены: ${reports?.length || 0} записей`);
      }
      
      setConnectionStatus('connected');
      addResult('🎉 Тестирование завершено!');
      
    } catch (error: any) {
      addResult(`❌ Критическая ошибка: ${error.message}`);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      addResult('🔍 Тестирование регистрации...');
      
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      const { data, error } = await auth.signUp(testEmail, testPassword, {
        first_name: 'Test',
        last_name: 'User',
      });
      
      if (error) {
        addResult(`❌ Ошибка регистрации: ${error.message}`);
      } else {
        addResult(`✅ Тестовый пользователь создан: ${data?.user?.email || 'неизвестно'}`);
        
        // Try to sign out
        const { error: signOutError } = await auth.signOut();
        if (signOutError) {
          addResult(`⚠️ Ошибка выхода: ${signOutError.message}`);
        } else {
          addResult('✅ Выход выполнен успешно');
        }
      }
    } catch (error: any) {
      addResult(`❌ Ошибка тестирования аутентификации: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест подключения Supabase</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Статус:</Text>
        <Text style={[
          styles.statusText,
          connectionStatus === 'connected' && styles.statusConnected,
          connectionStatus === 'error' && styles.statusError,
          connectionStatus === 'checking' && styles.statusChecking,
        ]}>
          {connectionStatus === 'connected' && '✅ Подключено'}
          {connectionStatus === 'error' && '❌ Ошибка'}
          {connectionStatus === 'checking' && '🔍 Проверка...'}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Тестирование...' : 'Тест подключения'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonSecondary]}
          onPress={testAuth}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Тест аутентификации</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonClear]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Очистить</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Результаты тестирования:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusConnected: {
    color: '#4CAF50',
  },
  statusError: {
    color: '#F44336',
  },
  statusChecking: {
    color: '#FF9800',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonSecondary: {
    backgroundColor: '#4CAF50',
  },
  buttonClear: {
    backgroundColor: '#FF9800',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
    fontFamily: 'monospace',
  },
});