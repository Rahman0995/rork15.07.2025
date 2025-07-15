import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Shield } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated) {
      // Use setTimeout to ensure navigation happens after component is fully mounted
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  }, [isAuthenticated]);
  
  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Введите email');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Введите корректный email');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Введите пароль');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Пароль должен содержать не менее 6 символов');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };
  
  const handleLogin = async () => {
    if (validateForm()) {
      await login(email, password);
    }
  };
  
  // For demo purposes, prefill with a mock user
  const fillDemoCredentials = () => {
    setEmail('ivanov@mil.ru');
    setPassword('123456');
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Shield size={40} color={colors.primary} />
            </View>
            <Text style={styles.logoText}>Военная Часть</Text>
            <Text style={styles.subtitle}>Система управления</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Вход в систему</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <Input
              label="Email"
              placeholder="Введите ваш email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="Пароль"
              placeholder="Введите ваш пароль"
              value={password}
              onChangeText={setPassword}
              isPassword
              error={passwordError}
              containerStyle={styles.inputContainer}
            />
            
            <Button
              title="Войти"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />
            
            <Button
              title="Демо вход (Полковник)"
              onPress={fillDemoCredentials}
              variant="outline"
              fullWidth
              style={styles.demoButton}
            />
          </View>
          
          <Text style={styles.version}>Версия 1.0.0</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: colors.error + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  demoButton: {
    marginTop: 12,
  },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 16,
  },
});