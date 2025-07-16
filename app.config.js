const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PREVIEW = process.env.EAS_BUILD_PROFILE === 'preview';

// ВАЖНО: Замените на ваш реальный IP адрес
// Найдите ваш IP: ipconfig (Windows) или ifconfig (Mac/Linux)
const YOUR_IP_ADDRESS = '192.168.1.74'; // ЗАМЕНИТЕ НА ВАШ IP

const getApiUrl = () => {
if (IS_DEV) {
  return `http://${YOUR_IP_ADDRESS}:3000/api`;
}
return 'https://your-production-api.com/api'; // Замените на ваш production URL
};

const getBaseUrl = () => {
if (IS_DEV) {
  return `http://${YOUR_IP_ADDRESS}:3000`;
}
return 'https://your-production-domain.com'; // Замените на ваш production URL
};

export default {
expo: {
  name: IS_DEV ? 'Military Unit Management (Dev)' : 'Military Unit Management Application',
  slug: 'military-unit-management-application',
  version: '1.0.0',
  projectId: '0bffb82a-ba27-4f8f-889a-624d89941f86',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  platforms: ['ios', 'android', 'web'],
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV 
      ? 'app.rork.militaryunitmanagement.dev' 
      : 'app.rork.militaryunitmanagement',
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSCameraUsageDescription: 'This app needs access to camera to take photos for reports',
      NSMicrophoneUsageDescription: 'This app needs access to microphone for voice recordings',
      NSPhotoLibraryUsageDescription: 'This app needs access to photo library to select images',
      NSLocationWhenInUseUsageDescription: 'This app needs location access for location-based features',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs location access for location-based features',
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: IS_DEV, // Только для разработки
        NSExceptionDomains: {
          'localhost': {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSExceptionMinimumTLSVersion: '1.0',
            NSIncludesSubdomains: true
          },
          [YOUR_IP_ADDRESS]: {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSExceptionMinimumTLSVersion: '1.0',
            NSIncludesSubdomains: true
          }
        }
      }
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: IS_DEV 
      ? 'app.rork.militaryunitmanagement.dev' 
      : 'app.rork.militaryunitmanagement',
    googleServicesFile: './google-services.json',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.VIBRATE',
      'android.permission.ACCESS_WIFI_STATE'
    ],
    usesCleartextTraffic: IS_DEV // Разрешает HTTP в dev режиме
  },
  web: {
    favicon: './assets/images/favicon.png',
    bundler: 'metro'
  },
  plugins: [
    'expo-localization',
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#ffffff',
        defaultChannel: 'default'
      }
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera to take photos for reports and documentation',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone for voice recordings and video capture',
        recordAudioAndroid: true
      }
    ],
    [
      'expo-media-library',
      {
        photosPermission: 'Allow $(PRODUCT_NAME) to access your photos to attach images to reports',
        savePhotosPermission: 'Allow $(PRODUCT_NAME) to save photos from reports and documentation',
        isAccessMediaLocationEnabled: true
      }
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location for location-based features and reporting',
        locationAlwaysPermission: 'Allow $(PRODUCT_NAME) to use your location for location-based features and reporting',
        locationWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location for location-based features and reporting',
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false
      }
    ],
    [
      'expo-file-system',
      {
        requestLegacyExternalStorage: true
      }
    ],
    [
      'expo-av',
      {
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone for voice recordings'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: '0bffb82a-ba27-4f8f-889a-624d89941f86'
    },
    // Environment-specific configuration
    apiUrl: getApiUrl(),
    enableDebugMode: IS_DEV,
    enableAnalytics: !IS_DEV,
    // Backend API endpoints configuration
    backendConfig: {
      baseUrl: getBaseUrl(),
      trpcEndpoint: '/api/trpc',
      timeout: 30000, // Увеличен timeout для медленных соединений
      retries: 3,
      enableMockData: IS_DEV, // Включаем mock данные только в dev
      enableOfflineMode: true
    },
    // Дополнительные настройки для production
    security: {
      enableSSL: !IS_DEV,
      apiKeyRequired: !IS_DEV
    },
    // Feature flags
    features: {
      pushNotifications: true,
      backgroundSync: true,
      offlineStorage: true,
      biometricAuth: false
    }
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  },
  updates: {
    url: 'https://u.expo.dev/0bffb82a-ba27-4f8f-889a-624d89941f86'
  }
}
};