import { Tabs, router } from "expo-router";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { FileText, Home, MessageSquare, User, Bell, Calendar, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/constants/theme";
import { useNotificationsStore } from "@/store/notificationsStore";
import { useAuthStore } from "@/store/authStore";
import { NotificationBadge } from "@/components/NotificationBadge";

export default function TabLayout() {
  const { getUnreadCount } = useNotificationsStore();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  
  const unreadCount = user ? getUnreadCount(user.id) : 0;
  
  const HeaderButtons = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => router.push('/calendar')}
        style={{
          marginRight: 20,
          padding: 4,
        }}
      >
        <Calendar size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/notifications')}
        style={{
          marginRight: 16,
          position: 'relative',
          padding: 4,
        }}
      >
        <Bell size={24} color={colors.text} />
        <NotificationBadge count={unreadCount} size={16} />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.borderLight,
          borderBottomWidth: 1,
          shadowColor: colors.shadowLight,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 3,
          elevation: 1,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontSize: 17,
          letterSpacing: -0.2,
        },
        headerRight: () => <HeaderButtons />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Отчеты",
          tabBarIcon: ({ color }) => <FileText size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Чат",
          tabBarIcon: ({ color }) => <MessageSquare size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Аналитика",
          tabBarIcon: ({ color }) => <TrendingUp size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />

    </Tabs>
  );
}