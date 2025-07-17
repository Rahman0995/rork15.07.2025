import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Customize the Metro configuration to fix bundling issues
const resolverConfig = {
  ...config.resolver,
  blockList: [
    // Block any nested duplicate directories
    /.*\/home\/user\/rork-app\/home\/.*/,
    // Block node_modules in nested directories
    /.*\/home\/user\/rork-app\/.*\/node_modules\/.*/,
    // Block duplicate app directories
    /.*\/home\/user\/rork-app\/.*\/app\/.*/,
  ],
  platforms: ['ios', 'android', 'native', 'web'],
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
};

// Web-specific optimizations
if (process.env.EXPO_PLATFORM === 'web') {
  resolverConfig.alias = {
    'react-native': 'react-native-web',
  };
}

// Apply the resolver configuration
Object.assign(config, {
  resolver: resolverConfig,
  watchFolders: [path.resolve(__dirname)],
});

export default config;