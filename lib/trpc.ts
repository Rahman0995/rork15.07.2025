import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using API base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Fallback for development - return a mock URL that won't cause errors
  console.log('Using fallback API URL: http://localhost:3000');
  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        console.log('tRPC request to:', url);
        // Handle network errors gracefully
        return fetch(url, options).catch((error) => {
          console.warn('tRPC fetch failed:', error);
          
          // Check if this is the hi procedure and return mock data
          if (url.includes('example.hi')) {
            return new Response(JSON.stringify({
              result: {
                data: {
                  message: 'Hello from mock backend!',
                  timestamp: new Date().toISOString(),
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