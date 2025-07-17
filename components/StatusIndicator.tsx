import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff, Server, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';

interface StatusIndicatorProps {
  isOnline?: boolean;
  serverStatus?: 'connected' | 'disconnected' | 'error';
  style?: any;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isOnline = true,
  serverStatus = 'connected',
  style
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getStatusColor = () => {
    if (!isOnline) return colors.error;
    switch (serverStatus) {
      case 'connected':
        return colors.success;
      case 'error':
        return colors.error;
      case 'disconnected':
        return colors.warning;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff size={12} color={getStatusColor()} />;
    switch (serverStatus) {
      case 'connected':
        return <Server size={12} color={getStatusColor()} />;
      case 'error':
        return <AlertCircle size={12} color={getStatusColor()} />;
      case 'disconnected':
        return <Server size={12} color={getStatusColor()} />;
      default:
        return <Wifi size={12} color={getStatusColor()} />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Нет сети';
    switch (serverStatus) {
      case 'connected':
        return 'Подключено';
      case 'error':
        return 'Ошибка';
      case 'disconnected':
        return 'Отключено';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      {getStatusIcon()}
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});