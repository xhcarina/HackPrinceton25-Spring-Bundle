import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text } from './Themed';
import { useTheme } from '../constants/theme';
import { Loan } from '../types/loan';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { makeLoanPayment } from '../services/loan';
import LoanDetailsModal from './LoanDetailsModal';
import { useAuth } from '../contexts/AuthContext';

interface LoanCardProps {
  loan: Loan;
  onRefresh: () => Promise<void>;
}

export function LoanCard({ loan, onRefresh }: LoanCardProps) {
  const { colors, spacing, borderRadius, shadows, typography } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'defaulted':
        return colors.error;
      case 'in_repayment':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getProgress = () => {
    return (loan.amount_repaid / loan.loaned_amount) * 100;
  };

  const formatDate = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), 'MMM d, yyyy');
  };

  const handlePayment = async (amount: number) => {
    try {
      setIsProcessing(true);
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      await makeLoanPayment(loan.id, amount, user.id);
      
      await onRefresh();
      
      setIsModalVisible(false);
    } catch (error: any) {
      console.error('Error making payment:', error);
      Alert.alert(
        'Payment Failed',
        error.message === 'Insufficient balance' 
          ? 'You do not have enough balance to make this payment. Please add funds to your account.'
          : 'There was an error processing your payment. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      ...shadows.base,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    purpose: {
      fontSize: 18,
      fontWeight: '600',
    },
    status: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    details: {
      gap: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: typography.sizes.sm,
      color: colors.text,
      opacity: 0.7,
    },
    value: {
      fontSize: typography.sizes.sm,
      color: colors.text,
      fontWeight: '500',
    },
    statusContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    viewDetailsButton: {
      backgroundColor: colors.primary,
      padding: spacing.sm,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    viewDetailsText: {
      color: colors.background,
      fontSize: typography.sizes.sm,
      fontWeight: '500',
    },
  });

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.header}>
          <Text style={styles.purpose}>{loan.purpose}</Text>
          <View
            style={[
              styles.status,
              { backgroundColor: getStatusColor(loan.repay_status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(loan.repay_status) },
              ]}
            >
              {loan.repay_status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              {formatCurrency(loan.loaned_amount, loan.currency)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Repaid</Text>
            <Text style={styles.value}>
              {formatCurrency(loan.amount_repaid, loan.currency)} ({getProgress().toFixed(0)}%)
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Schedule</Text>
            <Text style={styles.value}>{loan.payment_schedule}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {formatDate(loan.created_at)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <LoanDetailsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        loan={loan}
        onMakePayment={handlePayment}
        isProcessing={isProcessing}
      />
    </>
  );
} 