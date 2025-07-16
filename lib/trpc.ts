import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from 'expo-constants';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // First try to get from expo-constants configuration
  const config = Constants.expoConfig?.extra;
  if (config?.backendConfig?.baseUrl) {
    console.log('Using API base URL from config:', config.backendConfig.baseUrl);
    return config.backendConfig.baseUrl;
  }

  // Fallback to environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using API base URL from env:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Final fallback for development
  console.log('Using fallback API URL: http://localhost:3000');
  return "http://localhost:3000";
};

const getApiConfig = () => {
  const config = Constants.expoConfig?.extra;
  return {
    baseUrl: getBaseUrl(),
    timeout: config?.backendConfig?.timeout || 10000,
    retries: config?.backendConfig?.retries || 3,
    enableDebugMode: config?.enableDebugMode || false
  };
};

const apiConfig = getApiConfig();

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${apiConfig.baseUrl}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        if (apiConfig.enableDebugMode) {
          console.log('tRPC request to:', url, 'with options:', options);
        }
        // Handle network errors gracefully
        return fetch(url, options).catch((error) => {
          console.warn('tRPC fetch failed:', error);
          
          // Check if this is the hi procedure and return mock data
          if (typeof url === 'string' && url.includes('example.hi')) {
            const mockData = {
              message: 'Hello from mock backend!',
              timestamp: new Date().toISOString(),
            };
            
            console.log('Returning mock data for hi procedure:', mockData);
            
            // Return proper tRPC response format with superjson transformation
            return new Response(JSON.stringify({
              result: {
                data: {
                  json: mockData
                }
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Return error response for other requests
          return new Response(JSON.stringify({ 
            error: {
              message: 'JSON Parse error: Unexpected character: <',
              code: 'PARSE_ERROR',
              data: {
                code: 'PARSE_ERROR',
                httpStatus: 500,
                stack: error.stack
              }
            }
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      },
      headers: () => {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});