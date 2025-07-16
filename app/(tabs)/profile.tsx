import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform, ActionSheetIOS, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ThemeDemo } from '@/components/ThemeDemo';
import { trpc } from '@/lib/trpc';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Settings, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Server,
  Camera,
  Image as ImageIcon,
  Edit3
} from 'lucide-react-native';
import { notifyGlobalScroll } from './_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const updateUserMutation = trpc.users.update.useMutation();
  const uploadFileMutation = trpc.media.upload.useMutation();
  
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
  
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Разрешения необходимы',
          'Для загрузки фотографий необходимо разрешение на доступ к камере и галерее.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };
  
  const uploadPhoto = async (uri: string) => {
    try {
      setIsUploadingPhoto(true);
      
      // In a real app, you would upload the image to your server/cloud storage
      // For now, we'll simulate the upload and use the URI directly
      const result = await uploadFileMutation.mutateAsync({
        name: `avatar_${user?.id}_${Date.now()}.jpg`,
        type: 'image',
        size: 1024000, // Mock size
        uploadedBy: user?.id || '',
        mimeType: 'image/jpeg',
        data: uri,
      });
      
      // Update user avatar
      if (user) {
        const updatedUser = await updateUserMutation.mutateAsync({
          id: user.id,
          avatar: uri, // In production, use result.url
        });
        
        // Update local store
        updateUser({ ...user, avatar: uri });
        
        Alert.alert('Успешно', 'Фотография профиля обновлена!');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить фотографию. Попробуйте еще раз.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  
  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение.');
    }
  };
  
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фотографию.');
    }
  };
  
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    notifyGlobalScroll(currentScrollY);
  };
  
  const showPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Отмена', 'Сделать фото', 'Выбрать из галереи'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Изменить фото профиля',
        'Выберите способ загрузки фотографии',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Сделать фото', onPress: takePhoto },
          { text: 'Выбрать из галереи', onPress: pickImageFromLibrary },
        ]
      );
    }
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
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar 
            uri={user.avatar} 
            name={user.name} 
            size={120} 
          />
          <TouchableOpacity 
            style={[styles.editPhotoButton, { backgroundColor: colors.primary }]}
            onPress={showPhotoOptions}
            disabled={isUploadingPhoto}
          >
            {isUploadingPhoto ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Edit3 size={16} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.rank, { color: colors.primary }]}>{user.rank}</Text>
        <Text style={[styles.unit, { color: colors.textSecondary }]}>{user.unit}</Text>
        
        <TouchableOpacity 
          style={[styles.editProfileButton, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
          onPress={() => router.push('/settings/profile-edit')}
        >
          <Edit3 size={16} color={colors.primary} />
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Редактировать профиль</Text>
        </TouchableOpacity>
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
      
      <ThemeDemo />
      
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
          <Server size={20} color={colors.primary} />,
          'Тест подключения',
          () => router.push('/settings/backend-test')
        )}
        
        {renderMenuItem(
          <ImageIcon size={20} color={colors.primary} />,
          'Мои фотографии',
          () => router.push('/settings/photos')
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
    borderColor: colors.background,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: -0.3,
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  themeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 20,
  },
});