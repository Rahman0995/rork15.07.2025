// Упрощенная конфигурация для веб-сборки на Render
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
      'expo-router'
    ],
    extra: {
      // Environment-specific configuration
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://military-app-backend.onrender.com/api',
      // Backend API endpoints configuration
      backendConfig: {
        baseUrl: process.env.EXPO_PUBLIC_BASE_URL || 'https://military-app-backend.onrender.com',
        trpcEndpoint: '/api/trpc',
        timeout: 30000,
        retries: 3,
        enableMockData: true,
        enableOfflineMode: true
      },
      // Feature flags для веба
      features: {
        pushNotifications: false, // Отключаем для веба
        backgroundSync: false,    // Отключаем для веба
        offlineStorage: true,
        biometricAuth: false
      }
    },
    runtimeVersion: {
      policy: 'sdkVersion'
    }
  }
};