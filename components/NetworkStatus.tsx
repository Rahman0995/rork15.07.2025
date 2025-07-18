import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react-native';
import { diagnoseNetwork, testMultipleUrls, getNetworkInfo, NetworkDiagnostics } from '@/utils/networkDiagnostics';

interface NetworkStatusProps {
  visible?: boolean;
  onClose?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ visible = false, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics | null>(null);
  const [multipleTests, setMultipleTests] = useState<NetworkDiagnostics[]>([]);
  const [loading, setLoading] = useState(false);
  const [networkInfo] = useState(getNetworkInfo());

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await diagnoseNetwork();
      setDiagnostics(result);
      
      // Test multiple URLs if available
      const fallbackUrls = networkInfo.config.fallbackUrls || [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.100:3000'
      ];
      
      const multipleResults = await testMultipleUrls(fallbackUrls);
      setMultipleTests(multipleResults);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      runDiagnostics();
    }
  }, [visible]);

  const copyDiagnostics = () => {
    const diagnosticsText = JSON.stringify({
      diagnostics,
      multipleTests,
      networkInfo
    }, null, 2);
    
    // For web, we can't copy to clipboard easily, so show alert
    Alert.alert(
      'Diagnostics Info',
      'Check console for detailed diagnostics information',
      [{ text: 'OK' }]
    );
    
    console.log('Network Diagnostics:', diagnosticsText);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Network Diagnostics</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Current Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            {diagnostics ? (
              <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                  {diagnostics.isConnected ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <AlertCircle size={20} color="#EF4444" />
                  )}
                  <Text style={[styles.statusText, { 
                    color: diagnostics.isConnected ? '#10B981' : '#EF4444' 
                  }]}>
                    {diagnostics.isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                <Text style={styles.detailText}>URL: {diagnostics.apiUrl}</Text>
                {diagnostics.latency && (
                  <Text style={styles.detailText}>Latency: {diagnostics.latency}ms</Text>
                )}
                {diagnostics.error && (
                  <Text style={styles.errorText}>Error: {diagnostics.error}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.loadingText}>Running diagnostics...</Text>
            )}
          </View>

          {/* Multiple URL Tests */}
          {multipleTests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>URL Tests</Text>
              {multipleTests.map((test, index) => (
                <View key={index} style={styles.testCard}>
                  <View style={styles.statusRow}>
                    {test.isConnected ? (
                      <CheckCircle size={16} color="#10B981" />
                    ) : (
                      <AlertCircle size={16} color="#EF4444" />
                    )}
                    <Text style={styles.testUrl}>{test.baseUrl}</Text>
                  </View>
                  {test.latency && (
                    <Text style={styles.testDetail}>{test.latency}ms</Text>
                  )}
                  {test.error && (
                    <Text style={styles.testError}>{test.error}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Configuration Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuration</Text>
            <View style={styles.configCard}>
              <Text style={styles.configText}>Platform: {networkInfo.platform}</Text>
              <Text style={styles.configText}>Development: {networkInfo.isDev ? 'Yes' : 'No'}</Text>
              <Text style={styles.configText}>Base URL: {networkInfo.config.baseUrl || 'Not set'}</Text>
              <Text style={styles.configText}>Timeout: {networkInfo.config.timeout}ms</Text>
              <Text style={styles.configText}>Mock Data: {networkInfo.config.enableMockData ? 'Enabled' : 'Disabled'}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Pressable 
            onPress={runDiagnostics} 
            style={[styles.button, styles.refreshButton]}
            disabled={loading}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Testing...' : 'Refresh'}
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={copyDiagnostics} 
            style={[styles.button, styles.copyButton]}
          >
            <Text style={styles.buttonText}>Copy Info</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  testCard: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  testUrl: {
    fontSize: 12,
    color: '#111827',
    marginLeft: 6,
    flex: 1,
  },
  testDetail: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 2,
  },
  testError: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: 2,
  },
  configCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  configText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
  },
  copyButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});