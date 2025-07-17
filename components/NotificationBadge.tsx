import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

interface NotificationBadgeProps {
  count: number;
  size?: number;
  style?: any;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  size = 16,
  style 
}) => {
  const { colors } = useTheme();
  
  if (count === 0) return null;
  
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <Text style={[
      {
        color: 'white',
        fontSize: Math.max(10, size * 0.65),
        fontWeight: '700' as const,
        textAlign: 'center' as const,
        lineHeight: size * 0.9,
      }
    ]}>
      {displayCount}
    </Text>
  );
};