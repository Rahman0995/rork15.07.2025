import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/authStore";
import { useNotificationsStore } from "@/store/notificationsStore";
import { colors } from "@/constants/colors";
import { trpc, createTRPCReactClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, user, isInitialized, initialize } = useAuthStore();
  const { registerForPushNotifications } = useNotificationsStore();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  // Ensure auth store is initialized
  useEffect(() => {
    if (!isInitialized) {
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
      segments[0] === 'analytics' || 
      segments[0] === 'notifications' || 
      segments[0] === 'calendar' || 
      segments[0] === 'profile' || 
      (segments.length < 1 && isAuthenticated); // Handle empty segments (home route)

    console.log('Navigation check:', {
      segments,
      isAuthenticated,
      inProtectedRoute,
      isNavigationReady,
      isInitialized
    });

    // Only redirect if we're not already in the middle of navigation
    const currentRoute = segments.join('/');
    
    if (!isAuthenticated && inProtectedRoute && currentRoute !== 'login') {
      // Redirect to login if not authenticated and trying to access protected routes
      console.log('Redirecting to login - not authenticated');
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      // Redirect to home if authenticated and on login page
      console.log('Redirecting to home - authenticated on login page');
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
  const trpcReactClient = createTRPCReactClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </trpc.Provider>
    </QueryClientProvider>
  );
}