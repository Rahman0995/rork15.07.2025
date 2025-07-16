import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/constants/theme';
import { trpc } from '@/lib/trpc';
import { Loader2, CheckCircle, XCircle, Server } from 'lucide-react-native';

export default function BackendTestScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const hiQuery = trpc.example.hi.useQuery();
  
  const handleRefresh = () => {
    hiQuery.refetch();
  };
  
  const handleTestConnection = async () => {
    try {
      await hiQuery.refetch();
      Alert.alert('Успех', 'Соединение с бэкендом работает!');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось подключиться к бэкенду');
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Server size={32} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Тест бэкенда</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Проверка подключения к серверу
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Статус подключения</Text>
          
          <View style={styles.statusRow}>
            {hiQuery.isLoading ? (
              <Loader2 size={20} color={colors.primary} />
            ) : hiQuery.isSuccess ? (
              <CheckCircle size={20} color={colors.success} />
            ) : (
              <XCircle size={20} color={colors.error} />
            )}
            
            <Text style={[styles.statusText, { 
              color: hiQuery.isLoading ? colors.primary : 
                     hiQuery.isSuccess ? colors.success : colors.error 
            }]}>
              {hiQuery.isLoading ? 'Подключение...' : 
               hiQuery.isSuccess ? 'Подключено' : 'Ошибка подключения'}
            </Text>
          </View>
          
          {hiQuery.data && (
            <View style={[styles.dataContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Ответ сервера:</Text>
              <Text style={[styles.dataText, { color: colors.text }]}>
                {JSON.stringify(hiQuery.data, null, 2)}
              </Text>
            </View>
          )}
          
          {hiQuery.error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.errorBackground }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {hiQuery.error.message}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
            disabled={hiQuery.isLoading}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
              {hiQuery.isLoading ? 'Обновление...' : 'Обновить'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={handleTestConnection}
            disabled={hiQuery.isLoading}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>
              Тест соединения
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dataContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
  },
  actions: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});