import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Alert, TextInput, Linking, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/theme';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { Button } from '../../components/ui/Button';
import { User } from '../../types/user';
import { createPayment, testPayPalCredentials } from '../../services/paypal';
import { getRecentActivities } from '../../services/activity';
import { Activity } from '../../types/activity';
import { getActiveLoansCount } from '../../services/loan';
import StatsTest from '../../components/StatsTest';

export default function Overview() {
  const { user, signOut } = useAuth();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPayPalConfigured, setIsPayPalConfigured] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [activeLoansCount, setActiveLoansCount] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const count = await getActiveLoansCount(user.id);
      setActiveLoansCount(count);
    } catch (error) {
      console.error('Error loading stats:', error);
      setActiveLoansCount(0);
    }
  }, [user]);

  const loadActivities = useCallback(async () => {
    if (!user) return;
    
    try {
      const activities = await getRecentActivities(user.id);
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
      Alert.alert(
        'Error',
        'Failed to load recent activities. Please try again later.'
      );
    }
  }, [user]);

  // Initial data loading
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!user) return;

      try {
        setIsLoadingStats(true);
        setIsLoadingActivity(true);

        // Load both stats and activities concurrently
        await Promise.all([
          loadStats(),
          loadActivities()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        if (mounted) {
          setIsLoadingStats(false);
          setIsLoadingActivity(false);
        }
      }
    };

    // Check PayPal configuration
    try {
      const isConfigured = testPayPalCredentials();
      if (mounted) {
        setIsPayPalConfigured(isConfigured);
      }
    } catch (error) {
      console.error('PayPal configuration error:', error);
      if (mounted) {
        setIsPayPalConfigured(false);
        Alert.alert(
          'PayPal Configuration Error',
          'Unable to initialize PayPal. Please try again later.'
        );
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [user, loadStats, loadActivities]);

  const stats = {
    totalInvested: 5000,
    activeLoans: activeLoansCount ?? 0,
    returns: 450,
    riskScore: user?.risk_score || 0,
  };

  const handleImagePick = async () => {
    if (isUploading) return; // Prevent multiple uploads
    
    try {
      setIsUploading(true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        setIsUploading(false);
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;

        try {
          // Convert image to blob
          const response = await fetch(imageUri);
          const blob = await response.blob();

          // Upload to Firebase Storage
          const storageRef = ref(storage, `profile_images/${user?.id}`);
          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);

          // Update user profile with new image URL
          Alert.alert('Success', 'Profile image updated successfully');
        } catch (error) {
          console.error('Error processing image:', error);
          Alert.alert('Error', 'Failed to process and upload image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
      setShowProfileModal(true); // Ensure modal stays open
    }
  };

  const handleDeposit = async () => {
    if (!isPayPalConfigured) {
      Alert.alert('Error', 'PayPal is not properly configured. Please try again later.');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      console.log('Initiating PayPal payment for amount:', amount);
      
      // Create PayPal payment
      const paymentResponse = await createPayment({
        amount,
        currency: 'USD',
        description: `Deposit to Bundle account`,
        userId: user?.id || '',
      });

      console.log('Payment response:', paymentResponse);

      if (!paymentResponse.success || !paymentResponse.approvalUrl) {
        throw new Error(paymentResponse.error || 'Failed to create payment');
      }

      // Open PayPal payment URL in browser
      const supported = await Linking.canOpenURL(paymentResponse.approvalUrl);
      
      if (!supported) {
        throw new Error('Cannot open PayPal URL. Please check your device settings.');
      }

      console.log('Opening PayPal URL:', paymentResponse.approvalUrl);
      await Linking.openURL(paymentResponse.approvalUrl);
      
      // Show success message and close modal
      Alert.alert(
        'Payment Initiated',
        'Please complete the payment in your browser. Once completed, you will be redirected back to the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowDepositModal(false);
              setDepositAmount('');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Failed to process payment. Please try again.';
      setPaymentError(errorMessage);
      Alert.alert(
        'Payment Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              setPaymentError(null);
            },
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
    },
    title: {
      fontSize: typography.sizes['3xl'],
      fontWeight: '700' as const,
    },
    profileButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '600',
      color: colors.text,
    },
    modalContent: {
      flex: 1,
      padding: spacing.lg,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    largeProfileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: spacing.lg,
      backgroundColor: colors.card,
    },
    largeProfileImagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    largeProfileImagePlaceholderText: {
      color: colors.text,
      fontSize: typography.sizes.xl,
      fontWeight: '600',
    },
    userInfo: {
      width: '100%',
      marginBottom: spacing.xl,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      flex: 1,
      fontSize: typography.sizes.base,
      color: colors.textSecondary,
    },
    infoValue: {
      flex: 2,
      fontSize: typography.sizes.base,
      color: colors.text,
      textAlign: 'right',
    },
    greeting: {
      fontSize: typography.sizes['2xl'],
      fontWeight: '700' as const,
      marginBottom: spacing.xs,
    },
    location: {
      fontSize: typography.sizes.base,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: spacing.base,
      gap: spacing.base,
      marginTop: -40,
    },
    statCard: {
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      width: '45%',
    },
    statLabel: {
      fontSize: typography.sizes.sm,
      marginBottom: spacing.sm,
    },
    statValue: {
      fontSize: typography.sizes['2xl'],
      fontWeight: '700' as const,
    },
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '700' as const,
      marginBottom: spacing.base,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.base,
      borderBottomWidth: 1,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.base,
    },
    activityDetails: {
      flex: 1,
    },
    activityTitle: {
      fontSize: typography.sizes.base,
      fontWeight: '600' as const,
      marginBottom: spacing.xs,
    },
    activityDate: {
      fontSize: typography.sizes.sm,
    },
    activityAmount: {
      alignItems: 'flex-end',
    },
    amountText: {
      fontSize: typography.sizes.base,
      fontWeight: '600' as const,
      marginBottom: spacing.xs,
    },
    statusText: {
      fontSize: typography.sizes.xs,
      fontWeight: '500' as const,
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
    },
    profileImagePlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileImagePlaceholderText: {
      color: colors.text,
      fontSize: typography.sizes.base,
      fontWeight: '600',
    },
    name: {
      fontSize: typography.sizes.base,
      fontWeight: '700' as const,
      marginTop: spacing.xs,
    },
    balanceSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.card,
      width: '100%',
    },
    balanceLabel: {
      fontSize: typography.sizes.base,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    balanceAmount: {
      fontSize: typography.sizes['3xl'],
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.lg,
    },
    transactionButtons: {
      flexDirection: 'row',
      gap: spacing.base,
      width: '100%',
      paddingHorizontal: spacing.lg,
    },
    transactionButton: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    depositModal: {
      width: '90%',
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.lg,
    },
    depositContent: {
      marginVertical: spacing.xl,
    },
    depositLabel: {
      fontSize: typography.sizes.base,
      marginBottom: spacing.sm,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing.base,
    },
    currencySymbol: {
      fontSize: typography.sizes['2xl'],
      marginRight: spacing.xs,
    },
    amountInput: {
      flex: 1,
      height: 48,
      fontSize: typography.sizes['2xl'],
      paddingVertical: spacing.sm,
    },
    confirmButton: {
      marginTop: spacing.lg,
    },
    errorText: {
      marginTop: spacing.sm,
      fontSize: typography.sizes.sm,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      padding: 20,
      fontSize: 16,
    },
  });

  const handleLogout = async () => {
    try {
      console.log('Logout button pressed');
      await signOut();
      console.log('Sign out successful');
      setShowProfileModal(false);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>
      <TouchableOpacity onPress={() => setShowProfileModal(true)}>
        
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        
      </TouchableOpacity>
    </View>
  );

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'investment':
        return 'trending-up';
      case 'return':
        return 'cash';
      case 'loan':
        return 'wallet';
      case 'deposit':
        return 'arrow-down';
      case 'withdrawal':
        return 'arrow-up';
      default:
        return 'cash';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toISOString().split('T')[0];
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Invested</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>${stats.totalInvested}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Loans</Text>
          {isLoadingStats ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.activeLoans}</Text>
          )}
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Returns</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>${stats.returns}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Risk Score</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.riskScore}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        {isLoadingActivity ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : recentActivity.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No recent activity
          </Text>
        ) : (
          recentActivity.map((activity, index) => (
            <View 
              key={activity.id} 
              style={[
                styles.activityItem,
                { borderBottomColor: colors.border }
              ]}
            >
              <View style={[styles.activityIcon, { backgroundColor: colors.surface }]}>
                <Ionicons
                  name={getActivityIcon(activity.type)}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </Text>
                <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                  {formatDate(activity.date)}
                </Text>
              </View>
              <View style={styles.activityAmount}>
                <Text style={[styles.amountText, { color: colors.text }]}>
                  ${activity.amount.toFixed(2)}
                </Text>
                <Text style={[
                  styles.statusText,
                  { color: activity.status === 'completed' ? colors.success : colors.primary }
                ]}>
                  {activity.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal
        visible={showProfileModal}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile</Text>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.profileSection}>
              <TouchableOpacity onPress={handleImagePick}>
                {user?.profile_picture ? (
                  <Image
                    source={{ uri: user.profile_picture.uri }}
                    style={styles.largeProfileImage}
                  />
                ) : (
                  <View style={styles.largeProfileImagePlaceholder}>
                    <Text style={styles.largeProfileImagePlaceholderText}>
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.name, { fontSize: typography.sizes.xl }]}>{user?.name}</Text>
            </View>

            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount}>${user?.balance?.toFixed(2) || '0.00'}</Text>
              <View style={styles.transactionButtons}>
                <Button
                  title="Deposit"
                  onPress={() => setShowDepositModal(true)}
                  variant="primary"
                  style={styles.transactionButton}
                />
                <Button
                  title="Withdraw"
                  onPress={() => Alert.alert('Coming Soon', 'Withdraw functionality will be available soon!')}
                  variant="secondary"
                  style={styles.transactionButton}
                />
              </View>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country</Text>
                <Text style={styles.infoValue}>{user?.country}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Region</Text>
                <Text style={styles.infoValue}>{user?.region}</Text>
              </View>
            </View>

            <Button
              variant="error"
              title="Sign Out"
              onPress={handleLogout}
              style={{ marginTop: spacing.xl }}
            />
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.depositModal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Deposit Funds</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.depositContent}>
              <Text style={[styles.depositLabel, { color: colors.textSecondary }]}>
                Enter amount to deposit
              </Text>
              <View style={styles.amountInputContainer}>
                <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  keyboardType="decimal-pad"
                  maxLength={10}
                  editable={!isProcessing}
                />
              </View>
              {paymentError && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {paymentError}
                </Text>
              )}
              {!isPayPalConfigured && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  PayPal is not configured. Please try again later.
                </Text>
              )}
              {isProcessing && (
                <Text style={[styles.errorText, { color: colors.primary }]}>
                  Processing your payment...
                </Text>
              )}
            </View>

            <Button
              title={isProcessing ? "Processing..." : "Confirm Deposit"}
              onPress={handleDeposit}
              variant="primary"
              style={styles.confirmButton}
              disabled={isProcessing || !isPayPalConfigured}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
} 