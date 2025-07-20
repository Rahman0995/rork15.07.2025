import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, ErrorInfo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useNotificationsStore } from "@/store/notificationsStore";
import { useTheme } from "@/constants/theme";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { trpc, createTRPCReactClient } from "@/lib/trpc";
import { SupabaseAuthProvider } from "@/store/supabaseAuthStore";

// Debug: Check if imports are working
console.log('tRPC imports:', { trpc: typeof trpc, createTRPCReactClient: typeof createTRPCReactClient });

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
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Ensure auth store is initialized
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitializing) return;
      
      try {
        setIsInitializing(true);
        if (__DEV__) {
          console.log('Auth initialization check:', { isInitialized, isAuthenticated, user: !!user });
        }
        if (!isInitialized) {
          if (__DEV__) console.log('Initializing auth store...');
          await initialize();
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setHasError(true);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeAuth();
  }, [isInitialized, initialize, isInitializing]);

  useEffect(() => {
    try {
      if (isAuthenticated) {
        // Register for push notifications when user is authenticated
        registerForPushNotifications();
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      // Don't set error state for this, as it's not critical
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
    
    // Use requestAnimationFrame to prevent navigation conflicts
    requestAnimationFrame(() => {
      if (!isAuthenticated && inProtectedRoute && currentRoute !== 'login' && currentRoute !== 'register' && currentRoute !== 'welcome') {
        // Redirect to welcome if not authenticated and trying to access protected routes
        if (__DEV__) console.log('Redirecting to welcome - not authenticated');
        router.replace('/welcome');
      } else if (isAuthenticated && (segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'welcome')) {
        // Redirect to tabs if authenticated and on auth pages
        if (__DEV__) console.log('Redirecting to tabs - authenticated on auth page');
        router.replace('/(tabs)');
      } else if (isAuthenticated && segments.length < 1) {
        // Redirect to tabs if authenticated and on root
        if (__DEV__) console.log('Redirecting to tabs - authenticated on root');
        router.replace('/(tabs)');
      } else if (!isAuthenticated && segments.length < 1) {
        // Redirect to welcome if not authenticated and on root
        if (__DEV__) console.log('Redirecting to welcome - not authenticated on root');
        router.replace('/welcome');
      }
    });
  }, [isAuthenticated, segments, isNavigationReady, isInitialized]);

  useEffect(() => {
    // Set navigation ready after initialization
    if (isInitialized) {
      try {
        setIsNavigationReady(true);
        SplashScreen.hideAsync().catch((error) => {
          console.error('Error hiding splash screen:', error);
        });
      } catch (error) {
        console.error('Error in navigation setup:', error);
        setIsNavigationReady(true);
      }
    }
  }, [isInitialized]);

  // Show error screen if there's a critical error
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Произошла ошибка при загрузке приложения
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: colors.primary, 
            padding: 15, 
            borderRadius: 8 
          }}
          onPress={() => {
            setHasError(false);
            initialize();
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Назад",
      headerStyle: {
        backgroundColor: Platform.OS === 'web' ? colors.card : 'transparent',
      },
      headerShadowVisible: Platform.OS === 'web',
      headerBackground: Platform.OS !== 'web' ? () => (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          }}
        />
      ) : undefined,
      headerTitleStyle: {
        fontWeight: '700' as const,
        fontSize: 18,
      },
      headerTintColor: colors.primary,
      headerBackTitleStyle: {
        fontSize: 16,
      },
    }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
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

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
        Произошла ошибка в приложении
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: '#666' }}>
        {error.message}
      </Text>
      <TouchableOpacity 
        style={{ 
          backgroundColor: '#007AFF', 
          padding: 15, 
          borderRadius: 8 
        }}
        onPress={resetErrorBoundary}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Перезапустить</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [trpcClient] = useState(() => {
    console.log('Creating tRPC React client...');
    return createTRPCReactClient();
  });
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: Error, errorInfo: ErrorInfo) => {
        console.error('App Error Boundary:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <RootLayoutWrapper />
        </trpc.Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function RootLayoutWrapper() {
  const { colors, isDark } = useTheme();
  
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
        <SupabaseAuthProvider>
          <RootLayoutNav />
        </SupabaseAuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}