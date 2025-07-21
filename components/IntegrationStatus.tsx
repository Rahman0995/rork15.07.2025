import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { trpcClient } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { useTheme } from '@/constants/theme';

interface IntegrationStatusProps {
  compact?: boolean;
}

export default function IntegrationStatus({ compact = false }: IntegrationStatusProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'warning' | 'error'>('checking');
  const [details, setDetails] = useState<string>('Проверка систем...');
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      let hasErrors = false;
      let hasWarnings = false;
      let statusDetails = [];

      // Проверка Supabase
      if (!supabase) {
        hasErrors = true;
        statusDetails.push('Supabase не настроен');
      } else {
        try {
          await supabase.from('users').select('count').limit(1);
          statusDetails.push('Supabase: OK');
        } catch (error) {
          hasErrors = true;
          statusDetails.push('Supabase: Ошибка подключения');
        }
      }

      // Проверка Backend API
      try {
        await trpcClient.example.hi.query(undefined);
        statusDetails.push('Backend API: OK');
      } catch (error) {
        hasWarnings = true;
        statusDetails.push('Backend API: Mock режим');
      }

      // Проверка аутентификации
      if (user) {
        statusDetails.push('Аутентификация: OK');
      } else {
        hasWarnings = true;
        statusDetails.push('Аутентификация: Не авторизован');
      }

      // Определение общего статуса
      if (hasErrors) {
        setStatus('error');
        setDetails('Критические ошибки');
      } else if (hasWarnings) {
        setStatus('warning');
        setDetails('Работает с предупреждениями');
      } else {
        setStatus('healthy');
        setDetails('Все системы работают');
      }
    } catch (error) {
      setStatus('error');
      setDetails('Ошибка проверки статуса');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={compact ? 16 : 20} color="#10B981" />;
      case 'warning':
        return <AlertCircle size={compact ? 16 : 20} color="#F59E0B" />;
      case 'error':
        return <XCircle size={compact ? 16 : 20} color="#EF4444" />;
      case 'checking':
        return <Activity size={compact ? 16 : 20} color="#6B7280" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'checking':
        return '#6B7280';
    }
  };

  const handlePress = () => {
    router.push('/integration-diagnostics');
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress}>
        {getStatusIcon()}
        <Text style={[styles.compactText, { color: getStatusColor() }]}>
          {details}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.iconContainer}>
        {getStatusIcon()}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Статус интеграции</Text>
        <Text style={[styles.details, { color: getStatusColor() }]}>
          {details}
        </Text>
      </View>
      
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 16,
    color: colors.textTertiary,
    fontWeight: '300',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});