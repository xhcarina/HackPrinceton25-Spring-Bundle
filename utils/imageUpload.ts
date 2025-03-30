import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface ImageUploadResult {
  uri: string;
  width: number;
  height: number;
}

export const pickImage = async (): Promise<ImageUploadResult | null> => {
  try {
    console.log('Starting image picker...');
    
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Permission result:', permissionResult);
    
    if (!permissionResult.granted) {
      console.log('Permission to access media library was denied');
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    console.log('Image picker result:', result);

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      console.log('Selected image asset:', asset);
      
      // For web platform, we need to handle the URI differently
      const uri = Platform.OS === 'web' 
        ? asset.uri 
        : asset.uri.startsWith('file://') 
          ? asset.uri 
          : `file://${asset.uri}`;

      const imageResult: ImageUploadResult = {
        uri,
        width: asset.width,
        height: asset.height,
      };

      console.log('Processed image result:', imageResult);
      return imageResult;
    }

    console.log('No image selected');
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}; 