import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TextInput, Alert, ScrollView } from 'react-native';
import { Text } from '../../components/Themed';
import { useTheme } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'expo-router';
import { Dropdown } from '../../components/ui/Dropdown';
import { GenderSchema, type User } from '../../types/user';
import { countries } from 'countries-list';
import { FirebaseError } from 'firebase/app';

export default function SignUpScreen() {
  const { colors, spacing, typography } = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [isLoading, setIsLoading] = useState(false);

  const countryOptions = useMemo(() => {
    return Object.entries(countries)
      .map(([code, country]) => ({
        label: country.name,
        value: code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const regionOptions = useMemo(() => {
    if (!country) return [];
    // For now, we'll use a simple list of common regions
    // In a real app, you would want to use a proper region database
    const commonRegions = [
      { label: 'North', value: 'north' },
      { label: 'South', value: 'south' },
      { label: 'East', value: 'east' },
      { label: 'West', value: 'west' },
      { label: 'Central', value: 'central' },
    ];
    return commonRegions;
  }, [country]);

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setRegion(''); // Reset region when country changes
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    try {
      // Validate all required fields
      if (!email || !password || !confirmPassword || !name || !country || !region) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Validate password
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      setIsLoading(true);

      // Create user data object
      const userData: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        name,
        email,
        country,
        region,
        gender,
        risk_score: 0,
        balance: 0,
      };

      await signUp(email, password, userData);
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Handle Firebase specific errors
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            Alert.alert('Error', 'This email is already registered. Please sign in instead.');
            break;
          case 'auth/invalid-email':
            Alert.alert('Error', 'The email address is invalid.');
            break;
          case 'auth/operation-not-allowed':
            Alert.alert('Error', 'Email/password accounts are not enabled. Please contact support.');
            break;
          case 'auth/weak-password':
            Alert.alert('Error', 'The password is too weak. Please choose a stronger password.');
            break;
          default:
            Alert.alert('Error', 'Failed to create account. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Sign up to get started
      </Text>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          placeholder="Full Name"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.textTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Dropdown
          label="Country"
          value={country}
          onValueChange={handleCountryChange}
          options={countryOptions}
          placeholder="Select your country"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
          }}
          textStyle={{ color: colors.text }}
        />

        <Dropdown
          label="Region/State"
          value={region}
          onValueChange={setRegion}
          options={regionOptions}
          placeholder="Select your region"
          disabled={!country}
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
          }}
          textStyle={{ color: colors.text }}
        />

        <Dropdown
          label="Gender"
          value={gender}
          onValueChange={(value) => setGender(value as typeof gender)}
          options={genderOptions}
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
          }}
          textStyle={{ color: colors.text }}
        />

        <Button
          title="Sign Up"
          onPress={handleSignUp}
          loading={isLoading}
          fullWidth
        />

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Text style={{ color: colors.primary }}>Sign In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
}); 