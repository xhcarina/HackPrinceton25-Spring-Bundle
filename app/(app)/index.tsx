import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/theme';
import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { Button } from '../../components/ui/Button';
import { User } from '../../types/user';

export default function Overview() {
  const { user, signOut } = useAuth();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const stats = {
    totalInvested: 5000,
    activeLoans: 3,
    returns: 450,
    riskScore: user?.risk_score || 0,
  };

  const recentActivity = [
    { type: 'investment', amount: 1000, date: '2024-03-15', status: 'completed' },
    { type: 'return', amount: 150, date: '2024-03-14', status: 'received' },
    { type: 'loan', amount: 500, date: '2024-03-13', status: 'active' },
  ];

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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.base }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Invested</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>${stats.totalInvested}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.base }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Loans</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.activeLoans}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.base }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Returns</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>${stats.returns}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.base }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Risk Score</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.riskScore}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        {recentActivity.map((activity, index) => (
          <View 
            key={index} 
            style={[
              styles.activityItem,
              { borderBottomColor: colors.border }
            ]}
          >
            <View style={[styles.activityIcon, { backgroundColor: colors.surface }]}>
              <Ionicons
                name={
                  activity.type === 'investment'
                    ? 'trending-up'
                    : activity.type === 'return'
                    ? 'cash'
                    : 'wallet'
                }
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.activityDetails}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </Text>
              <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                {activity.date}
              </Text>
            </View>
            <View style={styles.activityAmount}>
              <Text style={[styles.amountText, { color: colors.text }]}>
                ${activity.amount}
              </Text>
              <Text style={[
                styles.statusText,
                { color: activity.status === 'completed' ? colors.success : colors.primary }
              ]}>
                {activity.status}
              </Text>
            </View>
          </View>
        ))}
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
                  onPress={() => Alert.alert('Coming Soon', 'Deposit functionality will be available soon!')}
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
    </ScrollView>
  );
} 