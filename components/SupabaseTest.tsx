import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { useUsers, useCreateUser } from '@/lib/supabaseHooks';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export const SupabaseTest: React.FC = () => {
  const { user, session, loading, signIn, signUp, signOut, isAuthenticated } = useSupabaseAuth();
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
  const createUserMutation = useCreateUser();
  
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [firstName, setFirstName] = useState('Тест');
  const [lastName, setLastName] = useState('Пользователь');

  const handleSignUp = async () => {
    try {
      const { error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        role: 'soldier',
      });
      
      if (error) {
        Alert.alert('Ошибка регистрации', error.message);
      } else {
        Alert.alert('Успех', 'Пользователь зарегистрирован! Проверьте email для подтверждения.');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Ошибка входа', error.message);
      } else {
        Alert.alert('Успех', 'Вход выполнен успешно!');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Успех', 'Выход выполнен успешно!');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').single();
      
      if (error) {
        Alert.alert('Ошибка подключения', error.message);
      } else {
        Alert.alert('Успех', 'Подключение к Supabase работает!');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const createTestUser = async () => {
    try {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password_hash: '$2b$10$example.hash.for.demo.purposes.only',
        first_name: 'Тестовый',
        last_name: 'Пользователь',
        rank: 'Рядовой',
        role: 'soldier',
        unit: 'Тестовое подразделение',
      };

      await createUserMutation.mutateAsync(userData);
      Alert.alert('Успех', 'Тестовый пользователь создан!');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Тест Supabase</Text>
      
      {/* Статус подключения */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Статус подключения</Text>
        <Text style={styles.status}>
          Аутентифицирован: {isAuthenticated ? '✅ Да' : '❌ Нет'}
        </Text>
        <Text style={styles.status}>
          Загрузка: {loading ? '⏳ Да' : '✅ Нет'}
        </Text>
        {user && (
          <Text style={styles.status}>
            Пользователь: {user.email}
          </Text>
        )}
        <Button title="Тест подключения" onPress={testConnection} />
      </View>

      {/* Форма аутентификации */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Аутентификация</Text>
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Input
          label="Имя"
          value={firstName}
          onChangeText={setFirstName}
        />
        
        <Input
          label="Фамилия"
          value={lastName}
          onChangeText={setLastName}
        />
        
        <View style={styles.buttonRow}>
          <Button 
            title="Регистрация" 
            onPress={handleSignUp}
            disabled={loading}
            style={styles.button}
          />
          <Button 
            title="Вход" 
            onPress={handleSignIn}
            disabled={loading}
            style={styles.button}
          />
        </View>
        
        {isAuthenticated && (
          <Button 
            title="Выход" 
            onPress={handleSignOut}
            disabled={loading}
            variant="outline"
          />
        )}
      </View>

      {/* Тест данных */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Тест данных</Text>
        
        <Button 
          title="Создать тестового пользователя" 
          onPress={createTestUser}
          disabled={createUserMutation.isPending}
        />
        
        <Text style={styles.status}>
          Загрузка пользователей: {usersLoading ? '⏳ Да' : '✅ Нет'}
        </Text>
        
        {usersError && (
          <Text style={styles.error}>
            Ошибка: {usersError.message}
          </Text>
        )}
        
        {users && (
          <Text style={styles.status}>
            Найдено пользователей: {users.length}
          </Text>
        )}
      </View>

      {/* Список пользователей */}
      {users && users.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Пользователи</Text>
          {users.slice(0, 5).map((user: any) => (
            <View key={user.id} style={styles.userItem}>
              <Text style={styles.userName}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>{user.role} - {user.rank}</Text>
            </View>
          ))}
        </View>
      )}
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
});