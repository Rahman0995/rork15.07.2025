import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  BarChart2,
  Calendar,
  FileText,
  CheckSquare,
  MessageSquare,
  Users,
  Settings,
  X,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route: string;
  color: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'analytics',
    title: 'Аналитика',
    icon: BarChart2,
    route: '/(tabs)/analytics',
    color: colors.primary,
    description: 'Статистика и отчеты',
  },
  {
    id: 'calendar',
    title: 'Календарь',
    icon: Calendar,
    route: '/(tabs)/calendar',
    color: colors.secondary,
    description: 'События и планы',
  },
  {
    id: 'reports',
    title: 'Отчеты',
    icon: FileText,
    route: '/(tabs)/reports',
    color: colors.success,
    description: 'Создать и просмотреть',
  },
  {
    id: 'tasks',
    title: 'Задачи',
    icon: CheckSquare,
    route: '/task/create',
    color: colors.warning,
    description: 'Новая задача',
  },
  {
    id: 'chat',
    title: 'Чат',
    icon: MessageSquare,
    route: '/(tabs)/chat',
    color: colors.info,
    description: 'Сообщения команды',
  },
  {
    id: 'create-report',
    title: 'Отчет',
    icon: FileText,
    route: '/report/create',
    color: colors.error,
    description: 'Создать отчет',
  },
];

interface FloatingMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const itemAnimations = useRef(
    menuItems.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible) {
      // Animate menu appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate items with stagger
      const itemAnimationPromises = itemAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        })
      );

      Animated.stagger(50, itemAnimationPromises).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      itemAnimations.forEach(anim => anim.setValue(0));
    }
  }, [visible]);

  const handleItemPress = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 100);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {Platform.OS !== 'web' ? (
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.webBackdrop]} />
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Быстрые действия</Text>
              <Text style={styles.headerSubtitle}>Выберите нужный раздел</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.menuItemContainer,
                    {
                      opacity: itemAnimations[index],
                      transform: [
                        {
                          translateY: itemAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleItemPress(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                      <IconComponent size={24} color={item.color} />
                    </View>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => handleItemPress('/(tabs)/profile')}
            >
              <Settings size={16} color={colors.textSecondary} />
              <Text style={styles.settingsText}>Настройки</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fabButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Plus size={24} color={colors.white} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Modal and Overlay
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  webBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },

  // Menu Container
  menuContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '100%',
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Menu Grid
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  menuItemContainer: {
    width: '48%',
  },
  menuItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Footer
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  settingsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
});