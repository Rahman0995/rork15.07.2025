import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Settings, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const handleLogout = () => {
    Alert.alert(
      'Выход из системы',
      'Вы уверены, что хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };
  
  const renderMenuItem = (icon: React.ReactNode, title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
  
  if (!user) return null;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Avatar 
          uri={user.avatar} 
          name={user.name} 
          size={100} 
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.rank}>{user.rank}</Text>
        <Text style={styles.unit}>{user.unit}</Text>
      </View>
      
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <User size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Должность</Text>
            <Text style={styles.infoValue}>
              {user.role === 'admin' ? 'Администратор' :
               user.role === 'officer' ? 'Офицер' :
               'Военнослужащий'}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Mail size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Phone size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Телефон</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Shield size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Уровень доступа</Text>
            <Text style={styles.infoValue}>
              {user.role === 'admin' ? 'Полный' :
               user.role === 'officer' ? 'Базовый' :
               'Ограниченный'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Настройки</Text>
      
      <View style={styles.menuCard}>
        {renderMenuItem(
          <Settings size={20} color={colors.primary} />,
          'Настройки аккаунта',
          () => {}
        )}
        
        {renderMenuItem(
          <Bell size={20} color={colors.primary} />,
          'Настройки уведомлений',
          () => router.push('/settings/notifications')
        )}
        
        {renderMenuItem(
          <HelpCircle size={20} color={colors.primary} />,
          'Помощь и поддержка',
          () => {}
        )}
      </View>
      
      <Button
        title="Выйти из системы"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
        textStyle={{ color: colors.error }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  rank: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    borderColor: colors.error,
  },
});