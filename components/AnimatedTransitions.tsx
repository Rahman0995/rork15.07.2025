import React, { useRef, useEffect } from 'react';
import { Animated, Easing, Platform } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 300,
  style 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, delay, duration]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  style?: any;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = 'up',
  delay = 0, 
  duration = 400,
  distance = 50,
  style 
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration * 0.8,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, delay, duration, distance]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'left':
        return [{ translateX: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'right':
        return [{ translateX: slideAnim }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View 
      style={[
        { 
          opacity: fadeAnim,
          transform: getTransform(),
        }, 
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
  style?: any;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0, 
  duration = 300,
  initialScale = 0.8,
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration * 0.8,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim, delay, duration, initialScale]);

  return (
    <Animated.View 
      style={[
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }, 
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  itemDuration?: number;
  style?: any;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({ 
  children, 
  staggerDelay = 100,
  itemDuration = 300,
  style 
}) => {
  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child, index) => (
        <SlideIn 
          key={index}
          delay={index * staggerDelay}
          duration={itemDuration}
          direction="up"
        >
          {child}
        </SlideIn>
      ))}
    </Animated.View>
  );
};

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  scaleValue?: number;
  style?: any;
  disabled?: boolean;
}

export const PressableScale: React.FC<PressableScaleProps> = ({ 
  children, 
  onPress,
  scaleValue = 0.95,
  style,
  disabled = false
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: scaleAnim }] }, 
        style
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <Animated.View
        style={{ opacity: disabled ? 0.6 : 1 }}
        onTouchEnd={onPress}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};

// Hook for creating reusable animations
export const useSpringAnimation = (initialValue: number = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const springTo = (toValue: number, config?: Partial<Animated.SpringAnimationConfig>) => {
    return Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
      ...config,
    });
  };

  const timingTo = (toValue: number, config?: Partial<Animated.TimingAnimationConfig>) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
      ...config,
    });
  };

  return {
    animatedValue,
    springTo,
    timingTo,
  };
};

// Performance optimized list item animation
export const useListItemAnimation = (index: number) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 50; // Stagger by 50ms
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };
};