import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Customize the Metro configuration to fix bundling issues
if (config.resolver) {
  config.resolver.blockList = [
    // Block any nested duplicate directories
    /.*\/home\/user\/rork-app\/home\/.*/,
    // Block node_modules in nested directories
    /.*\/home\/user\/rork-app\/.*\/node_modules\/.*/,
    // Block duplicate app directories
    /.*\/home\/user\/rork-app\/.*\/app\/.*/,
  ];

  config.resolver.platforms = ['ios', 'android', 'native', 'web'];
  
  // Ensure proper resolution order
  config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];
}

// Ensure we're only watching the root directory
config.watchFolders = [
  path.resolve(__dirname),
];

// Web-specific optimizations
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.alias = {
    'react-native

export default config;: 'react-native-web',
  };
}

export default config;