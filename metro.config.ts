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
  ];

  config.resolver.platforms = ['ios', 'android', 'native', 'web'];
}

// Ensure we're only watching the root directory
config.watchFolders = [
  path.resolve(__dirname),
];

export default config;