import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useNotificationsStore } from "@/store/notificationsStore";
import { useTheme } from "@/constants/theme";
import { Platform } from "react-native";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent queries from returning undefined
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function RootLayoutNav() {
  const { isAuthenticated, user, isInitialized, initialize } = useAuthStore();
  const { registerForPushNotifications } = useNotificationsStore();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  // Ensure auth store is initialized
  useEffect(() => {
    if (__DEV__) {
      console.log('Auth initialization check:', { isInitialized, isAuthenticated, user: !!user });
    }
    if (!isInitialized) {
      if (__DEV__) console.log('Initializing auth store...');
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      // Register for push notifications when user is authenticated
      registerForPushNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isNavigationReady || !isInitialized) return;

    const inProtectedRoute = 
      segments[0] === '(tabs)' || 
      segments[0] === 'task' || 
      segments[0] === 'report' || 
      segments[0] === 'chat' || 
      segments[0] === 'event' || 
      segments[0] === 'settings' || 
      segments[0] === 'reports' || 
      (segments.length < 1 && isAuthenticated); // Home route

    // Only redirect if we're not already in the middle of navigation
    const currentRoute = segments.join('/');
    
    if (__DEV__) {
      console.log('Navigation check:', {
        segments,
        isAuthenticated,
        inProtectedRoute,
        isNavigationReady,
        isInitialized,
        user: !!user,
        currentRoute,
        platform: Platform.OS
      });
    }
    
    if (!isAuthenticated && inProtectedRoute && currentRoute !== 'login') {
      // Redirect to login if not authenticated and trying to access protected routes
      if (__DEV__) console.log('Redirecting to login - not authenticated');
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      // Redirect to tabs if authenticated and on login page
      if (__DEV__) console.log('Redirecting to tabs - authenticated on login page');
      router.replace('/(tabs)');
    } else if (isAuthenticated && segments.length < 1) {
      // Redirect to tabs if authenticated and on root
      if (__DEV__) console.log('Redirecting to tabs - authenticated on root');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isNavigationReady, isInitialized]);

  useEffect(() => {
    // Set navigation ready after a short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
      if (isInitialized) {
        SplashScreen.hideAsync();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInitialized]);

  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Назад",
      headerStyle: {
        backgroundColor: colors.card,
      },
      headerTitleStyle: {
        color: colors.text,
        fontWeight: '600',
      },
      headerTintColor: colors.primary,
    }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="report/[id]" options={{ title: "Отчет" }} />
      <Stack.Screen name="report/create" options={{ title: "Создать отчет" }} />
      <Stack.Screen name="task/[id]" options={{ title: "Задача" }} />
      <Stack.Screen name="task/create" options={{ title: "Создать задачу" }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="settings/notifications" options={{ title: "Уведомления" }} />
      <Stack.Screen name="event/create" options={{ title: "Создать событие" }} />
      <Stack.Screen name="event/[id]" options={{ title: "Событие" }} />
      <Stack.Screen name="reports/approvals" options={{ title: "Утверждения" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <RootLayoutWrapper />
      </trpc.Provider>
    </QueryClientProvider>
  );
}

function RootLayoutWrapper() {
  const { colors, isDark } = useTheme();
  
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
        <RootLayoutNav />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}