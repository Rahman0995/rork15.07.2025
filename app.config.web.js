// Упрощенная конфигурация для веб-сборки
const IS_DEV = process.env.NODE_ENV === 'development';

const getApiUrl = () => {
  if (IS_DEV) {
    return 'http://localhost:3000/api';
  }
  return process.env.EXPO_PUBLIC_API_URL || 'https://military-app-backend.render.com/api';
};

const getBaseUrl = () => {
  if (IS_DEV) {
    return 'http://localhost:3000';
  }
  return process.env.EXPO_PUBLIC_BASE_URL || 'https://military-app-backend.render.com';
};

export default {
  expo: {
    name: 'Military Unit Management',
    slug: 'military-unit-management-application',
    version: '1.0.7',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    platforms: ['web'],
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro'
    },
    plugins: [
      'expo-font',
      'expo-web-browser',
      'expo-localization'
    ],
    extra: {
      // Environment-specific configuration
      apiUrl: getApiUrl(),
      enableDebugMode: IS_DEV,
      enableAnalytics: !IS_DEV,
      // Backend API endpoints configuration
      backendConfig: {
        baseUrl: getBaseUrl(),
        trpcEndpoint: '/api/trpc',
        timeout: 30000,
        retries: 3,
        enableMockData: true,
        enableOfflineMode: true,
        fallbackUrls: [
          'http://localhost:3000',
          'https://military-app-backend.render.com'
        ]
      },
      // Feature flags для веб-версии
      features: {
        pushNotifications: false, // Отключено для веб
        backgroundSync: false,    // Отключено для веб
        offlineStorage: true,
        biometricAuth: false
      }
    },
    runtimeVersion: {
      policy: 'sdkVersion'
    }
  }
};