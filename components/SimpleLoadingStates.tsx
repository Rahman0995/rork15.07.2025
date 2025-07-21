import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/constants/theme';

interface SimpleLoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const SimpleLoading: React.FC<SimpleLoadingProps> = ({ 
  message = 'Загрузка...', 
  size = 'large' 
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

interface SimpleErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const SimpleError: React.FC<SimpleErrorProps> = ({ 
  message = 'Произошла ошибка', 
  onRetry 
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryText} onPress={onRetry}>
          Повторить
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});