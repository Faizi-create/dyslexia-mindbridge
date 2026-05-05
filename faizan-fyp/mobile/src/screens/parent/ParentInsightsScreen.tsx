import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/common/GradientButton';
import { ChildPicker } from '@/components/parent/ChildPicker';
import { useAuth } from '@/context/AuthContext';
import { useParentContext } from '@/context/ParentContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { ThemeColors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { fetchRecentSessions } from '@/services/progressService';
import { AIInsights, requestInsights } from '@/services/aiService';

export const ParentInsightsScreen: React.FC = () => {
  const { children } = useAuth();
  const { selectedChild, setSelectedChildId } = useParentContext();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!selectedChild) return;
    setError(null);
    setLoading(true);
    try {
      const sessions = await fetchRecentSessions(selectedChild.id, 60);
      const attempts = sessions.flatMap((s) => s.attempts);
      const ai = await requestInsights({
        studentId: selectedChild.id,
        recentAttempts: attempts,
        learnerProfile: selectedChild.learnerProfile,
      });
      setInsights(ai);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errSomething'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('aiInsightsTitle')}</Text>
        <Text style={styles.subtitle}>{t('aiInsightsBody')}</Text>

        <ChildPicker children={children} selectedId={selectedChild?.id ?? null} onSelect={setSelectedChildId} />

        {!selectedChild ? (
          <View style={styles.card}>
            <Text style={styles.empty}>{t('noChildSettings')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.generateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{t('progressReportFor', { name: selectedChild.name })}</Text>
                  <Text style={styles.cardHint}>{t('generateExplain')}</Text>
                </View>
                <View style={styles.reportIcon}>
                  <Ionicons name="analytics" size={28} color={colors.primary} />
                </View>
              </View>
              <GradientButton
                label={insights ? t('refreshReport') : t('generateReport')}
                icon="sparkles"
                onPress={generate}
                loading={loading}
              />
              {error && <Text style={styles.error}>{error}</Text>}
            </View>

            {insights && (
              <>
                <View style={[styles.card, { alignItems: 'center' }]}>
                  <Text style={styles.masteryValue}>{insights.masteryScore}%</Text>
                  <Text style={styles.masteryLabel}>{t('overallMastery')}</Text>
                  <View style={styles.masteryBar}>
                    <View style={[styles.masteryFill, { width: `${insights.masteryScore}%` }]} />
                  </View>
                </View>

                <Section
                  title={t('strengthsTitle')}
                  icon="star"
                  color="#4CAF9E"
                  items={insights.strengths}
                  emptyText={t('strengthsEmpty')}
                  colors={colors}
                />
                <Section
                  title={t('toWorkOn')}
                  icon="construct"
                  color="#FFA94D"
                  items={insights.challenges}
                  emptyText={t('toWorkOnEmpty')}
                  colors={colors}
                />
                <Section
                  title={t('recommendedNext')}
                  icon="rocket"
                  color="#5B8DEF"
                  items={insights.recommendations}
                  emptyText={t('recommendedEmpty')}
                  colors={colors}
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Section: React.FC<{
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  items: string[];
  emptyText: string;
  colors: ThemeColors;
}> = ({ title, icon, color, items, emptyText, colors }) => (
  <View
    style={{
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: `${color}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.md, color: colors.textPrimary }}>
        {title}
      </Text>
    </View>
    {items.length === 0 ? (
      <Text style={{ fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary }}>
        {emptyText}
      </Text>
    ) : (
      items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, paddingVertical: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 8, backgroundColor: color }} />
          <Text
            style={{
              flex: 1,
              fontFamily: FontFamily.regular,
              fontSize: FontSize.sm,
              color: colors.textPrimary,
              lineHeight: FontSize.sm * 1.5,
            }}
          >
            {item}
          </Text>
        </View>
      ))
    )}
  </View>
);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.base },
    title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: colors.textPrimary },
    subtitle: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.base,
      color: colors.textSecondary,
      lineHeight: FontSize.base * 1.5,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: colors.textPrimary },
    cardHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary, marginTop: 2 },
    generateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    reportIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    error: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: colors.error },
    empty: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary },

    masteryValue: { fontFamily: FontFamily.bold, fontSize: 44, color: colors.primary },
    masteryLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: colors.textSecondary, marginTop: -2 },
    masteryBar: {
      width: '100%',
      height: 10,
      backgroundColor: colors.divider,
      borderRadius: 5,
      marginTop: Spacing.sm,
      overflow: 'hidden',
    },
    masteryFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
  });
