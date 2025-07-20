import Constants from 'expo-constants';

export interface AppConfig {
  apiUrl: string;
  enableDebugMode: boolean;
  enableAnalytics: boolean;
  backendConfig: {
    baseUrl: string;
    trpcEndpoint: string;
    timeout: number;
    retries: number;
  };
}

export const getAppConfig = (): AppConfig => {
  const config = Constants.expoConfig?.extra;
  
  if (!config) {
    console.warn('No extra config found in Constants.expoConfig, using defaults');
    return getDefaultConfig();
  }

  return {
    apiUrl: config.apiUrl || 'http://localhost:3000/api',
    enableDebugMode: config.enableDebugMode || false,
    enableAnalytics: config.enableAnalytics || false,
    backendConfig: {
      baseUrl: config.backendConfig?.baseUrl || 'http://localhost:3000',
      trpcEndpoint: config.backendConfig?.trpcEndpoint || '/api/trpc',
      timeout: config.backendConfig?.timeout || 10000,
      retries: config.backendConfig?.retries || 3,
    }
  };
};

const getDefaultConfig = (): AppConfig => {
  // Use different defaults for development vs production
  const isDev = __DEV__;
  
  return {
    apiUrl: isDev ? 'http://localhost:3000/api' : 'https://your-production-domain.com/api',
    enableDebugMode: isDev,
    enableAnalytics: !isDev,
    backendConfig: {
      baseUrl: isDev ? 'http://localhost:3000' : 'https://your-production-domain.com',
      trpcEndpoint: '/api/trpc',
      timeout: isDev ? 10000 : 30000, // Увеличенный timeout для production
      retries: isDev ? 3 : 5, // Больше попыток для production
    }
  };
};

// Convenience functions
export const getApiUrl = () => getAppConfig().apiUrl;
export const getBackendConfig = () => getAppConfig().backendConfig;
export const isDebugMode = () => getAppConfig().enableDebugMode;
export const isAnalyticsEnabled = () => getAppConfig().enableAnalytics;

// Log configuration on app start (only in debug mode)
if (getAppConfig().enableDebugMode) {
  console.log('App Configuration:', getAppConfig());
}