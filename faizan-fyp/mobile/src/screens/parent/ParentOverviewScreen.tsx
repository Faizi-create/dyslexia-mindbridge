import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ChildPicker } from '@/components/parent/ChildPicker';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StreakBadge } from '@/components/common/StreakBadge';
import { useAuth } from '@/context/AuthContext';
import { useParentContext } from '@/context/ParentContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { ThemeColors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { ExerciseType } from '@/types';
import { fetchRecentSessions } from '@/services/progressService';
import { ChildStats, computeChildStats } from '@/services/statsService';
import { StringKey } from '@/i18n/strings';

const MODULES: { key: ExerciseType; labelKey: StringKey; emoji: string; color: string }[] = [
  { key: 'phonics', labelKey: 'modulePhonicsLong', emoji: '🔤', color: '#5B8DEF' },
  { key: 'reading', labelKey: 'moduleReadingLong', emoji: '📖', color: '#4CAF9E' },
  { key: 'vocabulary', labelKey: 'moduleVocabularyLong', emoji: '💡', color: '#FFA94D' },
  { key: 'pronunciation', labelKey: 'moduleSayItLong', emoji: '🎤', color: '#9F7AEA' },
];

export const ParentOverviewScreen: React.FC = () => {
  const { profile, children, refreshChildren } = useAuth();
  const { selectedChild, setSelectedChildId } = useParentContext();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!selectedChild) return;
    try {
      const sessions = await fetchRecentSessions(selectedChild.id, 60);
      setStats(computeChildStats(sessions));
    } catch {
      setStats(null);
    }
  }, [selectedChild]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshChildren(), load()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.hi}>{t('welcomeName', { name: profile?.name?.split(' ')[0] ?? t('parent') })}</Text>
        <Text style={styles.title}>{t('overview')}</Text>

        <ChildPicker children={children} selectedId={selectedChild?.id ?? null} onSelect={setSelectedChildId} />

        {!selectedChild ? (
          <View style={styles.card}>
            <Text style={styles.empty}>{t('emptyAddChild')}</Text>
          </View>
        ) : (
          <>
            <LinearGradient
              colors={['#5B8DEF', '#4CAF9E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{selectedChild.name}</Text>
                <Text style={styles.heroSub}>
                  {t('ageLevel', { age: selectedChild.age, level: selectedChild.currentLevel })}
                </Text>
                <View style={styles.streakWrap}>
                  <StreakBadge streak={stats?.streak ?? 0} />
                </View>
              </View>
              <View style={styles.masteryCircle}>
                <Text style={styles.masteryValue}>{stats?.masteryScore ?? 0}%</Text>
                <Text style={styles.masteryLabel}>{t('mastery')}</Text>
              </View>
            </LinearGradient>

            <View style={styles.statsGrid}>
              <Stat icon="time" label={t('todayStat')} value={formatMin(stats?.todayMs)} unit="m" color="#5B8DEF" colors={colors} />
              <Stat icon="calendar" label={t('thisWeek')} value={formatMin(stats?.weekMs)} unit="m" color="#4CAF9E" colors={colors} />
              <Stat icon="sparkles" label={t('activitiesStat')} value={String(stats?.exercises ?? 0)} unit="" color="#FFA94D" colors={colors} />
              <Stat icon="flame" label={t('streak')} value={String(stats?.streak ?? 0)} unit="d" color="#FF8A65" colors={colors} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('skillBreakdown')}</Text>
              {MODULES.map((m) => {
                const attempted = stats?.moduleAttempted[m.key] ?? 0;
                const correct = stats?.moduleCorrect[m.key] ?? 0;
                const pct = attempted > 0 ? correct / attempted : 0;
                return (
                  <View key={m.key} style={styles.moduleRow}>
                    <View style={styles.moduleHead}>
                      <Text style={styles.moduleEmoji}>{m.emoji}</Text>
                      <Text style={styles.moduleLabel}>{t(m.labelKey)}</Text>
                      <Text style={styles.moduleCount}>
                        {attempted > 0 ? `${correct}/${attempted}` : '—'}
                      </Text>
                    </View>
                    <ProgressBar progress={pct} colors={[m.color, m.color]} height={8} />
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  unit: string;
  color: string;
  colors: ThemeColors;
}> = ({ icon, label, value, unit, color, colors }) => (
  <View
    style={{
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: Radius.md,
      padding: Spacing.base,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    }}
  >
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
    <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: colors.textPrimary }}>
      {value}
      <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary }}>{unit}</Text>
    </Text>
    <Text style={{ fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: colors.textSecondary }}>
      {label}
    </Text>
  </View>
);

function formatMin(ms?: number): string {
  if (!ms) return '0';
  return String(Math.round(ms / 60000));
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.base },
    hi: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: colors.textSecondary },
    title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: colors.textPrimary, marginBottom: Spacing.xs },

    hero: {
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.base,
    },
    heroName: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: '#fff' },
    heroSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
    streakWrap: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
    masteryCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    masteryValue: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: '#fff' },
    masteryLabel: { fontFamily: FontFamily.medium, fontSize: 10, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: colors.textPrimary },
    empty: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary, textAlign: 'center' },

    moduleRow: { marginTop: Spacing.sm, gap: 6 },
    moduleHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    moduleEmoji: { fontSize: 20 },
    moduleLabel: { flex: 1, fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: colors.textPrimary },
    moduleCount: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: colors.textSecondary },
  });
