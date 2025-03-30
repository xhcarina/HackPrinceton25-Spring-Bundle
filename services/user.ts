import { doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { User } from '../types/user';

// Update user profile data in Firestore
export const updateUserProfile = async (
  userId: string,
  userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'password' | 'country' | 'region'>>
): Promise<User> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update the user document with new data
    await updateDoc(userRef, {
      ...userData,
      updated_at: Timestamp.now(),
    });
    
    // Get the updated user data
    const updatedUserDoc = await getDoc(userRef);
    if (!updatedUserDoc.exists()) {
      throw new Error('User document not found after update');
    }
    
    const updatedData = updatedUserDoc.data();
    // Convert Firestore Timestamps to Date objects
    return {
      ...updatedData,
      id: userId,
      created_at: updatedData.created_at.toDate(),
      updated_at: updatedData.updated_at.toDate(),
    } as User;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload profile picture and update user document
export const uploadProfilePicture = async (
  userId: string,
  imageUri: string,
  width: number,
  height: number
): Promise<string> => {
  try {
    // Fetch the image
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `profile_images/${userId}`);
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user document with profile picture info
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profile_picture: {
        uri: downloadURL,
        width,
        height,
      },
      updated_at: Timestamp.now(),
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Get user profile data
export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    return {
      ...userData,
      id: userId,
      created_at: userData.created_at.toDate(),
      updated_at: userData.updated_at.toDate(),
    } as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}; 