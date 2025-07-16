import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { Shield } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const router = useRouter();
  
  const styles = createStyles(colors);
  
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
      <StatusBar style={colors.background === '#FFFFFF' ? 'dark' : 'light'} />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Shield size={32} color={colors.primary} />
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
            
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={fillDemoCredentials}
            >
              <Text style={styles.demoButtonText}>Демо вход (Полковник)</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.version}>Версия 1.0.0</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
    marginTop: 80,
  },
  logoBackground: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  errorContainer: {
    backgroundColor: colors.errorSoft,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.errorLight,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 12,
  },
  demoButton: {
    marginTop: 16,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  demoButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: colors.textTertiary,
    marginBottom: 20,
    fontSize: 13,
    fontWeight: '500',
  },
});