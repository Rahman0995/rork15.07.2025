import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SupabaseTestScreen() {
  const [status, setStatus] = React.useState('Проверка подключения...');
  const [details, setDetails] = React.useState<string[]>([]);

  const testConnection = async () => {
    setStatus('Тестирование...');
    setDetails([]);
    
    const newDetails: string[] = [];
    
    try {
      // Проверяем конфигурацию
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      newDetails.push(`URL: ${supabaseUrl || 'НЕ НАСТРОЕН'}`);
      newDetails.push(`Key: ${supabaseKey ? 'НАСТРОЕН' : 'НЕ НАСТРОЕН'}`);
      newDetails.push(`Клиент: ${supabase ? 'СОЗДАН' : 'НЕ СОЗДАН'}`);
      
      if (!supabase) {
        setStatus('❌ Supabase не настроен');
        setDetails(newDetails);
        return;
      }
      
      // Тестируем подключение
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        newDetails.push(`Ошибка: ${error.message}`);
        setStatus('❌ Ошибка подключения');
      } else {
        newDetails.push('Подключение успешно');
        newDetails.push(`Сессия: ${data.session ? 'АКТИВНА' : 'НЕТ'}`);
        setStatus('✅ Supabase работает');
      }
      
    } catch (error) {
      newDetails.push(`Исключение: ${error}`);
      setStatus('❌ Критическая ошибка');
    }
    
    setDetails(newDetails);
  };

  React.useEffect(() => {
    testConnection();
  }, []);

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
      
      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Детали:</Text>
          {details.map((detail, index) => (
            <Text key={index} style={styles.detailText}>
              • {detail}
            </Text>
          ))}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Повторить тест</Text>
        </TouchableOpacity>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Настройка Supabase:</Text>
          <Text style={styles.infoText}>
            1. Создайте проект на supabase.com{'\n'}
            2. Скопируйте URL и anon key{'\n'}
            3. Добавьте их в .env файл:{'\n'}
            EXPO_PUBLIC_SUPABASE_URL=ваш-url{'\n'}
            EXPO_PUBLIC_SUPABASE_ANON_KEY=ваш-ключ
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    color: '#333',
  },
  detailsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 12,
    color: '#333',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});