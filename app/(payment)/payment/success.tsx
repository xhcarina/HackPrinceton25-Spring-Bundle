import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { handlePaymentSuccess } from '../../../services/paypal';
import { useTheme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, getDoc, increment, runTransaction } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function PaymentSuccess() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const { colors, typography, spacing } = useTheme();
  const { user, updateUserData } = useAuth();
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('Payment success params:', params);
        
        // Extract token from various possible parameter names
        const token = params.token || params.orderId || params.orderID;
        
        if (!token) {
          throw new Error('No payment token received');
        }

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Check if payment was already processed
        if (isProcessed) {
          console.log('Payment already processed, skipping...');
          return;
        }

        console.log('Processing payment with token:', token);
        const paymentResult = await handlePaymentSuccess(token as string);
        
        if (paymentResult.success && paymentResult.amount) {
          try {
            // Use a transaction to ensure atomic update
            await runTransaction(db, async (transaction) => {
              const userRef = doc(db, 'users', user.id);
              const userDoc = await transaction.get(userRef);
              
              if (!userDoc.exists()) {
                throw new Error('User document not found');
              }

              // Log current balance and amount to be added
              const currentBalance = userDoc.data().balance || 0;
              console.log('Current balance:', currentBalance);
              console.log('Amount to add:', paymentResult.amount);

              // Update the balance
              transaction.update(userRef, {
                balance: currentBalance + paymentResult.amount,
                updated_at: new Date()
              });
            });

            // Fetch updated user data
            const userRef = doc(db, 'users', user.id);
            const updatedUserDoc = await getDoc(userRef);
            if (updatedUserDoc.exists()) {
              const userData = updatedUserDoc.data();
              // Update the user context with new data
              updateUserData({
                ...user,
                balance: userData.balance,
                updated_at: userData.updated_at
              });
            }

            setIsProcessed(true);
            setStatus('success');
            
            // Redirect to investments page after 2 seconds
            setTimeout(() => {
              router.replace('/(app)');
            }, 2000);
          } catch (error) {
            console.error('Error updating balance:', error);
            throw new Error('Failed to update balance');
          }
        } else {
          throw new Error(paymentResult.error || 'Failed to process payment');
        }
      } catch (error: any) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setError(error.message || 'An unexpected error occurred.');
      }
    };

    processPayment();
  }, [params, user, isProcessed]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    content: {
      alignItems: 'center',
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: '700',
      marginBottom: spacing.lg,
      color: colors.text,
    },
    message: {
      fontSize: typography.sizes.base,
      textAlign: 'center',
      marginBottom: spacing.xl,
      color: colors.textSecondary,
    },
    errorText: {
      color: colors.error,
      fontSize: typography.sizes.base,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'processing' && (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.title}>Processing Payment</Text>
            <Text style={styles.message}>
              Please wait while we confirm your payment...
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.message}>
              Your deposit has been processed successfully. Redirecting to home page...
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.message}>
              Please try again or contact support if the problem persists.
            </Text>
          </>
        )}
      </View>
    </View>
  );
} 