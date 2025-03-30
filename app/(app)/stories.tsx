import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/theme';
import { getStories, Story } from '../../services/story';
import { format } from 'date-fns';

export default function Stories() {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStories = async () => {
    try {
      const fetchedStories = await getStories();
      setStories(fetchedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStories();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: spacing.lg,
    },
    title: {
      fontSize: typography.sizes['3xl'],
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.sizes.base,
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    storyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      marginHorizontal: spacing.base,
      marginBottom: spacing.lg,
      ...shadows.base,
      overflow: 'hidden',
      maxWidth: 500,
      alignSelf: 'center',
      width: '90%',
    },
    image: {
      width: '100%',
      height: 200,
    },
    content: {
      padding: spacing.base,
    },
    storyTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '600',
      marginBottom: spacing.sm,
      color: colors.text,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    location: {
      fontSize: typography.sizes.sm,
      marginLeft: spacing.xs,
      color: colors.textSecondary,
    },
    amount: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: typography.sizes.base,
      lineHeight: typography.lineHeights.normal,
      marginBottom: spacing.base,
      color: colors.textSecondary,
    },
    date: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Impact Stories</Text>
        <Text style={styles.subtitle}>
          Real stories from our community
        </Text>
      </View>

      {stories.map((story) => (
        <View key={story.id} style={styles.storyCard}>
          <Image
            source={{ uri: story.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          
          <View style={styles.content}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={styles.location}>{story.userLocation}</Text>
            </View>
            <Text style={styles.amount}>
              {story.currency} {story.amount.toLocaleString()}
            </Text>
            <Text style={styles.description}>{story.description}</Text>
            <Text style={styles.date}>
              {format(story.created_at, 'MMM d, yyyy')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
} 