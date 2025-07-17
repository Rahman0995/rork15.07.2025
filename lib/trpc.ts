import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from 'expo-constants';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // First try to get from expo-constants configuration
  const config = Constants.expoConfig?.extra;
  if (config?.backendConfig?.baseUrl) {
    return config.backendConfig.baseUrl;
  }

  // Fallback to environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Final fallback for development
  return "http://localhost:3000";
};

const getApiConfig = () => {
  const config = Constants.expoConfig?.extra;
  return {
    baseUrl: getBaseUrl(),
    timeout: config?.backendConfig?.timeout || 30000,
    retries: config?.backendConfig?.retries || 3,
    enableDebugMode: config?.enableDebugMode || __DEV__
  };
};

const apiConfig = getApiConfig();

// Create tRPC client for React components
export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    // Logger link for development
    ...(apiConfig.enableDebugMode ? [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      })
    ] : []),
    
    // HTTP batch link for better performance
    httpBatchLink({
      url: `${apiConfig.baseUrl}/api/trpc`,
      
      // Custom fetch with error handling
      fetch: async (url, options) => {
        try {
          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(apiConfig.timeout),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.warn('tRPC fetch failed:', error);
          
          // For development, provide mock responses for specific endpoints
          if (apiConfig.enableDebugMode && typeof url === 'string') {
            if (url.includes('example.hi')) {
              return new Response(JSON.stringify({
                result: {
                  data: {
                    json: {
                      message: 'Hello from mock backend!',
                      timestamp: new Date().toISOString(),
                    }
                  }
                }
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
          
          throw error;
        }
      },
      
      // Request headers
      headers: () => ({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }),
    }),
  ],
});

// Create vanilla tRPC client for use outside React components
import { createTRPCProxyClient } from '@trpc/client';

export const vanillaTrpcClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${apiConfig.baseUrl}/api/trpc`,
      headers: () => ({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }),
    }),
  ],
});