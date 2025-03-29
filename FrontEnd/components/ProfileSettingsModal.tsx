import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, Avatar, useTheme } from 'react-native-paper';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';

type ProfileSettingsModalProps = {
  visible: boolean;
  onDismiss: () => void;
};

export default function ProfileSettingsModal({ visible, onDismiss }: ProfileSettingsModalProps) {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      loadProfileData();
    }
  }, [visible]);

  const loadProfileData = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user found when loading profile');
      return;
    }

    try {
      console.log('Loading profile for user:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      console.log('User document reference:', userRef.path);
      
      const userDoc = await getDoc(userRef);
      console.log('Document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('Loaded profile data:', data);
        setFullName(data.fullName || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setProfileImage(data.profileImage || null);
      } else {
        console.log('No profile document found, creating initial profile');
        // Create initial profile document
        const initialData = {
          fullName: '',
          address: '',
          phone: '',
          profileImage: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, initialData);
        setFullName('');
        setAddress('');
        setPhone('');
        setProfileImage(null);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      setError(`Error loading profile data: ${err.message}`);
    }
  };

  const pickImage = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      // Handle file selection
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          const file = target.files[0];
          const reader = new FileReader();

          reader.onload = (event) => {
            if (event.target?.result) {
              setProfileImage(event.target.result as string);
            }
          };

          reader.onerror = (error) => {
            console.error('Error reading file:', error);
            setError('Failed to read image file');
          };

          reader.readAsDataURL(file);
        }
      };

      // Trigger file selection
      input.click();
    } catch (err: any) {
      console.error('Error in pickImage:', err);
      setError('Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!fullName || !address || !phone) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }

      console.log('Starting save process for user:', user.uid);
      console.log('Current profile data:', { fullName, address, phone, profileImage });

      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        fullName,
        address,
        phone,
        profileImage: profileImage,
        updatedAt: new Date().toISOString(),
      };
      console.log('Updating user document with:', updateData);

      await updateDoc(userRef, updateData);
      console.log('Profile updated successfully');

      onDismiss();
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth/login' as any);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }]}
      >
        <ScrollView style={styles.scrollView}>
          <Text variant="headlineSmall" style={styles.title}>Profile Settings</Text>

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
            onPress={handleSave}
            style={styles.button}
            loading={loading}
          >
            Save Changes
          </Button>

          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.button, styles.logoutButton]}
            textColor={theme.colors.error}
          >
            Log Out
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
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
  logoutButton: {
    borderColor: '#B00020',
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
}); 