import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface NotificationBadgeProps {
  count: number;
  size?: number;
  style?: ViewStyle;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  size = 18,
  style 
}) => {
  if (count === 0) return null;
  
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <View style={[
      styles.badge,
      { 
        height: size, 
        borderRadius: size / 2,
        minWidth: size,
        paddingHorizontal: size * 0.2, // добавляем отступы для длинного текста
      },
      style
    ]}>
      <Text style={[
        styles.text,
        { fontSize: size * 0.6 }
      ]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});