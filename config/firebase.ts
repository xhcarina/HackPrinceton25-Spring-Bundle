import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBG93e5r3mrGyxIvzmS79BUheglNJtEm3Y",
  authDomain: "hp25-51ec9.firebaseapp.com",
  projectId: "hp25-51ec9",
  storageBucket: "hp25-51ec9.firebasestorage.app",
  messagingSenderId: "262866145651",
  appId: "1:262866145651:web:d85d297ca705e87c843506"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth, Firestore, and Storage instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 