import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch,
  Modal,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PhotoUpload } from '@/components/PhotoUpload';
import { useTheme } from '@/constants/theme';
import { trpc } from '@/lib/trpc';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Camera,
  Edit3,
  Save,
  X,
  ChevronRight,
  Smartphone,
  Globe,
  Moon,
  Sun
} from 'lucide-react-native';

interface EditModalProps {
  visible: boolean;
  title: string;
  value: string;
  onSave: (value: string) => void;
  onClose: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  title,
  value,
  onSave,
  onClose,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Save size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Input
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={placeholder}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry && !showPassword}
              autoFocus
            />
            {secureTextEntry && (
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const { settings, updateSetting } = useSettingsStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  const updateUserMutation = trpc.users.updateUser.useMutation();
  const uploadFileMutation = trpc.media.uploadFile.useMutation();
  const [editModal, setEditModal] = useState<{
    visible: boolean;
    field: string;
    title: string;
    value: string;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
  }>({ 
    visible: false, 
    field: '', 
    title: '', 
    value: '',
    placeholder: '',
    keyboardType: 'default',
    secureTextEntry: false
  });
  


  const openEditModal = (
    field: string, 
    title: string, 
    value: string, 
    placeholder?: string,
    keyboardType?: 'default' | 'email-address' | 'phone-pad',
    secureTextEntry?: boolean
  ) => {
    setEditModal({ 
      visible: true, 
      field, 
      title, 
      value, 
      placeholder,
      keyboardType,
      secureTextEntry
    });
  };

  const closeEditModal = () => {
    setEditModal({ 
      visible: false, 
      field: '', 
      title: '', 
      value: '',
      placeholder: '',
      keyboardType: 'default',
      secureTextEntry: false
    });
  };

  const handleSave = async (value: string) => {
    try {
      if (!user) return;
      
      // In a real app, this would make an API call to update the user data
      const updatedUser = await updateUserMutation.mutateAsync({
        id: user.id,
        [editModal.field]: value,
      });
      
      // Update local store
      updateUser({ ...user, [editModal.field]: value });
      
      Alert.alert('Успешно', 'Данные обновлены');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Ошибка', 'Не удалось обновить данные. Попробуйте еще раз.');
    }
  };
  
  const handlePhotoUpload = async (uri: string) => {
    try {
      if (!user) return;
      
      if (uri === '') {
        // Remove photo
        const updatedUser = await updateUserMutation.mutateAsync({
          id: user.id,
          avatar: '',
        });
        
        updateUser({ ...user, avatar: '' });
        Alert.alert('Успешно', 'Фотография удалена');
        return;
      }
      
      // Upload new photo
      const result = await uploadFileMutation.mutateAsync({
        name: `avatar_${user.id}_${Date.now()}.jpg`,
        type: 'image',
        size: 1024000, // Mock size
        uploadedBy: user.id,
        mimeType: 'image/jpeg',
        data: uri,
      });
      
      // Update user avatar
      const updatedUser = await updateUserMutation.mutateAsync({
        id: user.id,
        avatar: uri, // In production, use result.url
      });
      
      // Update local store
      updateUser({ ...user, avatar: uri });
      
      Alert.alert('Успешно', 'Фотография профиля обновлена!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error; // Re-throw to be handled by PhotoUpload component
    }
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key]);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Смена пароля',
      'Для смены пароля на ваш email будет отправлена ссылка для сброса.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Отправить', 
          onPress: () => Alert.alert('Успешно', 'Ссылка отправлена на ваш email')
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удаление аккаунта',
      'Это действие нельзя отменить. Все ваши данные будут удалены навсегда.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Подтверждение',
              'Вы действительно хотите удалить аккаунт?',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Да, удалить', 
                  style: 'destructive',
                  onPress: () => {
                    // In a real app, this would make an API call
                    logout();
                    router.replace('/login');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    showChevron = true
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && onPress && (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSwitchItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: () => void
  ) => (
    renderSettingItem(
      icon,
      title,
      subtitle,
      undefined,
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : colors.textTertiary}
        ios_backgroundColor={colors.border}
      />,
      false
    )
  );

  if (!user) return null;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Настройки аккаунта',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={() => setShowPhotoModal(true)}>
                <Avatar uri={user.avatar} name={user.name} size={60} />
                <View style={[styles.editAvatarOverlay, { backgroundColor: colors.primary }]}>
                  <Camera size={16} color={colors.white} />
                </View>
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileRole}>{user.rank} • {user.unit}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.editAvatarButton, { backgroundColor: colors.primary + '10' }]}
                onPress={() => setShowPhotoModal(true)}
              >
                <Edit3 size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Личная информация</Text>
          <View style={styles.card}>
            {renderSettingItem(
              <User size={20} color={colors.primary} />,
              'Имя',
              user.name,
              () => openEditModal('name', 'Изменить имя', user.name, 'Введите имя')
            )}
            
            {renderSettingItem(
              <Mail size={20} color={colors.primary} />,
              'Email',
              user.email,
              () => openEditModal('email', 'Изменить email', user.email, 'Введите email', 'email-address')
            )}
            
            {renderSettingItem(
              <Phone size={20} color={colors.primary} />,
              'Телефон',
              user.phone,
              () => openEditModal('phone', 'Изменить телефон', user.phone, 'Введите номер телефона', 'phone-pad')
            )}
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Безопасность</Text>
          <View style={styles.card}>
            {renderSettingItem(
              <Lock size={20} color={colors.primary} />,
              'Изменить пароль',
              'Последнее изменение: 30 дней назад',
              handleChangePassword
            )}
            
            {renderSwitchItem(
              <Shield size={20} color={colors.primary} />,
              'Двухфакторная аутентификация',
              'Дополнительная защита аккаунта',
              settings.twoFactorEnabled,
              () => handleToggleSetting('twoFactorEnabled')
            )}
            
            {Platform.OS !== 'web' && renderSwitchItem(
              <Smartphone size={20} color={colors.primary} />,
              'Биометрическая аутентификация',
              'Вход по отпечатку пальца или Face ID',
              settings.biometricEnabled,
              () => handleToggleSetting('biometricEnabled')
            )}
            
            {renderSwitchItem(
              <Lock size={20} color={colors.primary} />,
              'Автоблокировка',
              'Блокировать приложение при неактивности',
              settings.autoLock,
              () => handleToggleSetting('autoLock')
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уведомления</Text>
          <View style={styles.card}>
            {renderSwitchItem(
              <Bell size={20} color={colors.primary} />,
              'Push-уведомления',
              'Получать уведомления на устройство',
              settings.pushNotifications,
              () => handleToggleSetting('pushNotifications')
            )}
            
            {renderSwitchItem(
              <Mail size={20} color={colors.primary} />,
              'Email-уведомления',
              'Получать уведомления на почту',
              settings.emailNotifications,
              () => handleToggleSetting('emailNotifications')
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки приложения</Text>
          <View style={styles.card}>
            {renderSwitchItem(
              settings.darkMode === true ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />,
              'Темная тема',
              'Использовать темное оформление',
              settings.darkMode === true,
              () => handleToggleSetting('darkMode')
            )}
            
            {renderSettingItem(
              <Globe size={20} color={colors.primary} />,
              'Язык',
              'Русский',
              () => Alert.alert('Язык', 'Смена языка будет доступна в следующих версиях')
            )}
            
            {renderSwitchItem(
              <Smartphone size={20} color={colors.primary} />,
              'Синхронизация данных',
              'Автоматически синхронизировать с сервером',
              settings.dataSync,
              () => handleToggleSetting('dataSync')
            )}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Опасная зона</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.dangerItem}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.dangerText}>Удалить аккаунт</Text>
              <Text style={styles.dangerSubtext}>
                Это действие нельзя отменить. Все данные будут удалены.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <EditModal
        visible={editModal.visible}
        title={editModal.title}
        value={editModal.value}
        onSave={handleSave}
        onClose={closeEditModal}
        placeholder={editModal.placeholder}
        keyboardType={editModal.keyboardType}
        secureTextEntry={editModal.secureTextEntry}
      />
      
      {/* Photo Upload Modal */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Изменить фото профиля</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.photoModalContent}>
            <PhotoUpload
              currentPhoto={user.avatar}
              onPhotoSelected={handlePhotoUpload}
              size={200}
              label="Фотография профиля"
              placeholder="Добавить фото профиля"
            />
            
            <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
              Рекомендуемый размер: 400x400 пикселей{"\n"}
              Поддерживаемые форматы: JPG, PNG
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  profileRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  photoModalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  photoHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerItem: {
    padding: 16,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
  },
  dangerSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    padding: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },
});