import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface NetworkDiagnostics {
  platform: string;
  baseUrl: string;
  apiUrl: string;
  isConnected: boolean;
  latency?: number;
  error?: string;
  timestamp: string;
}

export const diagnoseNetwork = async (): Promise<NetworkDiagnostics> => {
  const config = Constants.expoConfig?.extra;
  const baseUrl = config?.backendConfig?.baseUrl || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/health`;
  
  const diagnostics: NetworkDiagnostics = {
    platform: Platform.OS,
    baseUrl,
    apiUrl,
    isConnected: false,
    timestamp: new Date().toISOString(),
  };

  try {
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    
    diagnostics.latency = endTime - startTime;
    diagnostics.isConnected = response.ok;
    
    if (!response.ok) {
      diagnostics.error = `HTTP ${response.status}: ${response.statusText}`;
    }
    
  } catch (error: any) {
    diagnostics.error = error.message || 'Unknown network error';
    
    if (error.name === 'AbortError') {
      diagnostics.error = 'Request timeout (10s)';
    } else if (error.message.includes('Network request failed')) {
      diagnostics.error = 'Network unavailable - check your connection and backend server';
    }
  }

  return diagnostics;
};

export const testMultipleUrls = async (urls: string[]): Promise<NetworkDiagnostics[]> => {
  const results: NetworkDiagnostics[] = [];
  
  for (const url of urls) {
    const diagnostics: NetworkDiagnostics = {
      platform: Platform.OS,
      baseUrl: url,
      apiUrl: `${url}/api/health`,
      isConnected: false,
      timestamp: new Date().toISOString(),
    };

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      diagnostics.latency = endTime - startTime;
      diagnostics.isConnected = response.ok;
      
      if (!response.ok) {
        diagnostics.error = `HTTP ${response.status}`;
      }
      
    } catch (error: any) {
      diagnostics.error = error.name === 'AbortError' ? 'Timeout' : error.message;
    }
    
    results.push(diagnostics);
  }
  
  return results;
};

export const getNetworkInfo = () => {
  const config = Constants.expoConfig?.extra;
  
  return {
    platform: Platform.OS,
    isDev: __DEV__,
    config: {
      baseUrl: config?.backendConfig?.baseUrl,
      timeout: config?.backendConfig?.timeout,
      enableMockData: config?.backendConfig?.enableMockData,
      fallbackUrls: config?.backendConfig?.fallbackUrls,
    },
    environment: {
      EXPO_PUBLIC_RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL,
      LOCAL_IP: process.env.LOCAL_IP,
      NODE_ENV: process.env.NODE_ENV,
    }
  };
};