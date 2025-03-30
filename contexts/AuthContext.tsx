import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { User, UserSchema } from '../types/user';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  updateUserData: (userData: User) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This hook can be used to access the user info.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(app)');
    }
  }, [user, segments]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Convert Firestore Timestamps to Dates
            const user: User = {
              ...userData,
              id: firebaseUser.uid,
              created_at: (userData.created_at as Timestamp).toDate(),
              updated_at: (userData.updated_at as Timestamp).toDate(),
            } as User;
            setUser(user);
          } else {
            // Handle case where user auth exists but no Firestore document
            console.error('User document not found in Firestore');
            await firebaseSignOut(auth);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data();
      const user: User = {
        ...userData,
        id: userCredential.user.uid,
        created_at: (userData.created_at as Timestamp).toDate(),
        updated_at: (userData.updated_at as Timestamp).toDate(),
      } as User;
      
      setUser(user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Prepare user data for Firestore
      const newUser = {
        ...userData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

      // Get the complete user data
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const completeUserData = userDoc.data();
      
      // Set user state
      const user: User = {
        ...completeUserData,
        id: userCredential.user.uid,
        created_at: (completeUserData?.created_at as Timestamp).toDate(),
        updated_at: (completeUserData?.updated_at as Timestamp).toDate(),
      } as User;
      
      setUser(user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add updateUserData function
  const updateUserData = (userData: User) => {
    setUser(userData);
  };

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setUser({
          id: userDoc.id,
          ...userDoc.data()
        } as User);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  }, [user?.id]);

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading, updateUserData, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
} 