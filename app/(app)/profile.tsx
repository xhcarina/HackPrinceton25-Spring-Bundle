import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { updateUserProfile, uploadProfilePicture } from '../../services/user';
import { User, GenderSchema } from '../../types/user';
import { z } from 'zod';
import { Dropdown } from '../../components/ui/Dropdown';

export default function ProfileScreen() {
  const { user, updateUserData } = useAuth();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState(user?.gender || 'prefer_not_to_say');
  
  // Form validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Reset form with user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setGender(user.gender);
    }
  }, [user]);
  
  // Handle profile picture selection
  const handleImagePick = async () => {
    if (isUploading || !user) return;
    
    try {
      setIsUploading(true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }
      
      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        const { uri, width, height } = result.assets[0];
        try {
          // Upload to Firebase Storage and update user profile
          await uploadProfilePicture(user.id, uri, width, height);
          
          // Refresh user data
          const updatedUser = {
            ...user,
            profile_picture: {
              uri,
              width,
              height,
            },
          };
          updateUserData(updatedUser);
          
          Alert.alert('Success', 'Profile picture updated successfully');
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          Alert.alert('Error', 'Failed to update profile picture. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const handleUpdateProfile = async () => {
    if (isLoading || !user) return;
    
    // Reset errors
    setNameError('');
    setEmailError('');
    
    // Validate inputs
    try {
      z.string().min(1, 'Name is required').parse(name);
      z.string().email('Invalid email address').parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path[0] === 'name') setNameError(err.message);
          if (err.path[0] === 'email') setEmailError(err.message);
        });
        return;
      }
    }
    
    try {
      setIsLoading(true);
      
      // Update profile in Firestore
      const updatedUser = await updateUserProfile(user.id, {
        name,
        email,
        gender: gender as z.infer<typeof GenderSchema>,
      });
      
      // Update local user data
      updateUserData(updatedUser);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderProfileImage = () => {
    if (isUploading) {
      return (
        <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    
    if (user?.profile_picture?.uri) {
      return (
        <Image
          source={{ uri: user.profile_picture.uri }}
          style={styles.profileImage}
        />
      );
    }
    
    return (
      <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
        <Text style={styles.profileImagePlaceholderText}>
          {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
        </Text>
      </View>
    );
  };
  
  // Gender dropdown options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
      </View>
      
      <View style={styles.profileImageContainer}>
        {renderProfileImage()}
        <TouchableOpacity
          style={styles.editImageButton}
          onPress={handleImagePick}
          disabled={isUploading}
        >
          <Ionicons name="camera" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          error={nameError}
          autoCapitalize="words"
        />
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <Dropdown
            label="Gender"
            value={gender}
            options={genderOptions}
            onValueChange={(value) => setGender(value as z.infer<typeof GenderSchema>)}
            placeholder="Select gender"
          />
        </View>
        
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color={colors.textSecondary} />
            <Text style={styles.locationText}>
              {user?.region}, {user?.country} (Cannot be changed)
            </Text>
          </View>
        </View>
        
        <Button
          title={isLoading ? 'Updating...' : 'Update Profile'}
          onPress={handleUpdateProfile}
          disabled={isLoading}
          loading={isLoading}
          fullWidth
          style={styles.updateButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    backgroundColor: '#E1E1E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: '600',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  locationSection: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  updateButton: {
    marginTop: 24,
  },
}); 