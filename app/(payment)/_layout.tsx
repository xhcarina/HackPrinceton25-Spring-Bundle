import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function PaymentLayout() {
  const { user, isLoading } = useAuth();

  // Show nothing while checking authentication state
  if (isLoading) {
    return null;
  }

  // If no user is signed in, redirect to the sign-in screen
  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
} 