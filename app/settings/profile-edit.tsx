import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/constants/theme';
import { trpc } from '@/lib/trpc';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  Award,
  Save,
  X
} from 'lucide-react-native';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    rank: user?.rank || '',
    unit: user?.unit || '',
    avatar: user?.avatar || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const updateUserMutation = trpc.users.update.useMutation();
  const uploadFileMutation = trpc.media.upload.useMutation();

  const handlePhotoUpload = async (uri: string) => {
    try {
      if (!user) return;
      
      if (uri === '') {
        // Remove photo
        setFormData(prev => ({ ...prev, avatar: '' }));
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
      
      setFormData(prev => ({ ...prev, avatar: uri }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error; // Re-throw to be handled by PhotoUpload component
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Ошибка', 'Имя не может быть пустым');
      return;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Ошибка', 'Email не может быть пустым');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Ошибка', 'Введите корректный email адрес');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update user data
      const updatedUser = await updateUserMutation.mutateAsync({
        id: user.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        rank: formData.rank.trim(),
        unit: formData.unit.trim(),
        avatar: formData.avatar,
      });
      
      // Update local store
      updateUser({
        ...user,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        rank: formData.rank.trim(),
        unit: formData.unit.trim(),
        avatar: formData.avatar,
      });
      
      Alert.alert(
        'Успешно', 
        'Профиль обновлен!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Check if there are unsaved changes
    const hasChanges = 
      formData.name !== (user?.name || '') ||
      formData.email !== (user?.email || '') ||
      formData.phone !== (user?.phone || '') ||
      formData.rank !== (user?.rank || '') ||
      formData.unit !== (user?.unit || '') ||
      formData.avatar !== (user?.avatar || '');
    
    if (hasChanges) {
      Alert.alert(
        'Несохраненные изменения',
        'У вас есть несохраненные изменения. Вы уверены, что хотите выйти?',
        [
          { text: 'Остаться', style: 'cancel' },
          { text: 'Выйти', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (!user) return null;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Редактировать профиль',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <Button
              title="Отмена"
              onPress={handleCancel}
              variant="outline"
              size="small"
              textStyle={{ color: colors.text }}
            />
          ),
          headerRight: () => (
            <Button
              title="Сохранить"
              onPress={handleSave}
              variant="outline"
              size="small"
              disabled={isLoading}
              textStyle={{ color: colors.primary }}
            />
          ),
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <PhotoUpload
              currentPhoto={formData.avatar}
              onPhotoSelected={handlePhotoUpload}
              size={140}
              label="Фотография профиля"
              placeholder="Добавить фото"
              enableEditor={true}
              isAvatar={true}
            />
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <User size={20} color={colors.primary} />
                <Text style={[styles.inputLabel, { color: colors.text }]}>Имя *</Text>
              </View>
              <Input
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Введите ваше имя"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Mail size={20} color={colors.primary} />
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email *</Text>
              </View>
              <Input
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Введите email адрес"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Phone size={20} color={colors.primary} />
                <Text style={[styles.inputLabel, { color: colors.text }]}>Телефон</Text>
              </View>
              <Input
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Введите номер телефона"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Award size={20} color={colors.primary} />
                <Text style={[styles.inputLabel, { color: colors.text }]}>Звание</Text>
              </View>
              <Input
                value={formData.rank}
                onChangeText={(text) => setFormData(prev => ({ ...prev, rank: text }))}
                placeholder="Введите звание"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Briefcase size={20} color={colors.primary} />
                <Text style={[styles.inputLabel, { color: colors.text }]}>Подразделение</Text>
              </View>
              <Input
                value={formData.unit}
                onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                placeholder="Введите подразделение"
                style={styles.input}
              />
            </View>
          </View>

          {/* Required Fields Note */}
          <View style={styles.noteSection}>
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              * Обязательные поля
            </Text>
          </View>

          {/* Save Button */}
          <View style={styles.buttonSection}>
            <Button
              title={isLoading ? "Сохранение..." : "Сохранить изменения"}
              onPress={handleSave}
              disabled={isLoading}
              style={styles.saveButton}
              icon={<Save size={20} color={colors.white} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  formSection: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
  },
  noteSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  buttonSection: {
    paddingHorizontal: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});