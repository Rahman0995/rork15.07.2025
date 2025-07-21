import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/constants/theme';
import { SkeletonLoader } from './SkeletonLoader';

interface OptimizedImageProps {
  source: string | { uri: string } | number;
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: any;
  placeholder?: string;
  blurhash?: string;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
  onLoad?: () => void;
  onError?: (error: any) => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  width = 100,
  height = 100,
  borderRadius = 0,
  style,
  placeholder,
  blurhash,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  onLoad,
  onError,
  resizeMode = 'cover',
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const imageSource = useMemo(() => {
    if (typeof source === 'string') {
      return { uri: source };
    }
    return source;
  }, [source]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    onLoad?.();
  }, [fadeAnim, onLoad]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  }, [onError]);

  const imageStyle = useMemo(() => [
    {
      width,
      height,
      borderRadius,
    },
    style,
  ], [width, height, borderRadius, style]);

  const containerStyle = useMemo(() => [
    styles.container,
    {
      width,
      height,
      borderRadius,
      backgroundColor: colors.backgroundSecondary,
    },
  ], [width, height, borderRadius, colors.backgroundSecondary]);

  if (hasError) {
    return (
      <View style={containerStyle}>
        <View style={styles.errorContainer}>
          {/* You can add an error icon here */}
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {isLoading && (
        <SkeletonLoader
          width={width}
          height={height}
          borderRadius={borderRadius}
          style={styles.skeleton}
        />
      )}
      
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={imageSource}
          style={imageStyle}
          contentFit={resizeMode}
          placeholder={placeholder || blurhash}
          priority={priority}
          cachePolicy={cachePolicy}
          onLoad={handleLoad}
          onError={handleError}
          transition={300}
        />
      </Animated.View>
    </View>
  );
};

interface AvatarImageProps {
  uri?: string;
  name: string;
  size?: number;
  style?: any;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  uri,
  name,
  size = 40,
  style,
}) => {
  const { colors } = useTheme();
  
  const initials = useMemo(() => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [name]);

  const avatarStyle = useMemo(() => [
    styles.avatar,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.primary,
    },
    style,
  ], [size, colors.primary, style]);

  if (!uri) {
    return (
      <View style={avatarStyle}>
        <Text style={[styles.initials, { fontSize: size * 0.4, color: colors.white }]}>
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <OptimizedImage
      source={{ uri }}
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
      priority="high"
      placeholder={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=${colors.primary.slice(1)}&color=fff`}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
});