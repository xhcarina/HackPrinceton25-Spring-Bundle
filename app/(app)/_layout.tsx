import { Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../constants/theme';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  
  // Show nothing while checking authentication state
  if (isLoading) {
    return null;
  }

  // If no user is signed in, redirect to the sign-in screen
  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        headerRight: () => (
          <Link href="/(app)/profile" asChild>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          </Link>
        ),
      }}
    >
      <Tabs.Screen
        name="stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: 'Loans',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: 'Investments',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden tab for profile page */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // This hides it from the tab bar
          title: 'Profile',
        }}
      />
    </Tabs>
  );
} 