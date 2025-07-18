import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink, createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "../backend/trpc/app-router";
import superjson from "superjson";
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Create tRPC React hooks with proper typing
export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // First try to get from expo-constants configuration
  const config = Constants.expoConfig?.extra;
  if (config?.backendConfig?.baseUrl) {
    console.log('Using baseUrl from config:', config.backendConfig.baseUrl);
    return config.backendConfig.baseUrl;
  }

  // Fallback to environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using baseUrl from env:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Platform-specific fallbacks
  if (Platform.OS === 'web') {
    console.log('Using web fallback: http://localhost:3000');
    return "http://localhost:3000";
  } else {
    // For mobile, try to use the local IP from environment
    const localIP = process.env.LOCAL_IP || '192.168.1.100';
    const mobileUrl = `http://${localIP}:3000`;
    console.log('Using mobile fallback:', mobileUrl);
    return mobileUrl;
  }
};

const getApiConfig = () => {
  const config = Constants.expoConfig?.extra;
  const apiConfig = {
    baseUrl: getBaseUrl(),
    timeout: config?.backendConfig?.timeout || 30000,
    retries: config?.backendConfig?.retries || 3,
    enableDebugMode: config?.enableDebugMode || __DEV__,
    enableMockData: config?.backendConfig?.enableMockData || __DEV__
  };
  
  console.log('API Configuration:', apiConfig);
  return apiConfig;
};

const apiConfig = getApiConfig();

// Create vanilla tRPC client for use outside React components
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    ...(apiConfig.enableDebugMode ? [loggerLink()] : []),
    httpBatchLink({
      url: `${apiConfig.baseUrl}/api/trpc`,
      transformer: superjson,
      
      // Custom fetch with comprehensive error handling
      fetch: async (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
        
        try {
          console.log(`Making tRPC request to: ${url}`);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error(`HTTP ${response.status}: ${response.statusText}`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          console.log(`tRPC request successful: ${response.status}`);
          return response;
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          console.error('tRPC fetch failed:', {
            url,
            error: error.message,
            name: error.name,
            stack: error.stack
          });
          
          // Enhanced mock responses for development
          if (apiConfig.enableMockData && typeof url === 'string') {
            console.log('Providing mock response for:', url);
            
            // Mock responses for different endpoints
            if (url.includes('example.hi')) {
              return new Response(JSON.stringify({
                result: {
                  data: {
                    json: {
                      message: 'Hello from mock backend! (Network unavailable)',
                      timestamp: new Date().toISOString(),
                      mock: true
                    }
                  }
                }
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // Generic mock response for other endpoints
            return new Response(JSON.stringify({
              result: {
                data: {
                  json: {
                    message: 'Mock data - backend unavailable',
                    timestamp: new Date().toISOString(),
                    mock: true
                  }
                }
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Re-throw the original error if not in mock mode
          throw error;
        }
      },
    }),
  ],
});

// Legacy alias for backward compatibility
export const vanillaTrpcClient = trpcClient;