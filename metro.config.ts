import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Extend the default config with custom settings
const resolverConfig = {
  ...config.resolver,
  blockList: [
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
  ],
  platforms: ['ios', 'android', 'native', 'web'],
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  assetExts: config.resolver?.assetExts || ['png', 'jpg', 'jpeg', 'gif', 'svg'],
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// Add alias for web platform
if (process.env.EXPO_PLATFORM === 'web') {
  (resolverConfig as any).alias = {
    'react-native': 'react-native-web',
  };
}

// Add custom resolve request handler
const originalResolveRequest = config.resolver?.resolveRequest;
(resolverConfig as any).resolveRequest = (context: any, moduleName: string, platform: string | null) => {
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

// Create transformer config
const transformerConfig = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  transformVariants: {},
  workerPath: config.transformer?.workerPath || require.resolve('metro/src/DeltaBundler/Worker'),
};

// Add minifier config if it exists
if (config.transformer?.minifierConfig) {
  (transformerConfig as any).minifierConfig = {
    ...config.transformer.minifierConfig,
    // Disable minification that might cause issues with import.meta transformation
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  };
}

// Apply the configurations
(config as any).resolver = resolverConfig;
(config as any).transformer = transformerConfig;

// Optimize watch folders to reduce file watcher usage
config.watchFolders = [path.resolve(__dirname)];

// Add watcher config to reduce file system load
(config as any).watcher = {
  additionalExts: ['ts', 'tsx'],
  watchman: {
    defer_states: ['hg.update'],
  },
  healthCheck: {
    enabled: true,
    filePrefix: '.metro-health-check',
    timeout: 30000,
    interval: 30000,
  },
};

// Reduce the number of files being watched
(config as any).maxWorkers = 2;

export default config;