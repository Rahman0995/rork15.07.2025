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
  // Block specific files that contain import.meta
  /.*node_modules\/@trpc\/server\/.*\.js$/,
  /.*node_modules\/@trpc\/server\/.*\.mjs$/,
  /.*node_modules\/.*\/dist\/.*import.*meta.*\.js$/,
  /.*node_modules\/.*\/esm\/.*import.*meta.*\.js$/,
  // Block other problematic ESM files
  /.*node_modules\/.*\/dist\/index\.mjs$/,
  /.*node_modules\/.*\/esm\/index\.mjs$/,
];

config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];

// Add web-specific alias if needed
if (process.env.EXPO_PLATFORM === 'web') {
  if (!config.resolver.alias) {
    config.resolver.alias = {};
  }
  config.resolver.alias = {
    ...config.resolver.alias,
    'react-native': 'react-native-web',
  };
}

// Set watch folders
config.watchFolders = [path.resolve(__dirname)];

// Configure transformer
if (!config.transformer) {
  config.transformer = {};
}

config.transformer.minifierConfig = {
  // Disable minification that might cause issues with import.meta transformation
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Configure transformer to handle problematic syntax
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Add resolver configuration for better module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block @trpc/server imports on client side
  if (moduleName === '@trpc/server' || moduleName.startsWith('@trpc/server/')) {
    return {
      type: 'empty',
    };
  }
  
  // Use default resolver for other modules
  return context.resolveRequest(context, moduleName, platform);
};

export default config;