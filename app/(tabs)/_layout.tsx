import { Tabs, router } from "expo-router";
import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { FileText, Home, MessageSquare, BarChart3, User, Calendar, Users, Bell } from "lucide-react-native";
import { useTheme } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotificationsStore } from "@/store/notificationsStore";

import { useAuthStore } from "@/store/authStore";


export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { notifications } = useNotificationsStore();
  
  const unreadNotifications = notifications.filter(n => n.userId === user?.id && !n.read);
  
  const HeaderRightComponent = () => (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 10, 
      marginRight: 16,
      paddingVertical: 6,
    }}>
      <TouchableOpacity 
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        }}
        onPress={() => router.push('/personnel')}
        activeOpacity={0.6}
      >
        <Users size={21} color={colors.text} strokeWidth={2.2} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{
          position: 'relative',
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        }}
        onPress={() => router.push('/notifications')}
        activeOpacity={0.6}
      >
        <Bell size={21} color={colors.text} strokeWidth={2.2} />
        {unreadNotifications.length > 0 && (
          <View style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.error,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2.5,
            borderColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
            shadowColor: colors.error,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <NotificationBadge count={unreadNotifications.length} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
  
  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    return (
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Platform.OS === 'web' ? colors.card : 'transparent',
            borderTopColor: Platform.OS === 'web' ? colors.borderLight : 'transparent',
            borderTopWidth: Platform.OS === 'web' ? 1 : 0,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom + 6 : 22,
            height: Platform.OS === 'ios' ? 64 + insets.bottom : 74,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 12,
          },
        ]}
      >
        {Platform.OS !== 'web' && (
          <BlurView
            intensity={95}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
            }}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Platform.OS === 'web' ? colors.card : 'transparent',
            flex: 1,
          }}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const color = isFocused ? colors.primary : colors.textTertiary;
            const IconComponent = options.tabBarIcon;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                }}
              >
                {IconComponent && <IconComponent color={color} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerStyle: {
          backgroundColor: Platform.OS === 'web' ? colors.card : 'transparent',
          borderBottomColor: Platform.OS === 'web' ? colors.borderLight : 'transparent',
          borderBottomWidth: Platform.OS === 'web' ? 1 : 0,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
        },
        headerBackground: Platform.OS !== 'web' ? () => (
          <BlurView
            intensity={95}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
            }}
          />
        ) : undefined,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700' as const,
          fontSize: 18,
          letterSpacing: -0.3,
        },
        headerRight: () => <HeaderRightComponent />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Отчеты",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={2} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Чат",
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} strokeWidth={2} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}