import React, { useRef, useEffect, useState } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface PulseProps {
  children: React.ReactNode;
  pulseColor?: string;
  pulseSize?: number;
  duration?: number;
  style?: any;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  pulseColor,
  pulseSize = 1.2,
  duration = 1000,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: pulseSize,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [scaleAnim, opacityAnim, pulseSize, duration]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface RippleProps {
  children: React.ReactNode;
  onPress?: () => void;
  rippleColor?: string;
  rippleOpacity?: number;
  rippleDuration?: number;
  style?: any;
  disabled?: boolean;
}

export const Ripple: React.FC<RippleProps> = ({
  children,
  onPress,
  rippleColor,
  rippleOpacity = 0.3,
  rippleDuration = 300,
  style,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const nextRippleId = useRef(0);

  const handlePress = (event: any) => {
    if (disabled) return;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { locationX, locationY } = event.nativeEvent;
    const rippleId = nextRippleId.current++;

    setRipples(prev => [...prev, { id: rippleId, x: locationX, y: locationY }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
    }, rippleDuration);

    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.rippleContainer, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {children}
      {ripples.map(ripple => (
        <RippleEffect
          key={ripple.id}
          x={ripple.x}
          y={ripple.y}
          color={rippleColor || colors.primary}
          opacity={rippleOpacity}
          duration={rippleDuration}
        />
      ))}
    </TouchableOpacity>
  );
};

interface RippleEffectProps {
  x: number;
  y: number;
  color: string;
  opacity: number;
  duration: number;
}

const RippleEffect: React.FC<RippleEffectProps> = ({ x, y, color, opacity, duration }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: x - 50,
          top: y - 50,
          backgroundColor: color,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

interface ShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  intensity?: number;
  duration?: number;
  style?: any;
}

export const Shake: React.FC<ShakeProps> = ({
  children,
  trigger,
  intensity = 10,
  duration = 500,
  style,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      const shake = Animated.sequence([
        Animated.timing(shakeAnim, { toValue: intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]);

      shake.start();
    }
  }, [trigger, intensity, shakeAnim]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: shakeAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface FloatingProps {
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
  style?: any;
}

export const Floating: React.FC<FloatingProps> = ({
  children,
  intensity = 5,
  duration = 2000,
  style,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: intensity,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: -intensity,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    float.start();

    return () => float.stop();
  }, [floatAnim, intensity, duration]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  style?: any;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  backgroundColor,
  progressColor,
  animated = true,
  style,
}) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.progressContainer,
        {
          height,
          backgroundColor: backgroundColor || colors.borderLight,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressWidth,
            backgroundColor: progressColor || colors.primary,
          },
        ]}
      />
    </View>
  );
};

interface CounterProps {
  value: number;
  duration?: number;
  style?: any;
  textStyle?: any;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  value,
  duration = 1000,
  style,
  textStyle,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration, animatedValue]);

  return (
    <View style={style}>
      <Animated.Text style={textStyle}>
        {displayValue}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rippleContainer: {
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  progressContainer: {
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});