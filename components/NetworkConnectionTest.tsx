import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/constants/theme';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react-native';

export function NetworkConnectionTest() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Simple connectivity test
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        timeout: 5000,
      });
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {isConnected ? (
            <Wifi size={16} color={colors.success} />
          ) : (
            <WifiOff size={16} color={colors.error} />
          )}
          <Text style={styles.title}>Диагностика сети</Text>
        </View>
        <TouchableOpacity 
          onPress={testConnection} 
          style={styles.refreshButton}
          disabled={isLoading}
        >
          <RefreshCw 
            size={14} 
            color={colors.primary} 
            style={isLoading ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>
      
      <ConnectionStatus
        isConnected={isConnected}
        serverStatus={isConnected ? 'connected' : 'error'}
        showDetails={true}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  refreshButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});