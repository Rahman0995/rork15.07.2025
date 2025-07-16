const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PREVIEW = process.env.EAS_BUILD_PROFILE === 'preview';

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
        NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs location access for location-based features'
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
        'android.permission.VIBRATE'
      ]
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
          defaultChannel: 'default',
          sounds: ['./assets/notification.wav']
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
      apiUrl: IS_DEV 
        ? 'http://localhost:3000/api' 
        : 'https://your-production-api.com/api',
      enableDebugMode: IS_DEV,
      enableAnalytics: !IS_DEV,
      // Backend API endpoints configuration
      backendConfig: {
        baseUrl: IS_DEV 
          ? 'http://localhost:3000' 
          : 'https://your-production-domain.com',
        trpcEndpoint: '/api/trpc',
        timeout: 10000,
        retries: 3
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