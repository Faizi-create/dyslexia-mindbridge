import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { ThemeColors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { fetchRecentSessions } from '@/services/progressService';
import { ChildStats, computeChildStats } from '@/services/statsService';
import { ExerciseType } from '@/types';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StreakBadge } from '@/components/common/StreakBadge';
import { StringKey } from '@/i18n/strings';

interface BadgeDef {
  id: string;
  titleKey: StringKey;
  descKey: StringKey;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  unlocked: boolean;
}

const MODULES: { key: ExerciseType; labelKey: StringKey; emoji: string; color: string }[] = [
  { key: 'phonics', labelKey: 'modulePhonics', emoji: '🔤', color: '#5B8DEF' },
  { key: 'reading', labelKey: 'moduleReading', emoji: '📖', color: '#4CAF9E' },
  { key: 'vocabulary', labelKey: 'moduleWords', emoji: '💡', color: '#FFA94D' },
  { key: 'pronunciation', labelKey: 'moduleSayIt', emoji: '🎤', color: '#9F7AEA' },
];

export const RewardsScreen: React.FC = () => {
  const { activeChild } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const load = useCallback(async () => {
    if (!activeChild) return;
    try {
      setError(null);
      const sessions = await fetchRecentSessions(activeChild.id, 60);
      setStats(computeChildStats(sessions));
    } catch {
      setError(t('couldntLoad'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeChild, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const trophyScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  const badges: BadgeDef[] = [
    { id: 'first', titleKey: 'badgeFirst', descKey: 'badgeFirstDesc', icon: 'star', unlocked: (stats?.exercises ?? 0) >= 1 },
    { id: 'ten', titleKey: 'badgeTen', descKey: 'badgeTenDesc', icon: 'ribbon', unlocked: (stats?.exercises ?? 0) >= 10 },
    { id: 'fifty', titleKey: 'badgeFifty', descKey: 'badgeFiftyDesc', icon: 'trophy', unlocked: (stats?.exercises ?? 0) >= 50 },
    { id: 'streak3', titleKey: 'badgeStreak3', descKey: 'badgeStreak3Desc', icon: 'flame', unlocked: (stats?.streak ?? 0) >= 3 },
    { id: 'streak7', titleKey: 'badgeStreak7', descKey: 'badgeStreak7Desc', icon: 'planet', unlocked: (stats?.streak ?? 0) >= 7 },
    { id: 'master', titleKey: 'badgeMaster', descKey: 'badgeMasterDesc', icon: 'school', unlocked: (stats?.masteryScore ?? 0) >= 80 },
  ];
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.topTitle}>{t('yourRewards')}</Text>

        <LinearGradient
          colors={['#FFE28A', '#FFB74D', '#FF8A65']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Animated.View style={{ transform: [{ scale: trophyScale }] }}>
            <Text style={styles.heroEmoji}>🏆</Text>
          </Animated.View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.heroTitle}>{t('lookAtYou')}</Text>
            <Text style={styles.heroSub}>{t('badgesUnlocked', { u: unlocked, t: badges.length })}</Text>
            <View style={{ marginTop: Spacing.sm }}>
              <StreakBadge streak={stats?.streak ?? 0} />
            </View>
          </View>
        </LinearGradient>

        {loading && !stats ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('loadingScoreboard')}</Text>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline" size={36} color={colors.error} />
            <Text style={styles.emptyText}>{error}</Text>
            <Pressable onPress={onRefresh} style={[styles.retry, { backgroundColor: colors.primary }]}>
              <Text style={styles.retryText}>{t('retryAgain')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatCard icon="flame" label={t('streak')} value={`${stats?.streak ?? 0}`} unit="d" gradient={['#FF8A65', '#FF6A3D']} />
              <StatCard icon="sparkles" label={t('activities')} value={`${stats?.exercises ?? 0}`} unit="" gradient={['#5B8DEF', '#3A6BC4']} />
              <StatCard icon="trophy" label={t('mastery')} value={`${stats?.masteryScore ?? 0}`} unit="%" gradient={['#4CAF9E', '#2E8B7A']} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('moduleProgress')}</Text>
              <Text style={styles.cardHint}>{t('howManyRight')}</Text>
              {MODULES.map((m) => {
                const attempted = stats?.moduleAttempted[m.key] ?? 0;
                const correct = stats?.moduleCorrect[m.key] ?? 0;
                const pct = attempted > 0 ? correct / attempted : 0;
                return (
                  <View key={m.key} style={styles.moduleRow}>
                    <View style={styles.moduleHeader}>
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

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('badges')}</Text>
              <View style={styles.badgesGrid}>
                {badges.map((b) => (
                  <View
                    key={b.id}
                    style={[
                      styles.badge,
                      b.unlocked
                        ? { backgroundColor: colors.accent + '22', borderColor: colors.accent }
                        : { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.7 },
                    ]}
                  >
                    <Ionicons
                      name={b.icon}
                      size={32}
                      color={b.unlocked ? colors.accent : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.badgeTitle,
                        { color: b.unlocked ? colors.textPrimary : colors.textMuted },
                      ]}
                    >
                      {t(b.titleKey)}
                    </Text>
                    <Text
                      style={[
                        styles.badgeDesc,
                        { color: b.unlocked ? colors.textSecondary : colors.textMuted },
                      ]}
                    >
                      {t(b.descKey)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  unit: string;
  gradient: readonly [string, string];
}> = ({ icon, label, value, unit, gradient }) => (
  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={statStyles.stat}>
    <Ionicons name={icon} size={22} color="#fff" />
    <Text style={statStyles.value}>
      {value}
      <Text style={statStyles.unit}>{unit}</Text>
    </Text>
    <Text style={statStyles.label}>{label}</Text>
  </LinearGradient>
);

const statStyles = StyleSheet.create({
  stat: { flex: 1, borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center', gap: 4 },
  value: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: '#fff' },
  unit: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  label: { fontFamily: FontFamily.medium, fontSize: 11, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 0.8 },
});

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.base },
    topTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: colors.textPrimary, marginBottom: Spacing.xs },

    hero: { borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm },
    heroEmoji: { fontSize: 80 },
    heroTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: '#fff' },
    heroSub: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: 'rgba(255,255,255,0.9)' },

    statsRow: { flexDirection: 'row', gap: Spacing.sm },

    card: { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.base, gap: Spacing.sm, borderWidth: 1, borderColor: colors.cardBorder },
    cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: colors.textPrimary },
    cardHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary },

    moduleRow: { marginTop: Spacing.sm, gap: 6 },
    moduleHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    moduleEmoji: { fontSize: 20 },
    moduleLabel: { flex: 1, fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: colors.textPrimary },
    moduleCount: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: colors.textSecondary },

    badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
    badge: {
      width: '31%',
      borderRadius: Radius.md,
      padding: Spacing.sm,
      alignItems: 'center',
      gap: 4,
      borderWidth: 2,
      minHeight: 120,
      justifyContent: 'center',
    },
    badgeTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, textAlign: 'center' },
    badgeDesc: { fontFamily: FontFamily.regular, fontSize: 11, textAlign: 'center', lineHeight: 14 },

    empty: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, backgroundColor: colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder },
    emptyText: { fontFamily: FontFamily.medium, fontSize: FontSize.base, color: colors.textSecondary, textAlign: 'center' },
    retry: { marginTop: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
    retryText: { color: '#fff', fontFamily: FontFamily.bold },
  });
