import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Stack } from 'expo-router';
import { Activity, TestTube } from 'lucide-react-native';
import IntegrationDiagnostics from '@/components/IntegrationDiagnostics';
import IntegrationTester from '@/components/IntegrationTester';

export default function IntegrationDiagnosticsPage() {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'testing'>('diagnostics');

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Диагностика интеграции',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diagnostics' && styles.activeTab]}
          onPress={() => setActiveTab('diagnostics')}
        >
          <Activity size={20} color={activeTab === 'diagnostics' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'diagnostics' && styles.activeTabText]}>
            Диагностика
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'testing' && styles.activeTab]}
          onPress={() => setActiveTab('testing')}
        >
          <TestTube size={20} color={activeTab === 'testing' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'testing' && styles.activeTabText]}>
            Тестирование
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'diagnostics' ? <IntegrationDiagnostics /> : <IntegrationTester />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});