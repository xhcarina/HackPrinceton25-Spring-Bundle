import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text, TextInput, Button, useTheme, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { auth, storage, db } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSetupScreen() {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleProfileSetup = async () => {
    if (!fullName || !address || !phone) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      let profileImageUrl = '';
      if (profileImage) {
        // Upload profile image
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const storageRef = ref(storage, `profile_images/${user.uid}`);
        await uploadBytes(storageRef, blob);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      // Save user profile data
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        address,
        phone,
        profileImage: profileImageUrl,
        createdAt: new Date().toISOString(),
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>Complete Your Profile</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Add your information to get started</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.imageContainer}>
          <Avatar.Image
            size={120}
            source={profileImage ? { uri: profileImage } : { uri: 'https://ui-avatars.com/api/?name=' + (fullName || 'User') }}
            style={styles.avatar}
          />
          <Button
            mode="outlined"
            onPress={pickImage}
            style={styles.imageButton}
          >
            Change Photo
          </Button>
        </View>

        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={2}
        />

        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Button
          mode="contained"
          onPress={handleProfileSetup}
          style={styles.button}
          loading={loading}
        >
          Complete Profile
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 12,
  },
  imageButton: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
}); 