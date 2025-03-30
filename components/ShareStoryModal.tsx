import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ShareStoryModalProps {
  visible: boolean;
  onClose: () => void;
  loan: {
    purpose: string;
    currency: string;
    loaned_amount: number;
  };
  onShare: (data: {
    title: string;
    description: string;
    imageUri: string;
  }) => Promise<void>;
}

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

export default function ShareStoryModal({
  visible,
  onClose,
  loan,
  onShare,
}: ShareStoryModalProps) {
  const { colors, typography, spacing } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const validateImage = async (uri: string): Promise<boolean> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      if (blob.size > MAX_IMAGE_SIZE) {
        Alert.alert(
          'Image Too Large',
          'Please choose an image smaller than 1MB'
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload photos!'
          );
          return;
        }
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduce quality to help with size
      });

      if (!result.canceled && result.assets[0].uri) {
        const isValid = await validateImage(result.assets[0].uri);
        if (isValid) {
          setImageUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error',
        'Could not load the selected image. Please try another one.'
      );
    }
  };

  const handleShare = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your story.');
      return;
    }
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image for your story.');
      return;
    }

    try {
      setIsSharing(true);
      
      // Validate image again before sharing
      const isValid = await validateImage(imageUri);
      if (!isValid) {
        return;
      }

      await onShare({
        title: title.trim(),
        description: description.trim(),
        imageUri,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setImageUri(null);
      onClose();
    } catch (error) {
      console.error('Error sharing story:', error);
      Alert.alert(
        'Error',
        'Failed to share your story. Please try again.'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: spacing.lg,
      width: '90%',
      maxWidth: 400,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.text,
    },
    subtitle: {
      fontSize: typography.sizes.base,
      color: colors.text,
      opacity: 0.7,
      marginBottom: spacing.base,
    },
    imageContainer: {
      aspectRatio: 4/3,
      backgroundColor: colors.background,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: spacing.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    uploadText: {
      color: colors.primary,
      fontSize: typography.sizes.base,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: spacing.base,
      color: colors.text,
      fontSize: typography.sizes.base,
      marginBottom: spacing.base,
    },
    descriptionInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    shareButton: {
      backgroundColor: colors.primary,
      padding: spacing.base,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: spacing.base,
    },
    shareButtonText: {
      color: colors.background,
      fontSize: typography.sizes.base,
      fontWeight: '600',
    },
    closeButton: {
      marginTop: spacing.base,
      padding: spacing.base,
      alignItems: 'center',
    },
    closeButtonText: {
      color: colors.text,
      fontSize: typography.sizes.base,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Your Story</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {`${loan.purpose} - ${loan.currency} ${loan.loaned_amount.toFixed(2)}`}
          </Text>

          <TouchableOpacity
            style={styles.imageContainer}
            onPress={pickImage}
            disabled={isSharing}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.uploadButton}>
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                <Text style={styles.uploadText}>Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            editable={!isSharing}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Share your story..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.textSecondary}
            editable={!isSharing}
          />

          <TouchableOpacity
            style={[styles.shareButton, isSharing && { opacity: 0.7 }]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.shareButtonText}>Share Story</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isSharing}
          >
            <Text style={[
              styles.closeButtonText,
              isSharing && { opacity: 0.7 }
            ]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 