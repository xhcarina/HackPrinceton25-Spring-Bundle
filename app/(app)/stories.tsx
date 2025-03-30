import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/theme';

export default function Stories() {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const stories = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'Kenya',
      business: 'Local Artisan Shop',
      amount: 2500,
      funded: 1800,
      image: 'https://picsum.photos/400/300',
      story: 'Sarah is expanding her artisan shop to reach more customers and employ local craftswomen.',
      impact: ['Employment for 5 women', 'Preserving local crafts', 'Supporting families'],
    },
    {
      id: 2,
      name: 'Miguel Rodriguez',
      location: 'Mexico',
      business: 'Organic Farm',
      amount: 3500,
      funded: 2200,
      image: 'https://picsum.photos/400/301',
      story: 'Miguel is scaling his organic farming operation to meet growing demand for sustainable produce.',
      impact: ['Sustainable farming', 'Local food security', 'Fair wages'],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: spacing.lg,
    },
    title: {
      fontSize: typography.sizes['3xl'],
      fontWeight: '700' as const,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.sizes.base,
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
      fontWeight: '600' as const,
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
    business: {
      fontSize: typography.sizes.base,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: typography.sizes.base,
      lineHeight: typography.lineHeights.normal,
      marginBottom: spacing.base,
    },
    fundingContainer: {
      marginBottom: spacing.base,
    },
    fundingBar: {
      height: 8,
      backgroundColor: colors.progressBackground,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.sm,
    },
    fundingProgress: {
      height: '100%',
      backgroundColor: colors.progressFill,
      borderRadius: borderRadius.sm,
    },
    fundingDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    fundingText: {
      fontSize: typography.sizes.sm,
    },
    fundingPercentage: {
      fontSize: typography.sizes.sm,
      fontWeight: '600' as const,
    },
    impactContainer: {
      marginBottom: spacing.base,
    },
    impactTitle: {
      fontSize: typography.sizes.base,
      fontWeight: '600' as const,
      marginBottom: spacing.sm,
    },
    impactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    impactText: {
      fontSize: typography.sizes.sm,
      marginLeft: spacing.sm,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.text,
      fontSize: typography.sizes.base,
      fontWeight: '600' as const,
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Impact Stories</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Meet the entrepreneurs making a difference
        </Text>
      </View>

      {stories.map((story) => (
        <View key={story.id} style={styles.storyCard}>
          <Image
            source={{ uri: story.image }}
            style={styles.image}
            resizeMode="cover"
          />
          
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={[styles.name, { color: colors.text }]}>{story.name}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={[styles.location, { color: colors.textSecondary }]}>
                  {story.location}
                </Text>
              </View>
            </View>

            <Text style={[styles.business, { color: colors.primary }]}>{story.business}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {story.story}
            </Text>

            <View style={styles.fundingContainer}>
              <View style={styles.fundingBar}>
                <View 
                  style={[
                    styles.fundingProgress,
                    { width: `${(story.funded / story.amount) * 100}%` }
                  ]} 
                />
              </View>
              <View style={styles.fundingDetails}>
                <Text style={[styles.fundingText, { color: colors.textSecondary }]}>
                  ${story.funded} raised of ${story.amount}
                </Text>
                <Text style={[styles.fundingPercentage, { color: colors.progressFill }]}>
                  {Math.round((story.funded / story.amount) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.impactContainer}>
              <Text style={[styles.impactTitle, { color: colors.text }]}>Impact</Text>
              {story.impact.map((item, index) => (
                <View key={index} style={styles.impactItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.impactText, { color: colors.textSecondary }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Support This Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
} 