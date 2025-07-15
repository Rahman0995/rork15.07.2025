import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import { ReportCard } from '@/components/ReportCard';
import { colors } from '@/constants/colors';
import { CheckCircle2 } from 'lucide-react-native';
import { Report } from '@/types';

export default function ReportsApprovalsScreen() {
  const router = useRouter();
  const { fetchReports, getReportsForApproval, isLoading } = useReportsStore();
  const { user } = useAuthStore();
  
  const reportsForApproval = getReportsForApproval();
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const navigateToReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Отчеты на утверждение',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
          headerTintColor: colors.primary,
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <CheckCircle2 size={24} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Отчеты на утверждение</Text>
            <Text style={styles.headerSubtitle}>
              {reportsForApproval.length} отчетов ожидают вашего решения
            </Text>
          </View>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : reportsForApproval.length > 0 ? (
        <FlatList
          data={reportsForApproval}
          renderItem={({ item }) => (
            <ReportCard key={item.id} report={item} onPress={navigateToReport} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchReports}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <CheckCircle2 size={48} color={colors.inactive} />
          <Text style={styles.emptyTitle}>Нет отчетов на утверждение</Text>
          <Text style={styles.emptyText}>
            Все отчеты обработаны или у вас нет прав на утверждение
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});