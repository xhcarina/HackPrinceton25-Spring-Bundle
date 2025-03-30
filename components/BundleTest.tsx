import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Button } from './ui/Button';
import { testBundleCreation } from '../services/bundle';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export function BundleTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ name: string; status: 'success' | 'error'; message: string }>>([]);
  const [mValue, setMValue] = useState('0.05');
  const { user } = useAuth();

  // Add effect to log auth state changes
  useEffect(() => {
    console.log('Current auth state:', {
      isUserAuthenticated: !!user,
      userId: user?.id,
      firebaseUser: auth.currentUser?.uid,
    });
  }, [user]);

  const runTest = async (name: string, testFn: () => Promise<string>) => {
    try {
      const result = await testFn();
      return { name, status: 'success' as const, message: result };
    } catch (error) {
      console.error(`Test "${name}" failed:`, error);
      // Add more detailed error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          // @ts-ignore - FirebaseError specific properties
          code: error.code,
          // @ts-ignore - FirebaseError specific properties
          customData: error.customData
        });
      }
      return { 
        name, 
        status: 'error' as const, 
        message: error instanceof Error ? 
          `${error.message} (${error.name}${(error as any).code ? `, code: ${(error as any).code}` : ''})` : 
          'Unknown error'
      };
    }
  };

  const validateMValue = (value: string): boolean => {
    const m = parseFloat(value);
    return !isNaN(m) && m > 0 && m <= 10; // Allow M values between 0 and 10
  };

  const testCases = {
    async checkAuth() {
      if (!user) throw new Error('User not authenticated');
      if (!auth.currentUser) throw new Error('Firebase auth not initialized');
      return `Authenticated as user: ${user.id} (Firebase UID: ${auth.currentUser.uid})`;
    },

    async checkLoansCollection() {
      if (!auth.currentUser) throw new Error('Firebase auth not initialized');
      console.log('Attempting to access loans collection with UID:', auth.currentUser.uid);
      console.log('Auth token:', await auth.currentUser.getIdToken());
      
      try {
        const loansRef = collection(db, 'loans');
        console.log('Collection reference created');
        
        // Try a simple get first
        const simpleQuery = query(loansRef);
        console.log('Simple query created, attempting to execute...');
        
        const snapshot = await getDocs(simpleQuery);
        console.log('Query executed successfully');
        console.log('Documents count:', snapshot.size);
        
        return `Loans collection is accessible (${snapshot.size} documents)`;
      } catch (error) {
        console.error('Detailed loans collection error:', {
          error,
          currentUser: auth.currentUser?.toJSON(),
          uid: auth.currentUser?.uid,
          emailVerified: auth.currentUser?.emailVerified,
          isAnonymous: auth.currentUser?.isAnonymous,
        });
        throw error;
      }
    },

    async checkApprovedLoans() {
      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('request_status', '==', 'approved'));
      const querySnapshot = await getDocs(q);
      return `Found ${querySnapshot.size} approved loans`;
    },

    async checkSpecificLoan() {
      const loanRef = doc(db, 'loans', 'KkaoXwKNIX62NQjzA5TV');
      const loanDoc = await getDoc(loanRef);
      if (!loanDoc.exists()) throw new Error('Specific loan not found');
      return `Successfully read loan: ${loanDoc.id}`;
    },

    async checkBundlesCollection() {
      const bundlesRef = collection(db, 'bundles');
      const snapshot = await getDocs(bundlesRef);
      return `Bundles collection is accessible (${snapshot.size} documents)`;
    },

    async createTestBundle() {
      if (!validateMValue(mValue)) {
        throw new Error('Invalid M value. Please enter a number between 0 and 10.');
      }

      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('request_status', '==', 'approved'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No approved loans found for testing');
      }

      const loanIds = querySnapshot.docs.slice(0, 3).map(doc => doc.id);
      const bundle = await testBundleCreation(loanIds, parseFloat(mValue));
      return `Bundle created with ID: ${bundle.id}, Interest Rate: ${(bundle.i_rate * 100).toFixed(2)}%, Loans: ${bundle.loan_ids.length}, M: ${bundle.M}`;
    }
  };

  const handleTest = async () => {
    try {
      setIsLoading(true);
      setTestResults([]);

      // Log initial state before running tests
      console.log('Initial state before tests:', {
        isAuthenticated: !!user,
        userId: user?.id,
        firebaseAuth: !!auth.currentUser,
        firebaseUID: auth.currentUser?.uid,
        mValue
      });

      const results = [];
      for (const [name, testFn] of Object.entries(testCases)) {
        const result = await runTest(name, testFn);
        results.push(result);
        setTestResults([...results]);
        
        if (result.status === 'error') break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bundle Creation Test</Text>
      
      <View style={styles.authInfo}>
        <Text style={styles.authText}>
          Auth Status: {user ? '✓ Authenticated' : '✗ Not Authenticated'}
        </Text>
        {user && (
          <Text style={styles.authText}>User ID: {user.id}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Risk Multiplier (M)</Text>
        <TextInput
          style={styles.input}
          value={mValue}
          onChangeText={setMValue}
          placeholder="Enter M value (e.g., 1.5)"
          keyboardType="numeric"
        />
        <Text style={styles.inputHelp}>Enter a value between 0 and 10</Text>
      </View>

      <Button
        onPress={handleTest}
        title={isLoading ? 'Running Tests...' : 'Run Test Cases'}
        variant="primary"
        disabled={isLoading || !validateMValue(mValue)}
      />

      <ScrollView style={styles.resultsScroll}>
        {testResults.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultContainer,
              { backgroundColor: result.status === 'success' ? '#e7f5e7' : '#fee' }
            ]}
          >
            <Text style={styles.testName}>{result.name}</Text>
            <Text style={[
              styles.resultText,
              { color: result.status === 'success' ? '#1a7a1a' : '#c33' }
            ]}>
              {result.status === 'success' ? '✓ ' : '✗ '}
              {result.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  authInfo: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  authText: {
    fontSize: 14,
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputHelp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resultsScroll: {
    maxHeight: 300,
  },
  resultContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 