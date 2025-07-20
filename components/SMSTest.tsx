import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { supabase } from '@/lib/supabase';

export function SMSTest() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'verify'>('phone');

  const sendSMS = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Ошибка', 'Введите номер телефона');
      return;
    }

    setIsLoading(true);
    try {
      if (!supabase) {
        Alert.alert('Ошибка', 'Supabase не настроен');
        return;
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          channel: 'sms',
        }
      });

      if (error) {
        console.error('SMS Error:', error);
        Alert.alert('Ошибка отправки SMS', error.message);
      } else {
        console.log('SMS sent successfully:', data);
        Alert.alert('Успех', 'SMS код отправлен на ваш номер');
        setStep('verify');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      Alert.alert('Ошибка', 'Не удалось отправить SMS');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Ошибка', 'Введите код подтверждения');
      return;
    }

    setIsLoading(true);
    try {
      if (!supabase) {
        Alert.alert('Ошибка', 'Supabase не настроен');
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: 'sms'
      });

      if (error) {
        console.error('Verification Error:', error);
        Alert.alert('Ошибка верификации', error.message);
      } else {
        console.log('Verification successful:', data);
        Alert.alert('Успех', 'Номер телефона подтвержден!');
        setStep('phone');
        setPhoneNumber('');
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      Alert.alert('Ошибка', 'Не удалось подтвердить код');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhoneNumber('');
    setVerificationCode('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест SMS аутентификации</Text>
      
      {step === 'phone' ? (
        <View style={styles.form}>
          <Text style={styles.label}>Номер телефона:</Text>
          <Input
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+7 (999) 123-45-67"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Button
            title={isLoading ? "Отправка..." : "Отправить SMS код"}
            onPress={sendSMS}
            disabled={isLoading}
            style={styles.button}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Код подтверждения:</Text>
          <Text style={styles.subtitle}>
            Введите код, отправленный на {phoneNumber}
          </Text>
          <Input
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />
          <Button
            title={isLoading ? "Проверка..." : "Подтвердить код"}
            onPress={verifyCode}
            disabled={isLoading}
            style={styles.button}
          />
          <Button
            title="Назад"
            onPress={resetForm}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Информация:</Text>
        <Text style={styles.infoText}>
          • SMS webhook настроен на: {Platform.OS === 'web' ? 'http://localhost:3000' : 'http://192.168.1.100:3000'}/api/webhooks/supabase/sms
        </Text>
        <Text style={styles.infoText}>
          • Убедитесь, что backend запущен на порту 3000
        </Text>
        <Text style={styles.infoText}>
          • Проверьте настройки SMS провайдера в Supabase
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  backButton: {
    marginTop: 8,
  },
  info: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});