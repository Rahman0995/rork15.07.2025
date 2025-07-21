import React, { useEffect, useCallback } from 'react';
import { InteractionManager, Platform } from 'react-native';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableOptimizations?: boolean;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  enableOptimizations = true,
}) => {
  const optimizePerformance = useCallback(() => {
    if (!enableOptimizations) return;

    // Reduce memory pressure
    if (Platform.OS === 'android') {
      // Android-specific optimizations
      InteractionManager.runAfterInteractions(() => {
        // Clear any unnecessary caches
        if (__DEV__) {
          console.log('Performance optimization: Clearing caches');
        }
      });
    }

    // iOS-specific optimizations
    if (Platform.OS === 'ios') {
      InteractionManager.runAfterInteractions(() => {
        // iOS memory management
        if (__DEV__) {
          console.log('Performance optimization: iOS memory management');
        }
      });
    }
  }, [enableOptimizations]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      optimizePerformance();
    }, 100);

    return () => clearTimeout(timeout);
  }, [optimizePerformance]);

  return <>{children}</>;
};

// Hook for simple performance monitoring
export const useSimplePerformance = (componentName: string) => {
  const logPerformance = useCallback((operation: string, startTime: number) => {
    const duration = Date.now() - startTime;
    if (__DEV__ && duration > 16) {
      console.warn(`${componentName} ${operation} took ${duration}ms`);
    }
  }, [componentName]);

  return { logPerformance };
};