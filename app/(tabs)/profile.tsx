import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  Camera,
  Moon,
  Sun,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = createStyles(colors);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const ProfileItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    rightComponent,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.profileItemIcon}>
          <Icon size={18} color={colors.primary} />
        </View>
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.profileItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.profileItemRight}>
        {rightComponent}
        {showChevron && onPress && (
          <ChevronRight size={16} color={colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Требуется авторизация</Text>
          <Button
            title="Войти"
            onPress={() => router.push('/login')}
            style={styles.authButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar
              size={80}
              name={user.name}
              imageUrl={user.avatar}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => router.push('/settings/photos')}
            >
              <Camera size={16} color={colors.card} />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRank}>{user.rank}</Text>
            <Text style={styles.userUnit}>{user.unit}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/settings/profile-edit')}
          >
            <Edit3 size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Редактировать</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <ProfileSection title="Аккаунт">
          <ProfileItem
            icon={User}
            title="Личная информация"
            subtitle="Управление профилем и данными"
            onPress={() => router.push('/settings/account')}
          />
          <ProfileItem
            icon={Shield}
            title="Приватность и безопасность"
            subtitle="Настройки конфиденциальности"
            onPress={() => router.push('/settings/privacy')}
          />
        </ProfileSection>

        {/* Preferences Section */}
        <ProfileSection title="Настройки">
          <ProfileItem
            icon={Bell}
            title="Уведомления"
            subtitle="Управление уведомлениями"
            onPress={() => router.push('/settings/notifications')}
          />
          <ProfileItem
            icon={isDark ? Sun : Moon}
            title="Тема оформления"
            subtitle={isDark ? 'Темная тема' : 'Светлая тема'}
            onPress={toggleTheme}
            showChevron={false}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            }
          />
        </ProfileSection>

        {/* Support Section */}
        <ProfileSection title="Поддержка">
          <ProfileItem
            icon={HelpCircle}
            title="Помощь и поддержка"
            subtitle="FAQ, контакты поддержки"
            onPress={() => router.push('/settings/help')}
          />
        </ProfileSection>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={18} color={colors.error} />
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Версия приложения: 1.0.7</Text>
          <Text style={styles.appInfoText}>© 2024 Military Unit Management</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  authButton: {
    minWidth: 120,
  },

  // Header Styles
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userRank: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  userUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Section Styles
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  // Profile Item Styles
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Logout Section
  logoutSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.errorSoft,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },

  // App Info
  appInfo: {
    marginTop: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
});