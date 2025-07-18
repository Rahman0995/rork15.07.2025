import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Customize the Metro configuration to fix bundling issues
const resolver = config.resolver || {};

resolver.blockList = [
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

resolver.platforms = ['ios', 'android', 'native', 'web'];
resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];

if (process.env.EXPO_PLATFORM === 'web') {
  const alias = resolver.alias || {};
  alias['react-native'] = 'react-native-web';
  resolver.alias = alias;
}

config.resolver = resolver;
config.watchFolders = [path.resolve(__dirname)];

export default config;