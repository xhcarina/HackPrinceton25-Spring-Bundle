import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { getActiveLoansCount } from '../services/loan';

export default function StatsTest() {
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Check if user is authenticated
      const test1Result = user ? 'Test 1 ✅ User is authenticated' : 'Test 1 ❌ User is not authenticated';
      setTestResults(prev => [...prev, test1Result]);

      if (!user) {
        setTestResults(prev => [...prev, 'Stopping tests: User not authenticated']);
        return;
      }

      // Test 2: Check if user ID exists
      const test2Result = user.id ? 'Test 2 ✅ User ID exists' : 'Test 2 ❌ User ID is missing';
      setTestResults(prev => [...prev, test2Result]);

      if (!user.id) {
        setTestResults(prev => [...prev, 'Stopping tests: User ID missing']);
        return;
      }

      // Test 3: Try to get active loans count
      try {
        setTestResults(prev => [...prev, 'Test 3: Fetching active loans count...']);
        const count = await getActiveLoansCount(user.id);
        setTestResults(prev => [
          ...prev,
          `Test 3 ✅ Active loans count: ${count}`,
          'Expected count should be at least 2 (matching database)'
        ]);
      } catch (error: any) {
        setTestResults(prev => [
          ...prev,
          'Test 3 ❌ Failed to get active loans count',
          `Error: ${error.message || 'Unknown error'}`
        ]);
      }

    } catch (error: any) {
      setTestResults(prev => [...prev, `General Error: ${error.message || 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: 8,
      margin: spacing.base,
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.base,
    },
    button: {
      backgroundColor: colors.primary,
      padding: spacing.base,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    buttonText: {
      color: colors.background,
      fontSize: typography.sizes.base,
      fontWeight: '600',
    },
    resultContainer: {
      backgroundColor: colors.background,
      padding: spacing.base,
      borderRadius: 8,
    },
    resultText: {
      color: colors.text,
      fontSize: typography.sizes.sm,
      marginBottom: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Test Panel</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={runTests}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Run Tests</Text>
        )}
      </TouchableOpacity>
      <View style={styles.resultContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </View>
    </View>
  );
} 