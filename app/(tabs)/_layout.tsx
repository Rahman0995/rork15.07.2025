import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { BarChart2, FileText, Home, MessageSquare, User, Bell, Calendar, TrendingUp, Server } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useNotificationsStore } from "@/store/notificationsStore";
import { useAuthStore } from "@/store/authStore";
import { NotificationBadge } from "@/components/NotificationBadge";

export default function TabLayout() {
  const { getUnreadCount } = useNotificationsStore();
  const { user } = useAuthStore();
  
  const unreadCount = user ? getUnreadCount(user.id) : 0;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 84,
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
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: -0.3,
        },
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
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Отчеты",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Чат",
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Аналитика",
          tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Календарь",
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Уведомления",
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <Bell size={22} color={color} />
              <NotificationBadge count={unreadCount} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="backend-test"
        options={{
          title: "Backend",
          tabBarIcon: ({ color }) => <Server size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}