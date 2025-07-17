import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Customize the Metro configuration to fix bundling issues
config.resolver = {
  ...config.resolver,
  // Block problematic paths that might cause circular dependencies
  blockList: [
    // Block any nested duplicate directories
    /.*\/home\/user\/rork-app\/home\/.*/,
    // Block node_modules in nested directories
    /.*\/home\/user\/rork-app\/.*\/node_modules\/.*/,
  ],
  platforms: ['ios', 'android', 'native', 'web'],
};

// Ensure we're only watching the root directory
config.watchFolders = [
  path.resolve(__dirname),
];

export default config;