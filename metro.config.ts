import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Ensure resolver exists
if (!config.resolver) {
  config.resolver = {};
}

// Customize the Metro configuration to fix bundling issues
config.resolver.blockList = [
  // Block any nested duplicate directories
  /.*\/home\/user\/rork-app\/home\/.*/,
  // Block node_modules in nested directories
  /.*\/home\/user\/rork-app\/.*\/node_modules\/.*/,
  // Block duplicate app directories
  /.*\/home\/user\/rork-app\/.*\/app\/.*/,
  // Block backend directory from mobile builds (Node.js specific code)
  /.*\/backend\/.*/,
  // Block any server-side files that might use import.meta or Node.js APIs
  /.*\.server\.(js|ts|jsx|tsx)$/,
  /.*\/server\/.*/,
];

config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];

if (process.env.EXPO_PLATFORM === 'web') {
  if (!config.resolver.alias) {
    config.resolver.alias = {};
  }
  config.resolver.alias['react-native'] = 'react-native-web';
}

config.watchFolders = [path.resolve(__dirname)];

export default config;