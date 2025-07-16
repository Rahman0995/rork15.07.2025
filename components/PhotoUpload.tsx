import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActionSheetIOS, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useTheme } from '@/constants/theme';
import { AvatarEditor } from './AvatarEditor';
import { Camera, ImageIcon, Upload, X, Edit } from 'lucide-react-native';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoSelected: (uri: string) => Promise<void>;
  size?: number;
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
  enableEditor?: boolean;
  isAvatar?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhoto,
  onPhotoSelected,
  size = 120,
  showLabel = true,
  label = 'Фотография',
  placeholder = 'Добавить фото',
  disabled = false,
  style,
  enableEditor = false,
  isAvatar = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

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

  const handlePhotoUpload = async (uri: string) => {
    try {
      setIsUploading(true);
      await onPhotoSelected(uri);
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить фотографию. Попробуйте еще раз.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleImageSelected = async (uri: string) => {
    if (enableEditor && isAvatar) {
      setPendingImageUri(uri);
      setShowEditor(true);
    } else {
      await handlePhotoUpload(uri);
    }
  };
  
  const handleEditorSave = async (editedUri: string) => {
    setShowEditor(false);
    setPendingImageUri(null);
    await handlePhotoUpload(editedUri);
  };
  
  const handleEditorCancel = () => {
    setShowEditor(false);
    setPendingImageUri(null);
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
        await handleImageSelected(result.assets[0].uri);
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
        await handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фотографию.');
    }
  };

  const showPhotoOptions = () => {
    if (disabled || isUploading) return;
    
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
        'Выбрать фотографию',
        'Выберите способ загрузки фотографии',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Сделать фото', onPress: takePhoto },
          { text: 'Выбрать из галереи', onPress: pickImageFromLibrary },
        ]
      );
    }
  };

  const removePhoto = () => {
    Alert.alert(
      'Удалить фотографию',
      'Вы уверены, что хотите удалить эту фотографию?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => handlePhotoUpload('') },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.photoContainer,
          { 
            width: size, 
            height: size, 
            borderColor: colors.border,
            backgroundColor: currentPhoto ? 'transparent' : colors.backgroundSecondary 
          }
        ]}
        onPress={showPhotoOptions}
        disabled={disabled || isUploading}
      >
        {currentPhoto ? (
          <>
            <Image
              source={{ uri: currentPhoto }}
              style={[styles.photo, { width: size, height: size }]}
              contentFit="cover"
              transition={200}
            />
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Camera size={24} color={colors.white} />
              )}
            </View>
            {!isUploading && (
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.error }]}
                onPress={removePhoto}
              >
                <X size={12} color={colors.white} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            {isUploading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Upload size={32} color={colors.primary} />
                </View>
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  {placeholder}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
      
      {enableEditor && pendingImageUri && (
        <AvatarEditor
          visible={showEditor}
          imageUri={pendingImageUri}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  photoContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    borderRadius: 14,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});