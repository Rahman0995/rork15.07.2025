import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { ImageGallery } from '@/components/ImageGallery';
import { ImagePickerTest } from '@/components/ImagePickerTest';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { trpc } from '@/lib/trpc';
import { 
  Plus,
  Upload,
  Trash2,
  Download,
  Share,
  Grid3X3,
  List,
  Filter,
  Search
} from 'lucide-react-native';

interface PhotoItem {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  createdAt: string;
  size: number;
  type: string;
}

export default function PhotosScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Mock data - in real app, this would come from tRPC
  const [photos, setPhotos] = useState<PhotoItem[]>([
    {
      id: '1',
      uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      title: 'Профильное фото',
      description: 'Основное фото профиля',
      createdAt: new Date().toISOString(),
      size: 1024000,
      type: 'image/jpeg',
    },
    {
      id: '2',
      uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      title: 'Документ',
      description: 'Скан документа',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      size: 2048000,
      type: 'image/jpeg',
    },
    {
      id: '3',
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      title: 'Групповое фото',
      description: 'Фото с коллегами',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      size: 1536000,
      type: 'image/jpeg',
    },
  ]);
  
  const uploadFileMutation = trpc.media.uploadFile.useMutation();
  const deleteFileMutation = trpc.media.deleteFile.useMutation();

  const handlePhotoUpload = async (uri: string) => {
    try {
      if (!user) return;
      
      const result = await uploadFileMutation.mutateAsync({
        name: `photo_${Date.now()}.jpg`,
        type: 'image',
        size: 1024000, // Mock size
        uploadedBy: user.id,
        mimeType: 'image/jpeg',
        data: uri,
      });
      
      const newPhoto: PhotoItem = {
        id: result.id,
        uri: uri,
        title: 'Новое фото',
        createdAt: new Date().toISOString(),
        size: 1024000,
        type: 'image/jpeg',
      };
      
      setPhotos(prev => [newPhoto, ...prev]);
      Alert.alert('Успешно', 'Фотография загружена!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const handlePhotoDelete = async (photo: PhotoItem, index: number) => {
    try {
      if (!user) return;
      
      await deleteFileMutation.mutateAsync({
        id: photo.id,
        userId: user.id,
      });
      
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      Alert.alert('Успешно', 'Фотография удалена');
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Ошибка', 'Не удалось удалить фотографию');
    }
  };

  const handleBulkDelete = () => {
    if (selectedPhotos.length === 0) return;
    
    Alert.alert(
      'Удалить фотографии',
      `Вы уверены, что хотите удалить ${selectedPhotos.length} фотографий?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete selected photos
              for (const photoId of selectedPhotos) {
                await deleteFileMutation.mutateAsync({
                  id: photoId,
                  userId: user?.id || '',
                });
              }
              
              setPhotos(prev => prev.filter(p => !selectedPhotos.includes(p.id)));
              setSelectedPhotos([]);
              setIsSelectionMode(false);
              Alert.alert('Успешно', 'Фотографии удалены');
            } catch (error) {
              console.error('Error deleting photos:', error);
              Alert.alert('Ошибка', 'Не удалось удалить некоторые фотографии');
            }
          }
        },
      ]
    );
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Мои фотографии
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List size={20} color={colors.text} />
            ) : (
              <Grid3X3 size={20} color={colors.text} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => setIsSelectionMode(!isSelectionMode)}
          >
            <Text style={[styles.headerButtonText, { color: colors.text }]}>
              {isSelectionMode ? 'Отмена' : 'Выбрать'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          {photos.length} фотографий • {formatFileSize(photos.reduce((sum, p) => sum + p.size, 0))}
        </Text>
      </View>
    </View>
  );

  const renderUploadSection = () => (
    <View style={styles.uploadSection}>
      <PhotoUpload
        onPhotoSelected={handlePhotoUpload}
        size={120}
        showLabel={false}
        placeholder="Добавить фото"
      />
    </View>
  );

  const renderSelectionActions = () => {
    if (!isSelectionMode || selectedPhotos.length === 0) return null;
    
    return (
      <View style={[styles.selectionActions, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Text style={[styles.selectionText, { color: colors.text }]}>
          Выбрано: {selectedPhotos.length}
        </Text>
        <View style={styles.selectionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => console.log('Share selected')}
          >
            <Share size={16} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Поделиться</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => console.log('Download selected')}
          >
            <Download size={16} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Скачать</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
            onPress={handleBulkDelete}
          >
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!user) return null;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Фотографии',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {renderHeader()}
          {renderUploadSection()}
          
          <View style={styles.galleryContainer}>
            <ImageGallery
              images={photos.map(photo => ({
                id: photo.id,
                uri: photo.uri,
                title: photo.title,
                description: photo.description,
                createdAt: photo.createdAt,
              }))}
              onImageDelete={handlePhotoDelete}
              columns={viewMode === 'grid' ? 3 : 2}
              spacing={8}
            />
          </View>
        </ScrollView>
        
        {renderSelectionActions()}
      </View>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    marginTop: 4,
  },
  statsText: {
    fontSize: 14,
  },
  uploadSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  galleryContainer: {
    flex: 1,
    padding: 8,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});