import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { Shield, ArrowLeft } from 'lucide-react-native';
import { UserRole } from '@/types';

const RANKS = [
  'Рядовой',
  'Ефрейтор',
  'Младший сержант',
  'Сержант',
  'Старший сержант',
  'Старшина',
  'Прапорщик',
  'Старший прапорщик',
  'Младший лейтенант',
  'Лейтенант',
  'Старший лейтенант',
  'Капитан',
  'Майор',
  'Подполковник',
  'Полковник',
  'Генерал-майор',
  'Генерал-лейтенант',
  'Генерал-полковник',
  'Генерал армии',
];

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'soldier', label: 'Солдат' },
  { value: 'officer', label: 'Офицер' },
  { value: 'company_commander', label: 'Командир роты' },
  { value: 'battalion_commander', label: 'Командир батальона' },
  { value: 'admin', label: 'Администратор' },
];

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rank: 'Рядовой',
    unit: '',
    phone: '',
    role: 'soldier' as UserRole,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRankPicker, setShowRankPicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  
  const { register, isLoading, error, isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const router = useRouter();
  
  const styles = createStyles(colors);
  
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 200);
    }
  }, [isAuthenticated]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (!formData.name) {
      newErrors.name = 'Введите ФИО';
    } else if (formData.name.length < 2) {
      newErrors.name = 'ФИО должно содержать не менее 2 символов';
    }
    
    if (!formData.unit) {
      newErrors.unit = 'Введите подразделение';
    }
    
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async () => {
    if (validateForm()) {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    }
  };
  
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Shield size={32} color={colors.primary} />
              </View>
              <Text style={styles.logoText}>Регистрация</Text>
              <Text style={styles.subtitle}>Создание нового аккаунта</Text>
            </View>
          </View>
          
          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <Input
              label="Email"
              placeholder="Введите ваш email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="Пароль"
              placeholder="Введите пароль"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              isPassword
              error={errors.password}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="Подтверждение пароля"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              isPassword
              error={errors.confirmPassword}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="ФИО"
              placeholder="Введите ваше ФИО"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              error={errors.name}
              containerStyle={styles.inputContainer}
            />
            
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowRankPicker(!showRankPicker)}
            >
              <Text style={styles.pickerLabel}>Звание</Text>
              <Text style={styles.pickerValue}>{formData.rank}</Text>
            </TouchableOpacity>
            
            {showRankPicker && (
              <View style={styles.pickerContainer}>
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {RANKS.map((rank) => (
                    <TouchableOpacity
                      key={rank}
                      style={[
                        styles.pickerItem,
                        formData.rank === rank && styles.pickerItemSelected
                      ]}
                      onPress={() => {
                        updateFormData('rank', rank);
                        setShowRankPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        formData.rank === rank && styles.pickerItemTextSelected
                      ]}>
                        {rank}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <Input
              label="Подразделение"
              placeholder="Введите ваше подразделение"
              value={formData.unit}
              onChangeText={(value) => updateFormData('unit', value)}
              error={errors.unit}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="Телефон (необязательно)"
              placeholder="Введите номер телефона"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
              error={errors.phone}
              containerStyle={styles.inputContainer}
            />
            
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <Text style={styles.pickerLabel}>Роль</Text>
              <Text style={styles.pickerValue}>
                {ROLES.find(r => r.value === formData.role)?.label}
              </Text>
            </TouchableOpacity>
            
            {showRolePicker && (
              <View style={styles.pickerContainer}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.pickerItem,
                      formData.role === role.value && styles.pickerItemSelected
                    ]}
                    onPress={() => {
                      updateFormData('role', role.value);
                      setShowRolePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      formData.role === role.value && styles.pickerItemTextSelected
                    ]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <Button
              title="Зарегистрироваться"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
            />
            
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginLinkText}>
                Уже есть аккаунт? <Text style={styles.loginLinkTextBold}>Войти</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  logoContainer: {
    alignItems: 'center',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: 20,
    minHeight: 600,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    marginBottom: 16,
  },
  pickerButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerItemSelected: {
    backgroundColor: colors.primarySoft,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginLinkText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  loginLinkTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});