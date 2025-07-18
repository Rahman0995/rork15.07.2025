import { getDefaultConfig } from 'expo/metro-config';
import { MetroConfig } from '@expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

// Create a new configuration object to avoid read-only property issues
const customConfig: MetroConfig = {
  ...config,
  resolver: {
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
    resolverMainFields: ['react-native', 'browser', 'main'],
    ...(process.env.EXPO_PLATFORM === 'web' && {
      alias: {
        'react-native': 'react-native-web',
      }
    }),
    resolveRequest: (context: any, moduleName: string, platform: string) => {
      // Block @trpc/server imports on client side
      if (moduleName === '@trpc/server' || moduleName.startsWith('@trpc/server/')) {
        return {
          type: 'empty',
        };
      }
      
      // Use default resolver for other modules
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  transformer: {
    ...config.transformer,
    ...(config.transformer?.minifierConfig && {
      minifierConfig: {
        ...config.transformer.minifierConfig,
        // Disable minification that might cause issues with import.meta transformation
        keep_fnames: true,
        mangle: {
          keep_fnames: true,
        },
      }
    }),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  watchFolders: [path.resolve(__dirname)],
};

export default customConfig;