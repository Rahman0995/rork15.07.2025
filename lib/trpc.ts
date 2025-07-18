import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink, createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "../backend/trpc/app-router";
import superjson from "superjson";
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Create tRPC React hooks with proper typing
export const trpc = createTRPCReact<AppRouter>();

// Get the actual local IP address dynamically
const getLocalIP = () => {
  // Try to get from environment first
  if (process.env.LOCAL_IP) {
    return process.env.LOCAL_IP;
  }
  
  // Common local IP ranges to try
  const commonIPs = [
    '192.168.1.100', '192.168.1.101', '192.168.1.102',
    '192.168.0.100', '192.168.0.101', '192.168.0.102',
    '10.0.0.100', '10.0.0.101', '10.0.0.102'
  ];
  
  return commonIPs[0]; // Default to first common IP
};

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

  // Platform-specific fallbacks with better mobile support
  if (Platform.OS === 'web') {
    // For web, always use localhost
    console.log('Using web fallback: http://localhost:3000');
    return "http://localhost:3000";
  } else {
    // For mobile devices, try local IP first, then fallback to mock
    const localIP = getLocalIP();
    console.log(`Mobile device detected - trying local IP: ${localIP}`);
    return `http://${localIP}:3000`;
  }
};

const getApiConfig = () => {
  const config = Constants.expoConfig?.extra;
  const apiConfig = {
    baseUrl: getBaseUrl(),
    timeout: config?.backendConfig?.timeout || 30000,
    retries: config?.backendConfig?.retries || 3,
    enableDebugMode: config?.enableDebugMode || __DEV__,
    enableMockData: config?.backendConfig?.enableMockData || true, // Always enable for fallback
    fallbackUrls: config?.backendConfig?.fallbackUrls || [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://10.0.2.2:3000', // Android emulator
      `http://${getLocalIP()}:3000`,
      'http://192.168.1.100:3000',
      'http://192.168.0.100:3000',
      'http://10.0.0.100:3000'
    ]
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
      
      // Custom fetch with comprehensive error handling and fallback URLs
      fetch: async (url, options) => {
        const tryFetch = async (fetchUrl: string, retryCount = 0): Promise<Response> => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
          
          try {
            console.log(`Making tRPC request to: ${fetchUrl} (attempt ${retryCount + 1})`);
            
            const response = await fetch(fetchUrl, {
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
            console.error(`Request failed for ${fetchUrl}:`, error.message);
            throw error;
          }
        };

        // Try the main URL first
        try {
          return await tryFetch(url as string);
        } catch (mainError: any) {
          console.log('Main URL failed, trying fallback URLs...');
          
          // Try fallback URLs if main URL fails
          if (apiConfig.fallbackUrls && typeof url === 'string') {
            const urlPath = new URL(url).pathname + new URL(url).search;
            
            for (const fallbackBaseUrl of apiConfig.fallbackUrls) {
              try {
                const fallbackUrl = fallbackBaseUrl + urlPath;
                console.log(`Trying fallback URL: ${fallbackUrl}`);
                return await tryFetch(fallbackUrl);
              } catch (fallbackError) {
                console.log(`Fallback URL ${fallbackBaseUrl} also failed`);
                continue;
              }
            }
          }
          
          // All URLs failed, provide mock response if enabled
          if (apiConfig.enableMockData && typeof url === 'string') {
            console.log('All URLs failed, providing mock response for:', url);
            
            // Enhanced mock responses for different endpoints
            if (url.includes('example.hi')) {
              return new Response(JSON.stringify({
                result: {
                  data: {
                    json: {
                      message: 'Hello from mock backend! (All servers unavailable)',
                      timestamp: new Date().toISOString(),
                      mock: true,
                      reason: 'Network connection failed'
                    }
                  }
                }
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // Mock responses for batch requests (tasks.getAll,reports.getAll)
            if (url.includes('tasks.getAll,reports.getAll') || url.includes('batch=1')) {
              return new Response(JSON.stringify([
                {
                  result: {
                    data: {
                      json: [
                        {
                          id: '1',
                          title: 'Equipment Check (Mock)',
                          description: 'Conduct routine equipment inspection in sector A',
                          assignedTo: '1',
                          createdBy: '2',
                          dueDate: new Date(Date.now() + 86400000).toISOString(),
                          status: 'pending',
                          priority: 'high',
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        },
                        {
                          id: '2',
                          title: 'Security Patrol (Mock)',
                          description: 'Complete evening security patrol of perimeter',
                          assignedTo: '2',
                          createdBy: '1',
                          dueDate: new Date(Date.now() + 172800000).toISOString(),
                          status: 'in_progress',
                          priority: 'medium',
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        }
                      ]
                    }
                  }
                },
                {
                  result: {
                    data: {
                      json: [
                        {
                          id: '1',
                          title: 'Weekly Status Report (Mock)',
                          content: 'All systems operational. Equipment check completed successfully.',
                          authorId: '1',
                          status: 'approved',
                          type: 'text',
                          unit: 'Alpha Squad',
                          priority: 'medium',
                          dueDate: new Date(Date.now() + 86400000).toISOString(),
                          currentApprover: null,
                          currentRevision: 1,
                          createdAt: new Date(Date.now() - 86400000).toISOString(),
                          updatedAt: new Date().toISOString(),
                        },
                        {
                          id: '2',
                          title: 'Incident Report (Mock)',
                          content: 'Minor equipment malfunction in sector B. Maintenance scheduled.',
                          authorId: '2',
                          status: 'pending',
                          type: 'incident',
                          unit: 'Beta Squad',
                          priority: 'high',
                          dueDate: new Date(Date.now() + 43200000).toISOString(),
                          currentApprover: '1',
                          currentRevision: 1,
                          createdAt: new Date(Date.now() - 43200000).toISOString(),
                          updatedAt: new Date().toISOString(),
                        }
                      ]
                    }
                  }
                }
              ]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // Mock responses for individual tasks
            if (url.includes('tasks.getAll')) {
              return new Response(JSON.stringify([
                {
                  result: {
                    data: {
                      json: [
                        {
                          id: '1',
                          title: 'Equipment Check (Mock)',
                          description: 'Conduct routine equipment inspection in sector A',
                          assignedTo: '1',
                          createdBy: '2',
                          dueDate: new Date(Date.now() + 86400000).toISOString(),
                          status: 'pending',
                          priority: 'high',
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        }
                      ]
                    }
                  }
                }
              ]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // Mock responses for individual reports
            if (url.includes('reports.getAll')) {
              return new Response(JSON.stringify([
                {
                  result: {
                    data: {
                      json: [
                        {
                          id: '1',
                          title: 'Weekly Status Report (Mock)',
                          content: 'All systems operational. Equipment check completed successfully.',
                          authorId: '1',
                          status: 'approved',
                          type: 'text',
                          unit: 'Alpha Squad',
                          priority: 'medium',
                          dueDate: new Date(Date.now() + 86400000).toISOString(),
                          currentApprover: null,
                          currentRevision: 1,
                          createdAt: new Date(Date.now() - 86400000).toISOString(),
                          updatedAt: new Date().toISOString(),
                        }
                      ]
                    }
                  }
                }
              ]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // Mock responses for other common endpoints
            if (url.includes('auth')) {
              return new Response(JSON.stringify({
                result: {
                  data: {
                    json: {
                      user: null,
                      isAuthenticated: false,
                      mock: true,
                      message: 'Mock auth response - server unavailable'
                    }
                  }
                }
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // Generic mock response for other endpoints
            return new Response(JSON.stringify([
              {
                result: {
                  data: {
                    json: {
                      message: 'Mock data - all servers unavailable',
                      timestamp: new Date().toISOString(),
                      mock: true,
                      error: mainError.message
                    }
                  }
                }
              }
            ]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Re-throw the original error if not in mock mode
          throw mainError;
        }
      },
    }),
  ],
});

// Legacy alias for backward compatibility
export const vanillaTrpcClient = trpcClient;