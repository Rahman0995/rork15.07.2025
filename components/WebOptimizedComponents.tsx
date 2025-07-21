import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/constants/theme';

interface WebOptimizedCardProps {
  title: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const WebOptimizedCard: React.FC<WebOptimizedCardProps> = memo(({ 
  title, 
  description, 
  onPress, 
  children 
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <Text style={styles.title}>{title}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      {children}
    </CardComponent>
  );
});

interface WebOptimizedListProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  keyExtractor?: (item: any, index: number) => string;
}

export const WebOptimizedList: React.FC<WebOptimizedListProps> = memo(({ 
  data, 
  renderItem, 
  keyExtractor 
}) => {
  return (
    <View>
      {data.map((item, index) => (
        <View key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </View>
      ))}
    </View>
  );
});

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});