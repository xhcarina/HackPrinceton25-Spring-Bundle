import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/auth/profile-setup');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Join us today</Text>

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

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          theme={{ colors: { text: '#fff', placeholder: '#aaa' } }}
        />

        <Button
          mode="contained"
          onPress={handleSignup}
          style={styles.button}
          loading={loading}
          contentStyle={styles.buttonContent}
          buttonColor="#2196F3"
        >
          Sign Up
        </Button>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={styles.footerText}>Already have an account? </Text>
          <Button
            mode="text"
            onPress={() => router.push('/auth/login')}
            style={styles.linkButton}
            textColor="#2196F3"
          >
            Sign In
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