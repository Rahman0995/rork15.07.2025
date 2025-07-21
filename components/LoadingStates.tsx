import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/constants/theme';
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  color,
  style,
}) => {
  const { colors } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();

    return () => spin.stop();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ rotate }],
        },
        style,
      ]}
    >
      <Loader2 size={size} color={color || colors.primary} />
    </Animated.View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Загрузка...',
  transparent = false,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: transparent ? 'transparent' : colors.background + 'E6',
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <LoadingSpinner size={32} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  pullDistance?: number;
  refreshThreshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  pullDistance = 100,
  refreshThreshold = 60,
}) => {
  const { colors } = useTheme();
  const pullAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [refreshing, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.pullToRefreshContainer}>
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            backgroundColor: colors.card,
            transform: [
              { translateY: pullAnim },
              { rotate },
            ],
          },
        ]}
      >
        <LoadingSpinner size={20} />
      </Animated.View>
      {children}
    </View>
  );
};

interface ConnectionStatusProps {
  isConnected: boolean;
  style?: any;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  style,
}) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isConnected ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.connectionStatus,
        {
          backgroundColor: isConnected ? colors.success : colors.error,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <View style={styles.connectionContent}>
        {isConnected ? (
          <Wifi size={16} color={colors.white} />
        ) : (
          <WifiOff size={16} color={colors.white} />
        )}
        <Text style={[styles.connectionText, { color: colors.white }]}>
          {isConnected ? 'Подключено' : 'Нет подключения'}
        </Text>
      </View>
    </Animated.View>
  );
};

interface ErrorBoundaryProps {
  error?: Error | null;
  onRetry?: () => void;
  style?: any;
}

export const ErrorState: React.FC<ErrorBoundaryProps> = ({
  error,
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  if (!error) return null;

  return (
    <View style={[styles.errorContainer, style]}>
      <View style={[styles.errorIcon, { backgroundColor: colors.errorSoft }]}>
        <AlertCircle size={32} color={colors.error} />
      </View>
      <Text style={[styles.errorTitle, { color: colors.text }]}>
        Произошла ошибка
      </Text>
      <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
        {error.message || 'Что-то пошло не так'}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: colors.white }]}>
            Повторить
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface SuccessStateProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  duration?: number;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  message,
  visible,
  onDismiss,
  duration = 3000,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, slideAnim, duration, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successContainer,
        {
          backgroundColor: colors.success,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <CheckCircle size={20} color={colors.white} />
      <Text style={[styles.successText, { color: colors.white }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  style?: any;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.progressIndicator, style]}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: index <= currentStep ? colors.primary : colors.borderLight,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                {
                  color: index <= currentStep ? colors.white : colors.textTertiary,
                },
              ]}
            >
              {index + 1}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              {
                color: index <= currentStep ? colors.text : colors.textTertiary,
              },
            ]}
          >
            {step}
          </Text>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepConnector,
                {
                  backgroundColor: index < currentStep ? colors.primary : colors.borderLight,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  pullToRefreshContainer: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    top: -40,
    left: width / 2 - 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  connectionStatus: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 999,
  },
  connectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
  },
  successText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    zIndex: -1,
  },
});