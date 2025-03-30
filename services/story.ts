import { collection, addDoc, Timestamp, getDocs, query, orderBy, getDoc, doc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface StoryData {
  title: string;
  description: string;
  imageUri: string;
  loanId: string;
  userId: string;
  purpose: string;
  amount: number;
  currency: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  loanId: string;
  user_id: string;
  purpose: string;
  amount: number;
  currency: string;
  created_at: Date;
  likes: number;
  comments: Comment[];
  userName?: string;
  userLocation?: string;
}

interface Comment {
  id: string;
  user_id: string;
  text: string;
  created_at: Date;
  userName?: string;
}

interface UserData extends DocumentData {
  name?: string;
  country?: string;
}

const uploadImageToStorage = async (uri: string, userId: string): Promise<string> => {
  try {
    console.log('Uploading image to Firebase Storage...');
    
    // Fetch the image
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a unique filename
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, `stories/${userId}/${fileName}`);
    
    // Upload to Firebase Storage
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Image uploaded successfully');
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadStory = async (data: StoryData) => {
  try {
    console.log('Starting story upload process...', { userId: data.userId });
    
    // Upload image to Firebase Storage
    const imageUrl = await uploadImageToStorage(data.imageUri, data.userId);
    console.log('Image uploaded to storage:', imageUrl);

    // Create the story document
    console.log('Creating story document...');
    const storiesRef = collection(db, 'stories');
    const storyDoc = await addDoc(storiesRef, {
      title: data.title,
      description: data.description,
      imageUrl,
      loanId: data.loanId,
      user_id: data.userId,
      purpose: data.purpose,
      amount: data.amount,
      currency: data.currency,
      created_at: Timestamp.now(),
      likes: 0,
      comments: [],
      status: 'active'
    });

    console.log('Story uploaded successfully:', storyDoc.id);
    return storyDoc.id;
  } catch (error) {
    console.error('Error in uploadStory:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload story');
  }
};

export const getStories = async (): Promise<Story[]> => {
  try {
    console.log('Fetching stories...');
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const stories: Story[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      // Get user details
      const userDocRef = doc(db, 'users', data.user_id);
      const userDocSnapshot = await getDoc(userDocRef);
      const userData = userDocSnapshot.data() as UserData | undefined;
      
      stories.push({
        id: docSnapshot.id,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        loanId: data.loanId,
        user_id: data.user_id,
        purpose: data.purpose,
        amount: data.amount,
        currency: data.currency,
        created_at: (data.created_at as Timestamp).toDate(),
        likes: data.likes,
        comments: (data.comments || []).map((comment: any) => ({
          ...comment,
          created_at: (comment.created_at as Timestamp).toDate()
        })),
        userName: userData?.name || 'Anonymous',
        userLocation: userData?.country || 'Unknown Location'
      });
    }
    
    console.log(`Fetched ${stories.length} stories`);
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw new Error('Failed to fetch stories');
  }
}; 