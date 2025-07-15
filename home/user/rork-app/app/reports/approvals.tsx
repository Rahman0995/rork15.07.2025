import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useReportsStore } from '@/store/reportsStore';
import { ReportApprovalCard } from '../../components/ReportApprovalCard';
import { colors } from '@/constants/colors';
import { Report } from '@/types';

export default function ReportApprovalsScreen() {
  const router = useRouter();
  const { 
    getReportsForApproval, 
    approveReport, 
    rejectReport, 
    requestRevision,
    isLoading 
  } = useReportsStore();
  
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const reportsForApproval = getReportsForApproval();
    setReports(reportsForApproval);
  }, [getReportsForApproval]);

  const handleApprove = async (reportId: string) => {
    Alert.alert(
      'Утвердить отчет',
      'Вы уверены, что хотите утвердить этот отчет?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Утвердить',
          onPress: async () => {
            await approveReport(reportId);
            const updatedReports = getReportsForApproval();
            setReports(updatedReports);
          },
        },
      ]
    );
  };

  const handleReject = async (reportId: string) => {
    Alert.prompt(
      'Отклонить отчет',
      'Укажите причину отклонения:',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отклонить',
          onPress: async (comment) => {
            if (comment && comment.trim()) {
              await rejectReport(reportId, comment.trim());
              const updatedReports = getReportsForApproval();
              setReports(updatedReports);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleRequestRevision = async (reportId: string) => {
    Alert.prompt(
      'Запросить доработку',
      'Укажите, что необходимо доработать:',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отправить',
          onPress: async (comment) => {
            if (comment && comment.trim()) {
              await requestRevision(reportId, comment.trim());
              const updatedReports = getReportsForApproval();
              setReports(updatedReports);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleReportPress = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Утверждение отчетов',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : reports.length > 0 ? (
          <FlatList
            data={reports}
            renderItem={({ item }) => (
              <ReportApprovalCard
                report={item}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestRevision={handleRequestRevision}
                onPress={handleReportPress}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Нет отчетов, ожидающих утверждения
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});