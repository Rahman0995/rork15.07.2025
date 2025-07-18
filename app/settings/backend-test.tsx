import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { getAppConfig, isDebugMode } from '@/utils/config';
import { Server, CheckCircle, XCircle, RefreshCw, Wifi, Globe, Clock } from 'lucide-react-native';

export default function BackendTestScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkTest, setNetworkTest] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', data?: any, error?: string }>({ status: 'idle' });
  const [internetTest, setInternetTest] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', data?: any, error?: string }>({ status: 'idle' });
  const appConfig = getAppConfig();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 120,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    testCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    testHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    testTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    refreshButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.backgroundSecondary,
    },
    spinning: {
      transform: [{ rotate: '360deg' }],
    },
    statusContainer: {
      marginBottom: 16,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    successContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    unknownContainer: {
      alignItems: 'center',
    },
    statusText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 8,
      color: colors.text,
    },
    responseContainer: {
      marginTop: 16,
    },
    responseLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    responseBox: {
      backgroundColor: colors.successSoft,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.successLight,
    },
    responseText: {
      fontSize: 14,
      color: colors.success,
      fontFamily: 'monospace',
    },
    errorDetails: {
      marginTop: 16,
    },
    errorLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
      marginBottom: 8,
    },
    errorBox: {
      backgroundColor: colors.errorSoft,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.errorLight,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      fontFamily: 'monospace',
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.primarySoft,
    },
    runAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 16,
      gap: 8,
    },
    runAllButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
  });
  
  console.log('BackendTestScreen rendered');
  
  // Use test user if no user is logged in
  const testUser = user || {
    id: 'test-user',
    name: 'Зингиев З.Р.',
    rank: 'Полковник',
    unit: 'Батальон А'
  };
  
  const { data: backendTest, isLoading, error, refetch } = trpc.example.hi.useQuery(
    { name: testUser?.name || 'Test User' },
    { 
      enabled: true, // Always enabled for testing
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );
  
  // Add logging to debug the data
  React.useEffect(() => {
    console.log('Backend test data changed:', { backendTest, isLoading, error });
  }, [backendTest, isLoading, error]);

  // Calculate overall status
  const getOverallStatus = () => {
    const tests = [
      { name: 'Internet', status: internetTest.status },
      { name: 'Network', status: networkTest.status },
      { name: 'tRPC', status: isLoading ? 'loading' : error ? 'error' : backendTest ? 'success' : 'idle' }
    ];
    
    const hasError = tests.some(t => t.status === 'error');
    const hasLoading = tests.some(t => t.status === 'loading');
    const allSuccess = tests.every(t => t.status === 'success');
    
    if (hasError) return { status: 'error', color: colors.error };
    if (hasLoading) return { status: 'loading', color: colors.primary };
    if (allSuccess) return { status: 'success', color: colors.success };
    return { status: 'idle', color: colors.textSecondary };
  };

  const overallStatus = getOverallStatus();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const testNetworkConnection = async () => {
    setNetworkTest({ status: 'loading' });
    
    try {
      const startTime = Date.now();
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(appConfig.backendConfig.baseUrl + '/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        setNetworkTest({ 
          status: 'success', 
          data: { 
            ...data, 
            responseTime,
            status: response.status,
            statusText: response.statusText 
          } 
        });
      } else {
        setNetworkTest({ 
          status: 'error', 
          error: `HTTP ${response.status}: ${response.statusText}` 
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setNetworkTest({ 
          status: 'error', 
          error: 'Request timeout (5s)' 
        });
      } else {
        setNetworkTest({ 
          status: 'error', 
          error: error.message || 'Network connection failed' 
        });
      }
    }
  };

  const testInternetConnection = async () => {
    setInternetTest({ status: 'loading' });
    
    try {
      const startTime = Date.now();
      
      // Test with a reliable public API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://httpbin.org/json', {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        setInternetTest({ 
          status: 'success', 
          data: { 
            responseTime,
            status: response.status,
            testUrl: 'httpbin.org',
            timestamp: new Date().toISOString()
          } 
        });
      } else {
        setInternetTest({ 
          status: 'error', 
          error: `HTTP ${response.status}: ${response.statusText}` 
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setInternetTest({ 
          status: 'error', 
          error: 'Request timeout (3s)' 
        });
      } else {
        setInternetTest({ 
          status: 'error', 
          error: error.message || 'Internet connection failed' 
        });
      }
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Тест подключения',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: overallStatus.status === 'success' ? colors.successSoft : colors.primarySoft }]}>
            {overallStatus.status === 'loading' ? (
              <ActivityIndicator size={32} color={colors.primary} />
            ) : overallStatus.status === 'success' ? (
              <CheckCircle size={32} color={colors.success} />
            ) : overallStatus.status === 'error' ? (
              <XCircle size={32} color={colors.error} />
            ) : (
              <Server size={32} color={colors.primary} />
            )}
          </View>
          <Text style={styles.title}>Backend Connection Test</Text>
          <Text style={[styles.subtitle, { color: overallStatus.color }]}>
            {overallStatus.status === 'success' ? 'Все системы работают' :
             overallStatus.status === 'error' ? 'Обнаружены проблемы' :
             overallStatus.status === 'loading' ? 'Выполняется проверка...' :
             'Проверка связи с сервером'}
          </Text>
          
          <TouchableOpacity 
            style={styles.runAllButton}
            onPress={async () => {
              await Promise.all([
                testInternetConnection(),
                testNetworkConnection(),
                handleRefresh()
              ]);
            }}
            disabled={isLoading || isRefreshing || networkTest.status === 'loading' || internetTest.status === 'loading'}
          >
            <RefreshCw 
              size={20} 
              color={colors.white} 
              style={[isLoading || isRefreshing || networkTest.status === 'loading' || internetTest.status === 'loading' ? styles.spinning : null]} 
            />
            <Text style={styles.runAllButtonText}>Запустить все тесты</Text>
          </TouchableOpacity>
        </View>

        {/* Internet Connection Test */}
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <Text style={styles.testTitle}>Internet Connection</Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={testInternetConnection}
              disabled={internetTest.status === 'loading'}
            >
              <RefreshCw 
                size={16} 
                color={colors.primary} 
                style={[internetTest.status === 'loading' ? styles.spinning : null]} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusContainer}>
            {internetTest.status === 'loading' ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.statusText}>Проверка интернета...</Text>
              </View>
            ) : internetTest.status === 'error' ? (
              <View style={styles.errorContainer}>
                <XCircle size={20} color={colors.error} />
                <Text style={[styles.statusText, { color: colors.error }]}>Интернет недоступен</Text>
              </View>
            ) : internetTest.status === 'success' ? (
              <View style={styles.successContainer}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Интернет работает ({internetTest.data?.responseTime}ms)
                </Text>
              </View>
            ) : (
              <View style={styles.unknownContainer}>
                <TouchableOpacity onPress={testInternetConnection} style={styles.testButton}>
                  <Globe size={20} color={colors.primary} />
                  <Text style={[styles.statusText, { color: colors.primary }]}>Проверить интернет</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {internetTest.data && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Результат теста:</Text>
              <View style={styles.responseBox}>
                <Text style={styles.responseText}>{JSON.stringify(internetTest.data, null, 2)}</Text>
              </View>
            </View>
          )}

          {internetTest.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorLabel}>Детали ошибки:</Text>
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{internetTest.error}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Network Connection Test */}
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <Text style={styles.testTitle}>Network Connection</Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={testNetworkConnection}
              disabled={networkTest.status === 'loading'}
            >
              <RefreshCw 
                size={16} 
                color={colors.primary} 
                style={[networkTest.status === 'loading' ? styles.spinning : null]} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusContainer}>
            {networkTest.status === 'loading' ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.statusText}>Проверка сети...</Text>
              </View>
            ) : networkTest.status === 'error' ? (
              <View style={styles.errorContainer}>
                <XCircle size={20} color={colors.error} />
                <Text style={[styles.statusText, { color: colors.error }]}>Сеть недоступна</Text>
              </View>
            ) : networkTest.status === 'success' ? (
              <View style={styles.successContainer}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Сеть работает ({networkTest.data?.responseTime}ms)
                </Text>
              </View>
            ) : (
              <View style={styles.unknownContainer}>
                <TouchableOpacity onPress={testNetworkConnection} style={styles.testButton}>
                  <Wifi size={20} color={colors.primary} />
                  <Text style={[styles.statusText, { color: colors.primary }]}>Проверить сеть</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {networkTest.data && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Ответ сервера:</Text>
              <View style={styles.responseBox}>
                <Text style={styles.responseText}>{JSON.stringify(networkTest.data, null, 2)}</Text>
              </View>
            </View>
          )}

          {networkTest.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorLabel}>Детали ошибки:</Text>
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{networkTest.error}</Text>
              </View>
            </View>
          )}
        </View>

        {/* tRPC Connection Test */}
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <Text style={styles.testTitle}>tRPC Connection</Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw 
                size={16} 
                color={colors.primary} 
                style={[isLoading || isRefreshing ? styles.spinning : null]} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusContainer}>
            {isLoading || isRefreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.statusText}>Подключение...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <XCircle size={20} color={colors.error} />
                <Text style={[styles.statusText, { color: colors.error }]}>Ошибка подключения</Text>
              </View>
            ) : backendTest ? (
              <View style={styles.successContainer}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>Подключение активно</Text>
              </View>
            ) : (
              <View style={styles.unknownContainer}>
                <Text style={styles.statusText}>Статус неизвестен</Text>
              </View>
            )}
          </View>

          {backendTest && typeof backendTest === 'object' && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Ответ сервера:</Text>
              <View style={styles.responseBox}>
                <Text style={styles.responseText}>{JSON.stringify(backendTest, null, 2)}</Text>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorLabel}>Детали ошибки:</Text>
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error.message}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Информация о подключении</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Пользователь:</Text>
            <Text style={styles.infoValue}>{testUser?.name || 'Не авторизован'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Роль:</Text>
            <Text style={styles.infoValue}>{testUser?.rank || 'Не определена'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Подразделение:</Text>
            <Text style={styles.infoValue}>{testUser?.unit || 'Не указано'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Платформа:</Text>
            <Text style={styles.infoValue}>{Platform.OS} {Platform.Version}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Время:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleString('ru-RU')}</Text>
          </View>
        </View>

        {isDebugMode() && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Конфигурация (Debug)</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>API URL:</Text>
              <Text style={styles.infoValue}>{appConfig.apiUrl}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Backend URL:</Text>
              <Text style={styles.infoValue}>{appConfig.backendConfig.baseUrl}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timeout:</Text>
              <Text style={styles.infoValue}>{appConfig.backendConfig.timeout}ms</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Debug Mode:</Text>
              <Text style={styles.infoValue}>{appConfig.enableDebugMode ? 'Включен' : 'Выключен'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Analytics:</Text>
              <Text style={styles.infoValue}>{appConfig.enableAnalytics ? 'Включена' : 'Выключена'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}