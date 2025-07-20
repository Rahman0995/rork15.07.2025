import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export const SupabaseTest: React.FC = () => {
  
  const [status, setStatus] = useState('Проверка...');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    const configured = url && key && 
      url !== 'https://your-project-ref.supabase.co' && 
      key !== 'your-anon-key-here';
    
    setIsConfigured(!!configured);
    setStatus(configured ? '✅ Настроен' : '❌ Не настроен');
  };

  const testConnection = async () => {
    if (!supabase) {
      Alert.alert('Ошибка', 'Supabase не настроен');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        Alert.alert('Ошибка подключения', error.message);
      } else {
        Alert.alert('Успех', 'Подключение к Supabase работает!');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Тест Supabase</Text>
      
      {/* Статус конфигурации */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Конфигурация</Text>
        <Text style={styles.status}>
          URL: {process.env.EXPO_PUBLIC_SUPABASE_URL || 'НЕ НАСТРОЕН'}
        </Text>
        <Text style={styles.status}>
          Key: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'НАСТРОЕН' : 'НЕ НАСТРОЕН'}
        </Text>
        <Text style={styles.status}>
          Статус: {status}
        </Text>
        <Text style={styles.status}>
          Клиент: {supabase ? '✅ Создан' : '❌ Не создан'}
        </Text>
      </View>

      {/* Тест подключения */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Тест подключения</Text>
        <Button 
          title={loading ? "Тестирование..." : "Тест подключения"} 
          onPress={testConnection}
          disabled={loading || !isConfigured}
        />
        {!isConfigured && (
          <Text style={styles.error}>
            Настройте Supabase в .env файле для тестирования
          </Text>
        )}
      </View>

      {/* Инструкции по настройке */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройка Supabase</Text>
        <Text style={styles.instructions}>
          1. Создайте проект на supabase.com{'\n'}
          2. Скопируйте URL и anon key из Settings → API{'\n'}
          3. Добавьте их в .env файл:{'\n'}
          {'\n'}
          EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{'\n'}
          EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key{'\n'}
          {'\n'}
          4. Перезапустите приложение
        </Text>
      </View>
    </ScrollView>
  );
};

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
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  error: {
    fontSize: 14,
    color: '#ff4444',
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 0.48,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userRole: {
    fontSize: 12,
    color: '#999',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});