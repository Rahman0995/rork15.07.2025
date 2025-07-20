export default {
  expo: {
    name: 'Military Unit Management',
    slug: 'military-unit-management-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
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
      'expo-web-browser'
    ],
    extra: {
      // Production API URL - update this with your actual backend URL
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
      backendConfig: {
        baseUrl: process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000',
        trpcEndpoint: '/api/trpc',
        timeout: 30000,
        retries: 3,
        enableMockData: true,
        enableOfflineMode: true
      }
    }
  }
};