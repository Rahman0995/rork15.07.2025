import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SupabaseAuthProvider } from '@/store/supabaseAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthProvider>
          <StatusBar style="auto" />
          <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
          <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
          <Stack.Screen name="documents" options={{ title: 'Documents' }} />
          <Stack.Screen name="personnel" options={{ title: 'Personnel' }} />
          <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
          <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
          <Stack.Screen name="event/[id]" options={{ title: 'Event Details' }} />
          <Stack.Screen name="event/create" options={{ title: 'Create Event' }} />
          <Stack.Screen name="report/[id]" options={{ title: 'Report Details' }} />
          <Stack.Screen name="report/create" options={{ title: 'Create Report' }} />
          <Stack.Screen name="reports/approvals" options={{ title: 'Report Approvals' }} />
          <Stack.Screen name="task/[id]" options={{ title: 'Task Details' }} />
          <Stack.Screen name="task/create" options={{ title: 'Create Task' }} />
          <Stack.Screen name="settings/account" options={{ title: 'Account Settings' }} />
          <Stack.Screen name="settings/help" options={{ title: 'Help & Support' }} />
          <Stack.Screen name="settings/notifications" options={{ title: 'Notification Settings' }} />
          <Stack.Screen name="settings/photos" options={{ title: 'Photo Settings' }} />
          <Stack.Screen name="settings/privacy" options={{ title: 'Privacy Settings' }} />
          <Stack.Screen name="settings/profile-edit" options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        </SupabaseAuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});