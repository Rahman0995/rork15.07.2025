import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { diagnoseNetwork, NetworkDiagnostics } from '@/utils/networkDiagnostics';

interface NetworkConnectionTestProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export const NetworkConnectionTest: React.FC<NetworkConnectionTestProps> = ({ 
  onConnectionChange 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Test tRPC connection
  const testTRPCConnection = async () => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      console.log('Testing tRPC connection...');
      const result = await trpc.example.hi.query();
      console.log('tRPC test result:', result);
      
      const connected = !!result;
      setIsConnected(connected);
      onConnectionChange?.(connected);
      
      if (result?.mock) {
        setLastError('Using mock data - server unavailable');
      }
    } catch (error: any) {
      console.error('tRPC connection test failed:', error);
      setIsConnected(false);
      setLastError(error.message || 'Connection failed');
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Run network diagnostics
  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const result = await diagnoseNetwork();
      setDiagnostics(result);
      setIsConnected(result.isConnected);
      onConnectionChange?.(result.isConnected);
      
      if (!result.isConnected && result.error) {
        setLastError(result.error);
      }
    } catch (error: any) {
      console.error('Network diagnostics failed:', error);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-test on mount
  useEffect(() => {
    testTRPCConnection();
  }, []);

  const showDiagnostics = () => {
    if (diagnostics) {
      Alert.alert(
        'Network Diagnostics',
        `URL: ${diagnostics.apiUrl}\nLatency: ${diagnostics.latency || 'N/A'}ms\nError: ${diagnostics.error || 'None'}`,
        [
          { text: 'OK' },
          { text: 'Copy to Console', onPress: () => console.log('Diagnostics:', diagnostics) }
        ]
      );
    }
  };

  const getStatusColor = () => {
    if (isLoading) return '#6B7280';
    if (isConnected === null) return '#6B7280';
    return isConnected ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    if (isLoading) return 'Testing...';
    if (isConnected === null) return 'Unknown';
    if (isConnected && lastError?.includes('mock')) return 'Mock Mode';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    const size = 16;
    
    if (isLoading) return <RefreshCw size={size} color={color} />;
    if (isConnected === null) return <Wifi size={size} color={color} />;
    if (isConnected) return <CheckCircle size={size} color={color} />;
    return <AlertCircle size={size} color={color} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        {getStatusIcon()}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      {lastError && (
        <Text style={styles.errorText} numberOfLines={2}>
          {lastError}
        </Text>
      )}
      
      <View style={styles.actions}>
        <Pressable 
          onPress={testTRPCConnection}
          style={[styles.button, styles.testButton]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test tRPC</Text>
        </Pressable>
        
        <Pressable 
          onPress={runDiagnostics}
          style={[styles.button, styles.diagButton]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Diagnose</Text>
        </Pressable>
        
        {diagnostics && (
          <Pressable 
            onPress={showDiagnostics}
            style={[styles.button, styles.infoButton]}
          >
            <Text style={styles.buttonText}>Info</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#3B82F6',
  },
  diagButton: {
    backgroundColor: '#8B5CF6',
  },
  infoButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});