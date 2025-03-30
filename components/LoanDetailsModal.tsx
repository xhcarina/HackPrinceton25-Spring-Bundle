import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ShareStoryModal from './ShareStoryModal';
import { uploadStory } from '../services/story';
import { useAuth } from '../contexts/AuthContext';

interface LoanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  loan: {
    id: string;
    loaned_amount: number;
    loan_duration: number;
    amount_repaid: number;
    payment_schedule: string;
    purpose: string;
    currency: string;
    repay_status: string;
    request_status: string;
  };
  onMakePayment: (amount: number) => Promise<void>;
  isProcessing: boolean;
}

export default function LoanDetailsModal({
  visible,
  onClose,
  loan,
  onMakePayment,
  isProcessing,
}: LoanDetailsModalProps) {
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  // Calculate monthly payment and remaining balance
  const monthlyPayment = loan.loaned_amount / loan.loan_duration;
  const remainingBalance = loan.loaned_amount - loan.amount_repaid;
  const isPaid = loan.repay_status === 'paid' || loan.request_status === 'completed';

  const handleShare = () => {
    setIsShareModalVisible(true);
  };

  const handleShareStory = async (data: {
    title: string;
    description: string;
    imageUri: string;
  }) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await uploadStory({
        ...data,
        loanId: loan.id,
        userId: user.id,
        purpose: loan.purpose,
        amount: loan.loaned_amount,
        currency: loan.currency,
      });

      Alert.alert(
        'Success',
        'Your story has been shared! Thank you for sharing your journey.'
      );
      setIsShareModalVisible(false);
    } catch (error) {
      console.error('Error sharing story:', error);
      Alert.alert(
        'Error',
        'Failed to share your story. Please try again.'
      );
      throw error;
    }
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < monthlyPayment) {
      Alert.alert(
        'Invalid Amount',
        `Payment amount must be at least ${loan.currency} ${monthlyPayment.toFixed(2)}`
      );
      return;
    }
    if (amount > remainingBalance) {
      Alert.alert(
        'Invalid Amount',
        `Payment amount cannot exceed the remaining balance of ${loan.currency} ${remainingBalance.toFixed(2)}`
      );
      return;
    }
    await onMakePayment(amount);
    setPaymentAmount('');
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: spacing.lg,
      width: '90%',
      maxWidth: 400,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.text,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderRadius: 8,
      gap: spacing.xs,
    },
    shareButtonText: {
      color: colors.text,
      fontSize: typography.sizes.sm,
      fontWeight: '500',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.base,
    },
    label: {
      fontSize: typography.sizes.base,
      color: colors.text,
      opacity: 0.7,
    },
    value: {
      fontSize: typography.sizes.base,
      color: colors.text,
      fontWeight: '500',
    },
    inputContainer: {
      marginTop: spacing.lg,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: spacing.base,
      color: colors.text,
      fontSize: typography.sizes.base,
      marginBottom: spacing.base,
    },
    payButton: {
      backgroundColor: colors.primary,
      padding: spacing.base,
      borderRadius: 8,
      alignItems: 'center',
    },
    payButtonText: {
      color: colors.background,
      fontSize: typography.sizes.base,
      fontWeight: '600',
    },
    closeButton: {
      marginTop: spacing.lg,
      padding: spacing.base,
      alignItems: 'center',
    },
    closeButtonText: {
      color: colors.text,
      fontSize: typography.sizes.base,
    },
    paidBadge: {
      backgroundColor: colors.success + '20',
      padding: spacing.sm,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    paidText: {
      color: colors.success,
      fontSize: typography.sizes.base,
      fontWeight: '600',
    },
  });

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Loan Details</Text>
              <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color={colors.text} />
                <Text style={styles.shareButtonText}>Share your story</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Loan Amount:</Text>
              <Text style={styles.value}>
                {loan.currency} {loan.loaned_amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Monthly Payment:</Text>
              <Text style={styles.value}>
                {loan.currency} {monthlyPayment.toFixed(2)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount Repaid:</Text>
              <Text style={styles.value}>
                {loan.currency} {loan.amount_repaid.toFixed(2)}
              </Text>
            </View>

            {!isPaid && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Remaining Balance:</Text>
                <Text style={styles.value}>
                  {loan.currency} {remainingBalance.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{loan.loan_duration} months</Text>
            </View>

            <View style={styles.inputContainer}>
              {isPaid ? (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>Loan Fully Repaid</Text>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter payment amount (min: ${loan.currency} ${monthlyPayment.toFixed(2)})`}
                    keyboardType="numeric"
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    placeholderTextColor={colors.text + '80'}
                    editable={!isProcessing}
                  />

                  <TouchableOpacity
                    style={[
                      styles.payButton,
                      isProcessing && { opacity: 0.7 }
                    ]}
                    onPress={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <Text style={styles.payButtonText}>Make Payment</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                disabled={isProcessing}
              >
                <Text style={[
                  styles.closeButtonText,
                  isProcessing && { opacity: 0.7 }
                ]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ShareStoryModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        loan={{
          purpose: loan.purpose,
          currency: loan.currency,
          loaned_amount: loan.loaned_amount,
        }}
        onShare={handleShareStory}
      />
    </>
  );
} 