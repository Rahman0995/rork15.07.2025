import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from '@/components/Button';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/constants/theme';

export default function BackendTestScreen() {
  const { colors } = useTheme();
  const [testName, setTestName] = useState('');

  // Test queries
  const hiQuery = trpc.example.hi.useQuery({ name: testName || 'World' });
  const tasksQuery = trpc.example.getTasks.useQuery();
  const reportsQuery = trpc.example.getReports.useQuery();

  // Test mutations
  const createTaskMutation = trpc.example.createTask.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Task created successfully!');
      tasksQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to create task: ${error.message}`);
    },
  });

  const createReportMutation = trpc.example.createReport.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Report created successfully!');
      reportsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to create report: ${error.message}`);
    },
  });

  const handleCreateTask = () => {
    createTaskMutation.mutate({
      title: 'Test Task',
      description: 'This is a test task created from the app',
      priority: 'medium',
      assignedTo: '1',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });
  };

  const handleCreateReport = () => {
    createReportMutation.mutate({
      title: 'Test Report',
      content: 'This is a test report created from the app',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    section: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    text: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    status: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
    },
    success: {
      color: colors.success || '#10B981',
    },
    error: {
      color: colors.error || '#EF4444',
    },
    loading: {
      color: colors.primary,
    },
    button: {
      marginTop: 8,
    },
    dataContainer: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    dataText: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'monospace',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.sectionTitle, { fontSize: 24, textAlign: 'center', marginBottom: 24 }]}>
        tRPC Backend Test
      </Text>

      {/* Hi Query Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hi Query Test</Text>
        <Text style={[styles.status, hiQuery.isLoading && styles.loading]}>
          Status: {hiQuery.isLoading ? 'Loading...' : hiQuery.isError ? 'Error' : 'Success'}
        </Text>
        {hiQuery.isError && (
          <Text style={[styles.text, styles.error]}>
            Error: {hiQuery.error?.message}
          </Text>
        )}
        {hiQuery.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>
              {JSON.stringify(hiQuery.data, null, 2)}
            </Text>
          </View>
        )}
        <Button
          title="Refetch Hi"
          onPress={() => hiQuery.refetch()}
          style={styles.button}
        />
      </View>

      {/* Tasks Query Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks Query Test</Text>
        <Text style={[styles.status, tasksQuery.isLoading && styles.loading]}>
          Status: {tasksQuery.isLoading ? 'Loading...' : tasksQuery.isError ? 'Error' : 'Success'}
        </Text>
        {tasksQuery.isError && (
          <Text style={[styles.text, styles.error]}>
            Error: {tasksQuery.error?.message}
          </Text>
        )}
        {tasksQuery.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>
              Found {tasksQuery.data.length} tasks
            </Text>
          </View>
        )}
        <Button
          title="Create Test Task"
          onPress={handleCreateTask}
          disabled={createTaskMutation.isPending}
          style={styles.button}
        />
      </View>

      {/* Reports Query Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports Query Test</Text>
        <Text style={[styles.status, reportsQuery.isLoading && styles.loading]}>
          Status: {reportsQuery.isLoading ? 'Loading...' : reportsQuery.isError ? 'Error' : 'Success'}
        </Text>
        {reportsQuery.isError && (
          <Text style={[styles.text, styles.error]}>
            Error: {reportsQuery.error?.message}
          </Text>
        )}
        {reportsQuery.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>
              Found {reportsQuery.data.length} reports
            </Text>
          </View>
        )}
        <Button
          title="Create Test Report"
          onPress={handleCreateReport}
          disabled={createReportMutation.isPending}
          style={styles.button}
        />
      </View>

      {/* Connection Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Info</Text>
        <Text style={styles.text}>
          Environment: {__DEV__ ? 'Development' : 'Production'}
        </Text>
        <Text style={styles.text}>
          Platform: {require('react-native').Platform.OS}
        </Text>
      </View>
    </ScrollView>
  );
}