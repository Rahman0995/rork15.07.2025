import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { getAppConfig, isDebugMode } from '@/utils/config';
import { Server, CheckCircle, XCircle, RefreshCw } from 'lucide-react-native';

export default function BackendTestScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const appConfig = getAppConfig();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 20,
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
  });
  
  console.log('BackendTestScreen rendered');
  
  // Use test user if no user is logged in
  const testUser = user || {
    id: 'test-user',
    name: 'Иванов А.П.',
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
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
          <View style={styles.iconContainer}>
            <Server size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Backend Connection Test</Text>
          <Text style={styles.subtitle}>Проверка связи с сервером</Text>
        </View>

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