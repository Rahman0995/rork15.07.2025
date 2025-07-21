import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = 20,
  width = '100%',
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius,
          backgroundColor: colors.borderLight,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const TaskCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <SkeletonLoader width={60} height={24} borderRadius={12} />
          <SkeletonLoader width={40} height={20} borderRadius={10} />
        </View>
        <SkeletonLoader width={80} height={32} borderRadius={16} />
      </View>
      
      <SkeletonLoader width="90%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="70%" height={16} borderRadius={4} style={{ marginBottom: 16 }} />
      
      <View style={styles.footer}>
        <SkeletonLoader width={120} height={14} borderRadius={4} />
        <SkeletonLoader width={100} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
};

export const ReportCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.authorInfo}>
            <SkeletonLoader width={100} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={80} height={12} borderRadius={4} />
          </View>
        </View>
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>
      
      <View style={styles.content}>
        <SkeletonLoader width={44} height={44} borderRadius={12} />
        <View style={styles.textContent}>
          <SkeletonLoader width="85%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
          <SkeletonLoader width="75%" height={14} borderRadius={4} />
        </View>
      </View>
      
      <View style={styles.footer}>
        <SkeletonLoader width={60} height={24} borderRadius={12} />
        <SkeletonLoader width={30} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

export const StatCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      <SkeletonLoader width={40} height={40} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonLoader width={40} height={24} borderRadius={4} style={{ marginBottom: 4 }} />
      <SkeletonLoader width={60} height={12} borderRadius={4} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    flexDirection: 'column',
    gap: 4,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  textContent: {
    flex: 1,
    marginLeft: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});