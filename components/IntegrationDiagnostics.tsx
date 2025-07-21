import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Server, Cloud } from 'lucide-react-native';
import { trpcClient } from '@/lib/trpc';
import { supabase, auth, database } from '@/lib/supabase';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export default function IntegrationDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, session, loading: authLoading } = useSupabaseAuth();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Проверка конфигурации Supabase
    results.push({
      name: 'Конфигурация Supabase',
      status: supabase ? 'success' : 'error',
      message: supabase ? 'Supabase настроен корректно' : 'Supabase не настроен',
      details: supabase ? 'URL и ключи найдены' : 'Проверьте переменные окружения EXPO_PUBLIC_SUPABASE_URL и EXPO_PUBLIC_SUPABASE_ANON_KEY'
    });

    // 2. Проверка подключения к Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        results.push({
          name: 'Подключение к Supabase DB',
          status: error ? 'error' : 'success',
          message: error ? 'Ошибка подключения к БД' : 'Подключение к БД работает',
          details: error ? error.message : 'Запрос к таблице users выполнен успешно'
        });
      } catch (error: any) {
        results.push({
          name: 'Подключение к Supabase DB',
          status: 'error',
          message: 'Ошибка подключения к БД',
          details: error.message
        });
      }
    }

    // 3. Проверка аутентификации Supabase
    results.push({
      name: 'Аутентификация Supabase',
      status: authLoading ? 'loading' : (user ? 'success' : 'warning'),
      message: authLoading ? 'Загрузка...' : (user ? `Пользователь авторизован: ${user.email}` : 'Пользователь не авторизован'),
      details: session ? `Токен: ${session.access_token.substring(0, 20)}...` : 'Нет активной сессии'
    });

    // 4. Проверка Backend API (tRPC)
    try {
      const response = await trpcClient.example.hi.query({});
      results.push({
        name: 'Backend API (tRPC)',
        status: 'success',
        message: 'Backend API работает',
        details: `Ответ: ${response.message}`
      });
    } catch (error: any) {
      results.push({
        name: 'Backend API (tRPC)',
        status: 'warning',
        message: 'Backend недоступен, используется mock',
        details: error.message
      });
    }

    // 5. Проверка интеграции Backend + Supabase
    try {
      const tasks = await trpcClient.tasks.getAll.query();
      results.push({
        name: 'Backend + Supabase интеграция',
        status: 'success',
        message: 'Интеграция работает',
        details: `Получено задач: ${tasks.length}`
      });
    } catch (error: any) {
      results.push({
        name: 'Backend + Supabase интеграция',
        status: 'warning',
        message: 'Используются mock данные',
        details: error.message
      });
    }

    // 6. Проверка прямого доступа к Supabase
    if (supabase) {
      try {
        const { data, error } = await database.users.getAll();
        results.push({
          name: 'Прямой доступ к Supabase',
          status: error ? 'error' : 'success',
          message: error ? 'Ошибка прямого доступа' : 'Прямой доступ работает',
          details: error ? error.message : `Найдено пользователей: ${data?.length || 0}`
        });
      } catch (error: any) {
        results.push({
          name: 'Прямой доступ к Supabase',
          status: 'error',
          message: 'Ошибка прямого доступа',
          details: error.message
        });
      }
    }

    // 7. Проверка Real-time подключения
    if (supabase) {
      try {
        const channel = supabase.channel('test-channel');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
          
          channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {})
            .subscribe((status) => {
              clearTimeout(timeout);
              if (status === 'SUBSCRIBED') {
                resolve(status);
              } else if (status === 'CHANNEL_ERROR') {
                reject(new Error('Channel error'));
              }
            });
        });
        
        results.push({
          name: 'Real-time подключение',
          status: 'success',
          message: 'Real-time работает',
          details: 'Подписка на изменения активна'
        });
        
        supabase.removeChannel(channel);
      } catch (error: any) {
        results.push({
          name: 'Real-time подключение',
          status: 'warning',
          message: 'Real-time недоступен',
          details: error.message
        });
      }
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={20} color="#F59E0B" />;
      case 'loading':
        return <RefreshCw size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'loading':
        return '#6B7280';
    }
  };

  const showDetails = (result: DiagnosticResult) => {
    Alert.alert(
      result.name,
      `${result.message}\n\n${result.details || 'Нет дополнительной информации'}`,
      [{ text: 'OK' }]
    );
  };

  const getOverallStatus = () => {
    if (diagnostics.length === 0) return 'loading';
    
    const hasErrors = diagnostics.some(d => d.status === 'error');
    const hasWarnings = diagnostics.some(d => d.status === 'warning');
    
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  };

  const getOverallMessage = () => {
    const overallStatus = getOverallStatus();
    switch (overallStatus) {
      case 'success':
        return 'Все системы работают корректно';
      case 'warning':
        return 'Системы работают с предупреждениями';
      case 'error':
        return 'Обнаружены критические ошибки';
      case 'loading':
        return 'Проверка систем...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            {getOverallStatus() === 'success' && <Database size={24} color="#10B981" />}
            {getOverallStatus() === 'warning' && <Server size={24} color="#F59E0B" />}
            {getOverallStatus() === 'error' && <Cloud size={24} color="#EF4444" />}
            {getOverallStatus() === 'loading' && <RefreshCw size={24} color="#6B7280" />}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Диагностика интеграции</Text>
            <Text style={[styles.subtitle, { color: getStatusColor(getOverallStatus()) }]}>
              {getOverallMessage()}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.refreshButton, isRunning && styles.refreshButtonDisabled]}
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <RefreshCw 
            size={20} 
            color={isRunning ? '#9CA3AF' : '#6B7280'} 
            style={isRunning ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.diagnosticsList} showsVerticalScrollIndicator={false}>
        {diagnostics.map((result, index) => (
          <TouchableOpacity
            key={index}
            style={styles.diagnosticItem}
            onPress={() => showDetails(result)}
          >
            <View style={styles.diagnosticIcon}>
              {getStatusIcon(result.status)}
            </View>
            
            <View style={styles.diagnosticContent}>
              <Text style={styles.diagnosticName}>{result.name}</Text>
              <Text style={[styles.diagnosticMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
            </View>
            
            <View style={styles.diagnosticArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {diagnostics.length === 0 && !isRunning && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Нажмите кнопку обновления для запуска диагностики</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  spinning: {
    // В React Native нет встроенной анимации вращения через стили
    // Можно добавить через Animated API если нужно
  },
  diagnosticsList: {
    flex: 1,
  },
  diagnosticItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  diagnosticIcon: {
    marginRight: 12,
  },
  diagnosticContent: {
    flex: 1,
  },
  diagnosticName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  diagnosticMessage: {
    fontSize: 14,
    fontWeight: '400',
  },
  diagnosticArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});