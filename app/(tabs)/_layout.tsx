import { Tabs, router } from "expo-router";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { FileText, Home, MessageSquare, BarChart3, User } from "lucide-react-native";
import { useTheme } from "@/constants/theme";

import { useAuthStore } from "@/store/authStore";


export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 20,
          height: 70,
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

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
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
          tabBarIcon: ({ color }) => <BarChart3 size={20} color={color} />,
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