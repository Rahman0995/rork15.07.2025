import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';

// Hook for deferring expensive operations until after interactions
export const useDeferredValue = <T>(value: T, delay: number = 0): T => {
  const [deferredValue, setDeferredValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        setDeferredValue(value);
      });
    }, delay) as any;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return deferredValue;
};

// Hook for throttling expensive operations
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Hook for debouncing operations
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay) as any;
    }) as T,
    [callback, delay]
  );
};

// Hook for managing component mounting state
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

// Hook for optimizing list rendering
export const useListOptimization = <T>(
  data: T[],
  itemHeight?: number
) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number) => {
      if (!itemHeight) return { length: 0, offset: 0, index };
      
      return {
        length: itemHeight,
        offset: itemHeight * index,
        index,
      };
    },
    [itemHeight]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        const start = Math.max(0, viewableItems[0].index - 5);
        const end = Math.min(data.length, viewableItems[viewableItems.length - 1].index + 5);
        setVisibleRange({ start, end });
      }
    },
    [data.length]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  };

  return {
    getItemLayout: itemHeight ? getItemLayout : undefined,
    onViewableItemsChanged,
    viewabilityConfig,
    visibleRange,
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    windowSize: 10,
    removeClippedSubviews: Platform.OS === 'android',
  };
};

// Hook for managing memory usage
export const useMemoryOptimization = () => {
  const [memoryWarning, setMemoryWarning] = useState(false);

  useEffect(() => {
    // Monitor memory usage (iOS only)
    if (Platform.OS === 'ios') {
      const handleMemoryWarning = () => {
        setMemoryWarning(true);
        // Clear caches, reduce quality, etc.
        setTimeout(() => setMemoryWarning(false), 5000);
      };

      // Note: This is a simplified example
      // In a real app, you'd use native modules to monitor memory
    }
  }, []);

  const clearCache = useCallback(() => {
    // Implement cache clearing logic
    if (__DEV__) {
      console.log('Clearing cache due to memory pressure');
    }
  }, []);

  return {
    memoryWarning,
    clearCache,
  };
};

// Hook for optimizing animations
export const useAnimationOptimization = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check system accessibility settings
    // This would typically come from a native module
    // For now, we'll use a simple heuristic
    const checkReduceMotion = () => {
      // In a real app, you'd check system settings
      setReduceMotion(false);
    };

    checkReduceMotion();
  }, []);

  const getAnimationConfig = useCallback((defaultDuration: number) => {
    return {
      duration: reduceMotion ? 0 : defaultDuration,
      useNativeDriver: true,
    };
  }, [reduceMotion]);

  return {
    reduceMotion,
    getAnimationConfig,
  };
};

// Hook for batch operations
export const useBatchOperations = <T>(
  batchSize: number = 10,
  delay: number = 16 // ~60fps
) => {
  const [queue, setQueue] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const addToQueue = useCallback((items: T | T[]) => {
    const itemsArray = Array.isArray(items) ? items : [items];
    setQueue(prev => [...prev, ...itemsArray]);
  }, []);

  const processBatch = useCallback(
    async (processor: (batch: T[]) => Promise<void> | void) => {
      if (processingRef.current || queue.length === 0) return;

      processingRef.current = true;
      setIsProcessing(true);

      try {
        while (queue.length > 0) {
          const batch = queue.splice(0, batchSize);
          await processor(batch);
          
          // Allow other operations to run
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
        setQueue([]);
      }
    },
    [queue, batchSize, delay]
  );

  return {
    queue,
    isProcessing,
    addToQueue,
    processBatch,
    queueLength: queue.length,
  };
};

// Hook for component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    
    if (__DEV__) {
      const renderTime = Date.now() - startTime.current;
      if (renderTime > 16) { // More than one frame
        console.warn(`${componentName} render took ${renderTime}ms (render #${renderCount.current})`);
      }
    }
    
    startTime.current = Date.now();
  });

  const logPerformance = useCallback((operation: string, duration: number) => {
    if (__DEV__ && duration > 16) {
      console.warn(`${componentName} ${operation} took ${duration}ms`);
    }
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    logPerformance,
  };
};