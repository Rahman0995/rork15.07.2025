import { createTRPCReact } from "@trpc/react-query";
import { httpLink, createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "../../../backend/trpc/app-router";
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

// Create vanilla tRPC client for use outside React components
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        console.log('tRPC request to:', url);
        // Handle network errors gracefully
        return fetch(url, options).catch((error) => {
          console.warn('tRPC fetch failed:', error);
          // Return a mock response for development
          return new Response(JSON.stringify({ 
            error: 'Backend not available',
            message: error.message,
            url: url
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

// Create tRPC React client for use in React components
export const createTRPCReactClient = () => {
  return trpc.createClient({
    links: [
      httpLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        fetch: (url, options) => {
          console.log('tRPC request to:', url);
          // Handle network errors gracefully
          return fetch(url, options).catch((error) => {
            console.warn('tRPC fetch failed:', error);
            // Return a mock response for development
            return new Response(JSON.stringify({ 
              error: 'Backend not available',
              message: error.message,
              url: url
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
};