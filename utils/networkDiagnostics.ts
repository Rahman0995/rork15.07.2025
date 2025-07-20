import { Platform } from 'react-native';

export interface NetworkDiagnostics {
  isConnected: boolean;
  apiUrl: string;
  latency?: number;
  error?: string;
  timestamp: string;
  platform: string;
}

export const diagnoseNetwork = async (): Promise<NetworkDiagnostics> => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const platform = Platform.OS;
  
  // Get API URL from environment or use default
  const apiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000';
  const healthUrl = `${apiUrl}/api/health`;
  
  try {
    console.log(`🔍 Diagnosing network connection to: ${healthUrl}`);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      console.log(`✅ Network diagnosis successful - Latency: ${latency}ms`);
      return {
        isConnected: true,
        apiUrl: healthUrl,
        latency,
        timestamp,
        platform,
      };
    } else {
      const error = `HTTP ${response.status}: ${response.statusText}`;
      console.log(`❌ Network diagnosis failed - ${error}`);
      return {
        isConnected: false,
        apiUrl: healthUrl,
        latency,
        error,
        timestamp,
        platform,
      };
    }
  } catch (error: any) {
    const latency = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown network error';
    
    console.log(`❌ Network diagnosis error - ${errorMessage}`);
    
    return {
      isConnected: false,
      apiUrl: healthUrl,
      latency,
      error: errorMessage,
      timestamp,
      platform,
    };
  }
};

export const testConnectivity = async (urls: string[] = []): Promise<string | null> => {
  const defaultUrls = [
    'http://localhost:3000/api/health',
    'http://127.0.0.1:3000/api/health',
    'http://192.168.1.100:3000/api/health',
  ];
  
  const testUrls = urls.length > 0 ? urls : defaultUrls;
  
  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing connectivity to: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        console.log(`✅ Successfully connected to: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url}`);
      continue;
    }
  }
  
  return null;
};