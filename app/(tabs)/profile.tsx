import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { ThemeSelector } from '@/components/ThemeSelector';
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
  const { colors } = useTheme();
  
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
    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={[styles.menuItemText, { color: colors.text }]}>{title}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
  
  if (!user) return null;
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Avatar 
          uri={user.avatar} 
          name={user.name} 
          size={100} 
        />
        <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.rank, { color: colors.primary }]}>{user.rank}</Text>
        <Text style={[styles.unit, { color: colors.textSecondary }]}>{user.unit}</Text>
      </View>
      
      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <View style={styles.infoItem}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '10' }]}>
            <User size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Должность</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user.role === 'battalion_commander' ? 'Командир батальона' :
               user.role === 'company_commander' ? 'Командир роты' :
               user.role === 'officer' ? 'Офицер' :
               user.role === 'soldier' ? 'Военнослужащий' : 'Администратор'}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '10' }]}>
            <Mail size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '10' }]}>
            <Phone size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Телефон</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.phone}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '10' }]}>
            <Shield size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Уровень доступа</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user.role === 'battalion_commander' ? 'Высокий' :
               user.role === 'company_commander' ? 'Средний' :
               user.role === 'officer' ? 'Базовый' :
               user.role === 'soldier' ? 'Ограниченный' : 'Полный'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Настройки</Text>
      
      <View style={[styles.themeCard, { backgroundColor: colors.card }]}>
        <ThemeSelector />
      </View>
      
      <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
        {renderMenuItem(
          <Settings size={20} color={colors.primary} />,
          'Настройки аккаунта',
          () => router.push('/settings/account')
        )}
        
        {renderMenuItem(
          <Bell size={20} color={colors.primary} />,
          'Настройки уведомлений',
          () => router.push('/settings/notifications')
        )}
        
        {renderMenuItem(
          <HelpCircle size={20} color={colors.primary} />,
          'Помощь и поддержка',
          () => router.push('/settings/help')
        )}
      </View>
      
      <Button
        title="Выйти из системы"
        onPress={handleLogout}
        variant="outline"
        style={[styles.logoutButton, { borderColor: colors.error }]}
        textStyle={{ color: colors.error }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 16,
  },
  rank: {
    fontSize: 16,
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
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
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuCard: {
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
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
  },
});