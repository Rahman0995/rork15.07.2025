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

const getDefaultConfig = (): AppConfig => ({
  apiUrl: 'http://localhost:3000/api',
  enableDebugMode: true,
  enableAnalytics: false,
  backendConfig: {
    baseUrl: 'http://localhost:3000',
    trpcEndpoint: '/api/trpc',
    timeout: 10000,
    retries: 3,
  }
});

// Convenience functions
export const getApiUrl = () => getAppConfig().apiUrl;
export const getBackendConfig = () => getAppConfig().backendConfig;
export const isDebugMode = () => getAppConfig().enableDebugMode;
export const isAnalyticsEnabled = () => getAppConfig().enableAnalytics;

// Log configuration on app start (only in debug mode)
if (getAppConfig().enableDebugMode) {
  console.log('App Configuration:', getAppConfig());
}