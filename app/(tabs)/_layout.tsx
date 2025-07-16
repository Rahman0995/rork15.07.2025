import { Tabs, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Platform, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { FileText, Home, MessageSquare, BarChart3, User } from "lucide-react-native";
import { useTheme } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/store/authStore";

// Create a global scroll listener
let globalScrollListener: ((scrollY: number) => void) | null = null;

export const setGlobalScrollListener = (listener: (scrollY: number) => void) => {
  globalScrollListener = listener;
};

export const notifyGlobalScroll = (scrollY: number) => {
  if (globalScrollListener) {
    globalScrollListener(scrollY);
  }
};


export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(new Animated.Value(0));
  const [isScrolling, setIsScrolling] = useState(false);
  
  useEffect(() => {
    setGlobalScrollListener((scrollValue: number) => {
      scrollY.setValue(scrollValue);
      setIsScrolling(scrollValue > 20); // Lower threshold for earlier activation
    });
    
    return () => {
      setGlobalScrollListener(() => {});
    };
  }, []);
  
  const tabBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.97],
    extrapolate: 'clamp',
  });
  
  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Platform.OS === 'web' ? colors.card : 'transparent',
            borderTopColor: colors.borderLight,
            borderTopWidth: 1,
            paddingTop: 6,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom + 4 : 20,
            height: Platform.OS === 'ios' ? 60 + insets.bottom : 70,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            opacity: isScrolling ? tabBarOpacity : 1,
          },
        ]}
      >
        {Platform.OS !== 'web' && (
          <BlurView
            intensity={isScrolling ? 100 : 0}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
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
      </Animated.View>
    );
  };
  
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
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