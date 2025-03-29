import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Modal, Portal, Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface CreatePostModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function CreatePostModal({ visible, onDismiss }: CreatePostModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // TODO: Add your API call here
    // Example implementation:
    /*
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      formData.append('caption', caption);

      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        // Handle success
        onDismiss();
      }
    } catch (error) {
      console.error('Error uploading post:', error);
    }
    */
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <View style={styles.content}>
          {image ? (
            <Image source={{ uri: image }} style={styles.preview} />
          ) : (
            <Button mode="contained" onPress={pickImage}>
              Select Image
            </Button>
          )}
          <TextInput
            mode="outlined"
            label="Caption"
            value={caption}
            onChangeText={setCaption}
            style={styles.input}
            multiline
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!image || !caption}
          >
            Create Post
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  content: {
    gap: 16,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  input: {
    backgroundColor: 'white',
  },
}); 