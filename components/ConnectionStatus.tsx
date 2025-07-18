import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/constants/theme';
import { Wifi, WifiOff, Server, AlertCircle } from 'lucide-react-native';

interface ConnectionStatusProps {
  isConnected: boolean;
  serverStatus: 'connected' | 'disconnected' | 'error' | 'mock';
  onPress?: () => void;
  showDetails?: boolean;
}

export function ConnectionStatus({ 
  isConnected, 
  serverStatus, 
  onPress,
  showDetails = false 
}: ConnectionStatusProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getStatusInfo = () => {
    switch (serverStatus) {
      case 'connected':
        return {
          icon: <Server size={16} color={colors.success} />,
          text: 'Подключено',
          color: colors.success,
          bgColor: colors.successSoft,
        };
      case 'mock':
        return {
          icon: <AlertCircle size={16} color={colors.warning} />,
          text: 'Mock данные',
          color: colors.warning,
          bgColor: colors.warningSoft,
        };
      case 'error':
        return {
          icon: <WifiOff size={16} color={colors.error} />,
          text: 'Ошибка сети',
          color: colors.error,
          bgColor: colors.errorSoft,
        };
      default:
        return {
          icon: <WifiOff size={16} color={colors.textTertiary} />,
          text: 'Отключено',
          color: colors.textTertiary,
          bgColor: colors.backgroundSecondary,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        { backgroundColor: statusInfo.bgColor },
        onPress && styles.touchable
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        {statusInfo.icon}
        <Text style={[styles.text, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>
      
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.detailText}>
            {serverStatus === 'mock' 
              ? 'Сервер недоступен, используются тестовые данные'
              : serverStatus === 'connected'
              ? 'Соединение с сервером установлено'
              : 'Проверьте подключение к интернету'
            }
          </Text>
        </View>
      )}
    </Component>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  touchable: {
    // Add touchable styles if needed
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailText: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 14,
  },
});