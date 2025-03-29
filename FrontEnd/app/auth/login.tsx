import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { doc, getDoc, setDoc } from 'firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({
  native: 'myapp://'
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '262866145651-ch0f84na0lro29ob5rfv98ae24fe9pv8.apps.googleusercontent.com',
    redirectUri: 'http://localhost:8081',
    scopes: ['profile', 'email'],
    responseType: 'token',
    usePKCE: false
  });

  useEffect(() => {
    let mounted = true;

    const handleResponse = async () => {
      if (response?.type === 'success' && mounted) {
        try {
          console.log('Google auth response:', response);
          if (!response.authentication?.accessToken) {
            console.error('No access token in response:', response);
            throw new Error('No access token received from Google');
          }
          await handleGoogleSignIn(response.authentication.accessToken);
        } catch (err) {
          console.error('Detailed error handling Google sign in:', err);
          if (mounted) {
            setError(err instanceof Error ? err.message : 'Failed to complete Google sign in');
          }
        }
      } else if (response?.type === 'error') {
        console.error('Google auth error:', response.error);
        if (mounted) {
          setError(response.error?.message || 'Authentication failed');
        }
      }
    };

    handleResponse();

    return () => {
      mounted = false;
    };
  }, [response]);

  const handleGoogleSignIn = async (accessToken: string) => {
    try {
      setLoading(true);
      setError('');

      console.log('Creating Google credential...');
      // Create a Google credential with the access token
      const credential = GoogleAuthProvider.credential(null, accessToken);
      
      console.log('Signing in with credential...');
      // Sign in with the credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      console.log('User signed in:', user.email);

      // Split the display name into first and last name
      const fullName = user.displayName || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      console.log('Checking user profile...');
      // Check if user profile exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.log('Creating new user profile...');
        // Create new user profile with first and last name
        await setDoc(userRef, {
          firstName,
          lastName,
          fullName,
          email: user.email,
          profileImage: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        console.log('Updating existing user profile...');
        // Update existing user profile with first and last name
        await setDoc(userRef, {
          firstName,
          lastName,
          fullName,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      console.log('Closing auth session...');
      // Close the popup window if it exists
      if (WebBrowser.maybeCompleteAuthSession) {
        WebBrowser.maybeCompleteAuthSession();
      }

      console.log('Waiting for auth state update...');
      // Wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Navigating to main app...');
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Detailed Google sign in error:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await promptAsync();
    } catch (err) {
      console.error('Error starting Google login:', err);
      setError('Failed to start Google login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Sign in to continue</Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          theme={{ colors: { text: '#fff', placeholder: '#aaa' } }}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          theme={{ colors: { text: '#fff', placeholder: '#aaa' } }}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          contentStyle={styles.buttonContent}
          buttonColor="#2196F3"
        >
          Sign In
        </Button>

        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <Divider style={styles.divider} />
        </View>

        <Button
          mode="outlined"
          onPress={handleGoogleLogin}
          style={styles.googleButton}
          contentStyle={styles.buttonContent}
          icon="google"
          textColor="#fff"
          disabled={loading}
        >
          Continue with Google
        </Button>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={styles.footerText}>Don't have an account? </Text>
          <Button
            mode="text"
            onPress={() => router.push('/auth/signup')}
            style={styles.linkButton}
            textColor="#2196F3"
          >
            Sign Up
          </Button>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#aaa',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2D2D2D',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  googleButton: {
    marginTop: 16,
    borderColor: '#4285F4',
    backgroundColor: '#4285F4',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#aaa',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#aaa',
  },
  linkButton: {
    margin: 0,
    padding: 0,
  },
  error: {
    color: '#CF6679',
    textAlign: 'center',
    marginBottom: 16,
  },
}); 