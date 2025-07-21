import { Platform } from 'react-native';

export const isWebPlatform = Platform.OS === 'web';

export const optimizeForWeb = <T>(webValue: T, nativeValue: T): T => {
  return isWebPlatform ? webValue : nativeValue;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const measurePerformance = (name: string, fn: () => void) => {
  if (__DEV__) {
    const start = Date.now();
    fn();
    const end = Date.now();
    console.log(`${name} took ${end - start}ms`);
  } else {
    fn();
  }
};