import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Play, CheckCircle, XCircle, Loader } from 'lucide-react-native';
import { trpcClient } from '@/lib/trpc';
import { supabase, database, auth } from '@/lib/supabase';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { useTheme } from '@/constants/theme';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

interface IntegrationTest {
  id: string;
  name: string;
  description: string;
  test: () => Promise<void>;
}

export default function IntegrationTester() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const updateTestResult = (testId: string, result: Partial<TestResult>) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: { ...prev[testId], ...result }
    }));
  };

  const tests: IntegrationTest[] = [
    {
      id: 'supabase-connection',
      name: 'Подключение к Supabase',
      description: 'Проверка базового подключения к базе данных',
      test: async () => {
        if (!supabase) throw new Error('Supabase не настроен');
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
      }
    },
    {
      id: 'supabase-auth',
      name: 'Аутентификация Supabase',
      description: 'Проверка системы аутентификации',
      test: async () => {
        if (!supabase) throw new Error('Supabase не настроен');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !user) throw new Error('Пользователь не авторизован');
      }
    },
    {
      id: 'supabase-crud',
      name: 'CRUD операции Supabase',
      description: 'Тестирование создания, чтения, обновления и удаления данных',
      test: async () => {
        if (!user) throw new Error('Пользователь не авторизован');
        
        // Создание тестовой задачи
        const testTask = {
          title: 'Test Task ' + Date.now(),
          description: 'Тестовая задача для проверки CRUD операций',
          status: 'pending',
          priority: 'low',
          created_by: user.id,
          assigned_to: user.id,
        };
        
        const { data: created, error: createError } = await database.tasks.create(testTask);
        if (createError) throw createError;
        if (!created) throw new Error('Задача не была создана');
        
        // Чтение созданной задачи
        const { data: read, error: readError } = await database.tasks.getById(created.id);
        if (readError) throw readError;
        if (!read) throw new Error('Задача не найдена');
        
        // Обновление задачи
        const { data: updated, error: updateError } = await database.tasks.update(created.id, {
          status: 'completed'
        });
        if (updateError) throw updateError;
        
        // Удаление задачи
        const { error: deleteError } = await database.tasks.delete(created.id);
        if (deleteError) throw deleteError;
      }
    },
    {
      id: 'backend-api',
      name: 'Backend API (tRPC)',
      description: 'Проверка работы Backend API через tRPC',
      test: async () => {
        const response = await trpcClient.example.hi.query({});
        if (!response || !response.message) {
          throw new Error('Некорректный ответ от API');
        }
      }
    },
    {
      id: 'backend-tasks',
      name: 'Backend Tasks API',
      description: 'Проверка API для работы с задачами',
      test: async () => {
        const tasks = await trpcClient.tasks.getAll.query();
        if (!Array.isArray(tasks)) {
          throw new Error('API не вернул массив задач');
        }
      }
    },
    {
      id: 'backend-reports',
      name: 'Backend Reports API',
      description: 'Проверка API для работы с отчетами',
      test: async () => {
        const reports = await trpcClient.reports.getAll.query();
        if (!Array.isArray(reports)) {
          throw new Error('API не вернул массив отчетов');
        }
      }
    },
    {
      id: 'realtime-connection',
      name: 'Real-time подключение',
      description: 'Проверка работы real-time подписок',
      test: async () => {
        if (!supabase) throw new Error('Supabase не настроен');
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout: Real-time подключение не установлено'));
          }, 10000);
          
          const channel = supabase!.channel('test-integration-' + Date.now());
          
          channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {})
            .subscribe((status) => {
              clearTimeout(timeout);
              if (status === 'SUBSCRIBED') {
                supabase!.removeChannel(channel);
                resolve(undefined);
              } else if (status === 'CHANNEL_ERROR') {
                reject(new Error('Ошибка подключения к real-time каналу'));
              }
            });
        });
      }
    },
    {
      id: 'integration-flow',
      name: 'Полный цикл интеграции',
      description: 'Тестирование полного цикла: Frontend → Backend → Supabase',
      test: async () => {
        if (!user) throw new Error('Пользователь не авторизован');
        
        // Создание задачи через Backend API
        const newTask = {
          title: 'Integration Test Task ' + Date.now(),
          description: 'Задача для тестирования полной интеграции',
          priority: 'medium' as const,
          assignedTo: user.id,
          createdBy: user.id,
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        };
        
        const createdTaskResponse = await trpcClient.tasks.create.mutate(newTask);
        if (!createdTaskResponse.success || !createdTaskResponse.task) {
          throw new Error('Задача не была создана через Backend API');
        }
        
        const createdTask = createdTaskResponse.task;
        
        // Проверка, что задача появилась в Supabase
        const { data: supabaseTask, error } = await database.tasks.getById(createdTask.id);
        if (error) throw error;
        if (!supabaseTask) throw new Error('Задача не найдена в Supabase');
        
        // Обновление через Backend API
        const updatedTaskResponse = await trpcClient.tasks.update.mutate({
          id: createdTask.id,
          status: 'in_progress' as const,
        });
        
        if (!updatedTaskResponse.success) {
          throw new Error('Не удалось обновить задачу через Backend API');
        }
        
        // Проверка обновления в Supabase
        const { data: updatedSupabaseTask, error: updateError } = await database.tasks.getById(createdTask.id);
        if (updateError) throw updateError;
        if (updatedSupabaseTask?.status !== 'in_progress') {
          throw new Error('Обновление не синхронизировалось с Supabase');
        }
        
        // Удаление через Backend API
        const deleteResponse = await trpcClient.tasks.delete.mutate({ id: createdTask.id });
        if (!deleteResponse.success) {
          throw new Error('Не удалось удалить задачу через Backend API');
        }
        
        // Проверка удаления в Supabase
        const { data: deletedTask, error: deleteError } = await database.tasks.getById(createdTask.id);
        if (!deleteError && deletedTask) {
          throw new Error('Задача не была удалена из Supabase');
        }
      }
    }
  ];

  const runTest = async (test: IntegrationTest) => {
    const startTime = Date.now();
    updateTestResult(test.id, { name: test.name, status: 'running' });
    
    try {
      await test.test();
      const duration = Date.now() - startTime;
      updateTestResult(test.id, {
        status: 'success',
        message: `Тест пройден успешно (${duration}ms)`,
        duration
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(test.id, {
        status: 'error',
        message: error.message || 'Неизвестная ошибка',
        duration
      });
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    
    // Сброс результатов
    setTestResults({});
    
    for (const test of tests) {
      await runTest(test);
      // Небольшая пауза между тестами
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningAll(false);
    
    // Показать сводку результатов
    const results = Object.values(testResults);
    const passed = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    Alert.alert(
      'Результаты тестирования',
      `Пройдено: ${passed}\nНе пройдено: ${failed}\nВсего: ${results.length}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'running':
        return <Loader size={20} color="#6B7280" />;
      default:
        return <Play size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'running':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Тестирование интеграции</Text>
        <TouchableOpacity
          style={[styles.runAllButton, isRunningAll && styles.runAllButtonDisabled]}
          onPress={runAllTests}
          disabled={isRunningAll}
        >
          <Play size={16} color="#FFFFFF" />
          <Text style={styles.runAllButtonText}>
            {isRunningAll ? 'Выполняется...' : 'Запустить все'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.testsList} showsVerticalScrollIndicator={false}>
        {tests.map((test) => {
          const result = testResults[test.id] || { name: test.name, status: 'idle' as const };
          
          return (
            <View key={test.id} style={styles.testItem}>
              <View style={styles.testHeader}>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testDescription}>{test.description}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => runTest(test)}
                  disabled={result.status === 'running' || isRunningAll}
                >
                  {getStatusIcon(result.status)}
                </TouchableOpacity>
              </View>
              
              {result.message && (
                <View style={styles.testResult}>
                  <Text style={[styles.testResultText, { color: getStatusColor(result.status) }]}>
                    {result.message}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  runAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  runAllButtonDisabled: {
    opacity: 0.5,
  },
  runAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  testsList: {
    flex: 1,
  },
  testItem: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  testButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  testResult: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  testResultText: {
    fontSize: 14,
    fontWeight: '500',
  },
});