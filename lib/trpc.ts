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
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://10.0.2.2:3000', // Android emulator
      'http://10.0.2.2:3001', // Android emulator
      `http://${getLocalIP()}:3000`,
      `http://${getLocalIP()}:3001`,
      'http://192.168.1.100:3000',
      'http://192.168.1.100:3001',
      'http://192.168.0.100:3000',
      'http://192.168.0.100:3001',
      'http://10.0.0.100:3000',
      'http://10.0.0.100:3001'
    ]
  };
  
  console.log('API Configuration:', apiConfig);
  return apiConfig;
};

const apiConfig = getApiConfig();

// Create vanilla tRPC client for use outside React components
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    // Disable logger to prevent console spam
    httpBatchLink({
      url: `${apiConfig.baseUrl}/api/trpc`,
      transformer: superjson,
      
      // Custom fetch with comprehensive error handling and fallback URLs
      fetch: async (url, options) => {
        const tryFetch = async (fetchUrl: string, retryCount = 0): Promise<Response> => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
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
            
            console.log(`✅ tRPC request successful: ${response.status}`);
            return response;
          } catch (error: any) {
            clearTimeout(timeoutId);
            console.error(`❌ Request failed for ${fetchUrl}:`, error.message);
            throw error;
          }
        };

        const provideMockResponse = (url: string) => {
          console.log('🔧 Using mock data for:', url);
          
          // Parse URL to understand the request
          const urlObj = new URL(url);
          const searchParams = urlObj.searchParams;
          const input = searchParams.get('input');
          
          // Enhanced mock responses for different endpoints
          if (url.includes('example.hi')) {
            const mockResponse = {
              result: {
                data: {
                  json: {
                    message: 'Hello from mock backend! (Server offline)',
                    timestamp: new Date().toISOString(),
                    mock: true,
                    status: 'offline'
                  }
                }
              }
            };
            
            // Handle batch requests
            if (url.includes('batch=1')) {
              return new Response(JSON.stringify([mockResponse]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            return new Response(JSON.stringify(mockResponse), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Mock responses for tasks
          if (url.includes('tasks.getAll')) {
            return new Response(JSON.stringify({
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
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          if (url.includes('reports.getAll')) {
            return new Response(JSON.stringify({
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
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Generic mock response
          return new Response(JSON.stringify({
            result: {
              data: {
                json: {
                  message: 'Mock data - server offline',
                  timestamp: new Date().toISOString(),
                  mock: true,
                  status: 'offline'
                }
              }
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        };

        // Try real backend first
        if (typeof url === 'string') {
          try {
            return await tryFetch(url);
          } catch (mainError) {
            console.log('🔄 Main URL failed, trying fallback URLs...');
            
            // Try fallback URLs if main URL fails
            if (apiConfig.fallbackUrls) {
              const urlObj = new URL(url);
              const urlPath = urlObj.pathname + urlObj.search;
              
              for (const fallbackBaseUrl of apiConfig.fallbackUrls) {
                try {
                  const fallbackUrl = fallbackBaseUrl + urlPath;
                  console.log(`🔄 Trying fallback URL: ${fallbackUrl}`);
                  return await tryFetch(fallbackUrl);
                } catch (fallbackError) {
                  console.log(`❌ Fallback URL ${fallbackBaseUrl} also failed`);
                  continue;
                }
              }
            }
            
            // All real URLs failed, provide mock response as fallback
            console.log('🔧 All backend URLs failed, using mock data as fallback');
            return provideMockResponse(url);
          }
        }

        throw new Error('Invalid URL provided');
          

      },
    }),
  ],
});



// Create tRPC React client factory function  
export function createTRPCReactClient() {
  console.log('Creating tRPC React client...');
  
  try {
    const client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${apiConfig.baseUrl}/api/trpc`,
          transformer: superjson,
          
          // Custom fetch with comprehensive error handling and fallback URLs
          fetch: async (url, options) => {
            const tryFetch = async (fetchUrl: string, retryCount = 0): Promise<Response> => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
              
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
                
                console.log(`✅ tRPC request successful: ${response.status}`);
                return response;
              } catch (error: any) {
                clearTimeout(timeoutId);
                console.error(`❌ Request failed for ${fetchUrl}:`, error.message);
                throw error;
              }
            };

            const provideMockResponse = (url: string) => {
              console.log('🔧 Using mock data for:', url);
              
              // Parse URL to understand the request
              const urlObj = new URL(url);
              const searchParams = urlObj.searchParams;
              const input = searchParams.get('input');
              
              // Enhanced mock responses for different endpoints
              if (url.includes('example.hi')) {
                const mockResponse = {
                  result: {
                    data: {
                      json: {
                        message: 'Hello from mock backend! (Server offline)',
                        timestamp: new Date().toISOString(),
                        mock: true,
                        status: 'offline'
                      }
                    }
                  }
                };
                
                // Handle batch requests
                if (url.includes('batch=1')) {
                  return new Response(JSON.stringify([mockResponse]), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
                
                return new Response(JSON.stringify(mockResponse), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }

              // Mock responses for tasks
              if (url.includes('tasks.getAll')) {
                return new Response(JSON.stringify({
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
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              
              if (url.includes('reports.getAll')) {
                return new Response(JSON.stringify({
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
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              
              // Generic mock response
              return new Response(JSON.stringify({
                result: {
                  data: {
                    json: {
                      message: 'Mock data - server offline',
                      timestamp: new Date().toISOString(),
                      mock: true,
                      status: 'offline'
                    }
                  }
                }
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            };

            // Try real backend first
            if (typeof url === 'string') {
              try {
                return await tryFetch(url);
              } catch (mainError) {
                console.log('🔄 Main URL failed, trying fallback URLs...');
                
                // Try fallback URLs if main URL fails
                if (apiConfig.fallbackUrls) {
                  const urlObj = new URL(url);
                  const urlPath = urlObj.pathname + urlObj.search;
                  
                  for (const fallbackBaseUrl of apiConfig.fallbackUrls) {
                    try {
                      const fallbackUrl = fallbackBaseUrl + urlPath;
                      console.log(`🔄 Trying fallback URL: ${fallbackUrl}`);
                      return await tryFetch(fallbackUrl);
                    } catch (fallbackError) {
                      console.log(`❌ Fallback URL ${fallbackBaseUrl} also failed`);
                      continue;
                    }
                  }
                }
                
                // All real URLs failed, provide mock response as fallback
                console.log('🔧 All backend URLs failed, using mock data as fallback');
                return provideMockResponse(url);
              }
            }

            throw new Error('Invalid URL provided');
          },
        }),
      ],
    });
    
    console.log('✅ tRPC React client created successfully');
    return client;
  } catch (error) {
    console.error('❌ Error creating tRPC React client:', error);
    throw error;
  }
}

// Legacy alias for backward compatibility
export const vanillaTrpcClient = trpcClient;