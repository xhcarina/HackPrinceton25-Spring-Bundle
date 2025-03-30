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
    },
    image: {
      width: '100%',
      height: 200,
    },
    content: {
      padding: spacing.base,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    name: {
      fontSize: typography.sizes.xl,
      fontWeight: '600',
      flex: 1,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    location: {
      fontSize: typography.sizes.sm,
      marginLeft: spacing.xs,
    },
    storyTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      marginBottom: spacing.sm,
      color: colors.text,
    },
    purpose: {
      fontSize: typography.sizes.base,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: typography.sizes.base,
      lineHeight: typography.lineHeights.normal,
      marginBottom: spacing.base,
      color: colors.textSecondary,
    },
    metadata: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    date: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    interactions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.base,
    },
    interactionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    interactionText: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    amount: {
      fontSize: typography.sizes.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
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
            <View style={styles.titleRow}>
              <Text style={[styles.name, { color: colors.text }]}>
                {story.userName}
              </Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={[styles.location, { color: colors.textSecondary }]}>
                  {story.userLocation}
                </Text>
              </View>
            </View>

            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.purpose}>{story.purpose}</Text>
            <Text style={styles.amount}>
              {story.currency} {story.amount.toLocaleString()}
            </Text>
            <Text style={styles.description}>{story.description}</Text>

            <View style={styles.metadata}>
              <Text style={styles.date}>
                {format(story.created_at, 'MMM d, yyyy')}
              </Text>
              <View style={styles.interactions}>
                <View style={styles.interactionContainer}>
                  <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.interactionText}>{story.likes}</Text>
                </View>
                <View style={styles.interactionContainer}>
                  <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.interactionText}>{story.comments.length}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
} 