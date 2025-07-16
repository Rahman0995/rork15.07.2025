import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useTheme } from '@/constants/theme';

export const ImagePickerTest: React.FC = () => {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testImagePicker = async () => {
    try {
      setIsLoading(true);
      
      // Check MediaType availability
      console.log('ImagePicker.MediaType:', ImagePicker.MediaType);
      console.log('Available MediaTypes:', Object.keys(ImagePicker.MediaType));
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera roll permissions to make this work!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('ImagePicker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        Alert.alert('Success', 'Image selected successfully!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', `Failed to pick image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Image Picker Test</Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={testImagePicker}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, { color: colors.white }]}>
          {isLoading ? 'Loading...' : 'Test Image Picker'}
        </Text>
      </TouchableOpacity>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Selected Image:</Text>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});