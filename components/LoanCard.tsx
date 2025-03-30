import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from './Themed';
import { useTheme } from '../constants/theme';
import { Loan } from '../types/loan';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface LoanCardProps {
  loan: Loan;
  onPress?: () => void;
}

export function LoanCard({ loan, onPress }: LoanCardProps) {
  const { colors, spacing, borderRadius, shadows } = useTheme();

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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          ...shadows.base,
        },
      ]}
      onPress={onPress}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
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
    fontSize: 14,
    opacity: 0.7,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 