import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/constants/theme';
import { 
  X, 
  Download, 
  Share, 
  Trash2, 
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageItem {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  createdAt?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onImagePress?: (image: ImageItem, index: number) => void;
  onImageDelete?: (image: ImageItem, index: number) => void;
  columns?: number;
  spacing?: number;
  showActions?: boolean;
  style?: any;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImagePress,
  onImageDelete,
  columns = 3,
  spacing = 4,
  showActions = true,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selectedImage, setSelectedImage] = useState<{ image: ImageItem; index: number } | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const imageSize = (screenWidth - (spacing * (columns + 1))) / columns;

  const handleImagePress = (image: ImageItem, index: number) => {
    if (onImagePress) {
      onImagePress(image, index);
    } else {
      setSelectedImage({ image, index });
      setShowFullscreen(true);
    }
  };

  const handleDeleteImage = (image: ImageItem, index: number) => {
    Alert.alert(
      'Удалить изображение',
      'Вы уверены, что хотите удалить это изображение?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            if (onImageDelete) {
              onImageDelete(image, index);
            }
            setShowFullscreen(false);
            setSelectedImage(null);
          }
        },
      ]
    );
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = selectedImage.index;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage({ image: images[newIndex], index: newIndex });
  };

  const renderImageGrid = () => (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.gridContainer}
    >
      {images.map((image, index) => (
        <TouchableOpacity
          key={image.id}
          style={[
            styles.imageContainer,
            {
              width: imageSize,
              height: imageSize,
              marginLeft: spacing,
              marginBottom: spacing,
            }
          ]}
          onPress={() => handleImagePress(image, index)}
        >
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <View style={[styles.imageOverlay, { backgroundColor: colors.overlay }]}>
            <ZoomIn size={20} color={colors.white} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFullscreenModal = () => (
    <Modal
      visible={showFullscreen}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setShowFullscreen(false)}
    >
      <View style={[styles.fullscreenContainer, { backgroundColor: colors.black }]}>
        {/* Header */}
        <View style={[styles.fullscreenHeader, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFullscreen(false)}
          >
            <X size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.white }]}>
              {selectedImage?.image.title || `${(selectedImage?.index || 0) + 1} из ${images.length}`}
            </Text>
            {selectedImage?.image.createdAt && (
              <Text style={[styles.headerSubtitle, { color: colors.white + '80' }]}>
                {new Date(selectedImage.image.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
          
          {showActions && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                // Show action sheet with more options
                if (Platform.OS === 'ios') {
                  // iOS Action Sheet implementation
                } else {
                  Alert.alert(
                    'Действия',
                    'Выберите действие',
                    [
                      { text: 'Отмена', style: 'cancel' },
                      { text: 'Поделиться', onPress: () => console.log('Share') },
                      { text: 'Скачать', onPress: () => console.log('Download') },
                      { 
                        text: 'Удалить', 
                        style: 'destructive',
                        onPress: () => selectedImage && handleDeleteImage(selectedImage.image, selectedImage.index)
                      },
                    ]
                  );
                }
              }}
            >
              <MoreHorizontal size={24} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Image */}
        <View style={styles.imageViewContainer}>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage.image.uri }}
              style={styles.fullscreenImage}
              contentFit="contain"
              transition={300}
            />
          )}
        </View>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => navigateImage('prev')}
            >
              <ChevronLeft size={32} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => navigateImage('next')}
            >
              <ChevronRight size={32} color={colors.white} />
            </TouchableOpacity>
          </>
        )}

        {/* Bottom Info */}
        {selectedImage?.image.description && (
          <View style={[styles.fullscreenFooter, { backgroundColor: colors.overlay }]}>
            <Text style={[styles.descriptionText, { color: colors.white }]}>
              {selectedImage.image.description}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );

  if (images.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Нет изображений для отображения
        </Text>
      </View>
    );
  }

  return (
    <>
      {renderImageGrid()}
      {renderFullscreenModal()}
    </>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  imageViewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  fullscreenFooter: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});