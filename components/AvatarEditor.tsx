import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Dimensions,
  PanGestureHandler,
  PinchGestureHandler,
  State
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
  Crop
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
            Перетащите изображение для позиционирования.{\"\\n\"}\n            Используйте жесты для масштабирования.\n          </Text>\n        </View>\n      </View>\n    </Modal>\n  );\n};\n\nconst createStyles = (colors: any) => StyleSheet.create({\n  container: {\n    flex: 1,\n  },\n  header: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'space-between',\n    paddingTop: 50,\n    paddingBottom: 16,\n    paddingHorizontal: 16,\n  },\n  headerButton: {\n    width: 44,\n    height: 44,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  headerTitle: {\n    fontSize: 18,\n    fontWeight: '600',\n  },\n  editorContainer: {\n    flex: 1,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  cropArea: {\n    width: screenWidth,\n    height: screenWidth,\n    position: 'relative',\n  },\n  cropOverlay: {\n    position: 'absolute',\n    top: 0,\n    left: 0,\n    right: 0,\n    bottom: 0,\n    alignItems: 'center',\n    justifyContent: 'center',\n    zIndex: 2,\n  },\n  cropCircle: {\n    borderRadius: 1000,\n    borderWidth: 2,\n    backgroundColor: 'transparent',\n  },\n  imageContainer: {\n    position: 'absolute',\n    top: 0,\n    left: 0,\n    right: 0,\n    bottom: 0,\n    alignItems: 'center',\n    justifyContent: 'center',\n    zIndex: 1,\n  },\n  image: {\n    width: screenWidth,\n    height: screenWidth,\n  },\n  controls: {\n    padding: 20,\n  },\n  controlRow: {\n    flexDirection: 'row',\n    justifyContent: 'space-around',\n    marginBottom: 20,\n  },\n  controlButton: {\n    alignItems: 'center',\n    padding: 8,\n  },\n  controlText: {\n    fontSize: 12,\n    marginTop: 4,\n  },\n  sliderContainer: {\n    marginBottom: 16,\n  },\n  sliderLabel: {\n    fontSize: 14,\n    textAlign: 'center',\n    marginBottom: 8,\n  },\n  sliderTrack: {\n    height: 4,\n    backgroundColor: 'rgba(255, 255, 255, 0.3)',\n    borderRadius: 2,\n    position: 'relative',\n  },\n  sliderThumb: {\n    position: 'absolute',\n    top: -6,\n    width: 16,\n    height: 16,\n    borderRadius: 8,\n    marginLeft: -8,\n  },\n  instructions: {\n    fontSize: 12,\n    textAlign: 'center',\n    lineHeight: 16,\n  },\n});