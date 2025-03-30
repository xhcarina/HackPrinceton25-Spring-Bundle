import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/theme';

export default function Investments() {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const portfolio = {
    totalInvested: 5000,
    totalReturns: 450,
    activeInvestments: 3,
    averageReturn: 9,
  };

  const opportunities = [
    {
      id: 1,
      title: 'Small Business Bundle',
      description: 'A curated bundle of loans to small businesses across East Africa',
      riskLevel: 'Medium',
      expectedReturn: 8.5,
      minInvestment: 100,
      duration: '12 months',
      diversification: 15,
      sectors: ['Retail', 'Agriculture', 'Crafts'],
    },
    {
      id: 2,
      title: 'Women Entrepreneurs Fund',
      description: 'Support women-led businesses in emerging markets',
      riskLevel: 'Low',
      expectedReturn: 7.2,
      minInvestment: 50,
      duration: '9 months',
      diversification: 25,
      sectors: ['Technology', 'Education', 'Healthcare'],
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
      marginBottom: spacing.lg,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.base,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      padding: spacing.base,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    statValue: {
      fontSize: typography.sizes['2xl'],
      fontWeight: '700' as const,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: typography.sizes.sm,
    },
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '700' as const,
      marginBottom: spacing.base,
    },
    opportunityCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginBottom: spacing.base,
      ...shadows.base,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    opportunityTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '600' as const,
      flex: 1,
    },
    riskBadge: {
      backgroundColor: colors.badgeBackground,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    riskText: {
      fontSize: typography.sizes.xs,
      fontWeight: '500' as const,
    },
    description: {
      fontSize: typography.sizes.base,
      lineHeight: typography.lineHeights.normal,
      marginBottom: spacing.base,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.base,
      marginBottom: spacing.base,
    },
    detailItem: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.sm,
      borderRadius: borderRadius.base,
    },
    detailLabel: {
      fontSize: typography.sizes.xs,
      marginTop: spacing.xs,
    },
    detailValue: {
      fontSize: typography.sizes.base,
      fontWeight: '600' as const,
      marginTop: spacing.xs,
    },
    sectors: {
      marginBottom: spacing.base,
    },
    sectorsLabel: {
      fontSize: typography.sizes.base,
      fontWeight: '600' as const,
      marginBottom: spacing.sm,
    },
    sectorTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    sectorTag: {
      backgroundColor: colors.tagBackground,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    sectorText: {
      fontSize: typography.sizes.xs,
      fontWeight: '500' as const,
    },
    investButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      alignItems: 'center',
    },
    investButtonText: {
      color: colors.text,
      fontSize: typography.sizes.base,
      fontWeight: '600' as const,
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Investment Portfolio</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${portfolio.totalInvested}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Invested
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${portfolio.totalReturns}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Returns
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {portfolio.activeInvestments}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active Investments
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {portfolio.averageReturn}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Avg. Return
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Investment Opportunities
        </Text>
        
        {opportunities.map((opportunity) => (
          <View key={opportunity.id} style={styles.opportunityCard}>
            <View style={styles.cardHeader}>
              <Text style={[styles.opportunityTitle, { color: colors.text }]}>
                {opportunity.title}
              </Text>
              <View style={styles.riskBadge}>
                <Text style={[styles.riskText, { color: colors.badgeText }]}>
                  {opportunity.riskLevel} Risk
                </Text>
              </View>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {opportunity.description}
            </Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="trending-up" size={20} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Expected Return
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {opportunity.expectedReturn}%
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Duration
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {opportunity.duration}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="wallet" size={20} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Min. Investment
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  ${opportunity.minInvestment}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="git-branch" size={20} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Diversification
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {opportunity.diversification} loans
                </Text>
              </View>
            </View>

            <View style={styles.sectors}>
              <Text style={[styles.sectorsLabel, { color: colors.text }]}>Sectors:</Text>
              <View style={styles.sectorTags}>
                {opportunity.sectors.map((sector, index) => (
                  <View key={index} style={styles.sectorTag}>
                    <Text style={[styles.sectorText, { color: colors.tagText }]}>
                      {sector}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.investButton}>
              <Text style={styles.investButtonText}>Invest Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 