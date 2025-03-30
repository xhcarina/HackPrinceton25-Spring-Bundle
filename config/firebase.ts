import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBCJB9qH19OegpsC9fZsdXMdrMvELlcL4M",
  authDomain: "bundle-d7d11.firebaseapp.com",
  projectId: "bundle-d7d11",
  storageBucket: "bundle-d7d11.firebasestorage.app",
  messagingSenderId: "789680262808",
  appId: "1:789680262808:web:ecc38cf7255ea3d74b8aed",
  measurementId: "G-07SGPB60QD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth, Firestore, and Storage instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 