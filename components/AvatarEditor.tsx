import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/constants/theme';
import { 
  X, 
  Check, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Move,
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface AvatarEditorProps {
  visible: boolean;
  imageUri: string;
  onSave: (editedUri: string) => void;
  onCancel: () => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  visible,
  imageUri,
  onSave,
  onCancel,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  
  const cropSize = screenWidth - 80; // 40px margin on each side
  
  const handleSave = () => {
    // In a real implementation, you would:
    // 1. Apply the transformations to the image
    // 2. Crop the image to the circle
    // 3. Return the processed image URI
    
    // For now, we'll just return the original URI
    onSave(imageUri);
  };
  
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setTranslateX(0);
    setTranslateY(0);
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { backgroundColor: colors.black }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
            <X size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.white }]}>
            Редактировать фото
          </Text>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Check size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Image Editor */}
        <View style={styles.editorContainer}>
          <View style={styles.cropArea}>
            {/* Crop Circle Overlay */}
            <View style={[styles.cropOverlay, { backgroundColor: colors.overlay }]}>
              <View 
                style={[
                  styles.cropCircle, 
                  { 
                    width: cropSize, 
                    height: cropSize,
                    borderColor: colors.white,
                  }
                ]} 
              />
            </View>
            
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.image,
                  {
                    transform: [
                      { scale },
                      { rotate: `${rotation}deg` },
                      { translateX },
                      { translateY },
                    ],
                  },
                ]}
                contentFit="cover"
              />
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: colors.overlay }]}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={handleRotate}>
              <RotateCw size={24} color={colors.white} />
              <Text style={[styles.controlText, { color: colors.white }]}>Повернуть</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
              <ZoomOut size={24} color={colors.white} />
              <Text style={[styles.controlText, { color: colors.white }]}>Уменьшить</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
              <ZoomIn size={24} color={colors.white} />
              <Text style={[styles.controlText, { color: colors.white }]}>Увеличить</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
              <Move size={24} color={colors.white} />
              <Text style={[styles.controlText, { color: colors.white }]}>Сбросить</Text>
            </TouchableOpacity>
          </View>
          
          {/* Scale Slider */}
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, { color: colors.white }]}>
              Масштаб: {Math.round(scale * 100)}%
            </Text>
            <View style={styles.sliderTrack}>
              <View 
                style={[
                  styles.sliderThumb, 
                  { 
                    left: `${((scale - 0.5) / 2.5) * 100}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
          </View>
          
          {/* Instructions */}
          <Text style={[styles.instructions, { color: colors.white + '80' }]}>
            Перетащите изображение для позиционирования.{'\n'}Используйте жесты для масштабирования.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropArea: {
    width: screenWidth,
    height: screenWidth,
    position: 'relative',
  },
  cropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cropCircle: {
    borderRadius: 1000,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  image: {
    width: screenWidth,
    height: screenWidth,
  },
  controls: {
    padding: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
  },
  controlText: {
    fontSize: 12,
    marginTop: 4,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -8,
    marginLeft: -10,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});