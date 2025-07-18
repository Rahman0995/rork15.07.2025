import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Extend the default config with custom settings
if (config.resolver) {
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
  config.resolver.assetExts = config.resolver.assetExts || ['png', 'jpg', 'jpeg', 'gif', 'svg'];
  config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

  if (process.env.EXPO_PLATFORM === 'web') {
    // Create a new resolver config with alias
    config.resolver = {
      ...config.resolver,
      alias: {
        'react-native': 'react-native-web',
      },
    };
  }

  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context: any, moduleName: string, platform: string | null) => {
    // Block @trpc/server imports on client side
    if (moduleName === '@trpc/server' || moduleName.startsWith('@trpc/server/')) {
      return {
        type: 'empty',
      };
    }
    
    // Use default resolver for other modules
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

if (config.transformer) {
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });

  config.transformer.transformVariants = {};
  config.transformer.workerPath = config.transformer.workerPath || require.resolve('metro/src/DeltaBundler/Worker');

  // Create a new transformer config with minifierConfig
  if (config.transformer.minifierConfig) {
    config.transformer = {
      ...config.transformer,
      minifierConfig: {
        ...config.transformer.minifierConfig,
        // Disable minification that might cause issues with import.meta transformation
        keep_fnames: true,
        mangle: {
          keep_fnames: true,
        },
      },
    };
  }
}

config.watchFolders = [path.resolve(__dirname)];

export default config;