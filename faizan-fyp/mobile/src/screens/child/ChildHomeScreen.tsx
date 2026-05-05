import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { GradientButton } from '@/components/common/GradientButton';
import { ProgressRing } from '@/components/common/ProgressRing';
import { StreakBadge } from '@/components/common/StreakBadge';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { ThemeColors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { ChildStackParamList, ChildTabsParamList } from '@/types';
import { fetchRecentSessions } from '@/services/progressService';
import { ChildStats, computeChildStats } from '@/services/statsService';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<ChildTabsParamList, 'Home'>,
  NativeStackNavigationProp<ChildStackParamList>
>;

const DAILY_GOAL = 5;

export const ChildHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { activeChild, exitActiveMode } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [stats, setStats] = useState<ChildStats | null>(null);

  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      if (!activeChild) return;
      fetchRecentSessions(activeChild.id, 30)
        .then((sessions) => {
          if (alive) setStats(computeChildStats(sessions));
        })
        .catch(() => {
          if (alive) setStats(null);
        });
      return () => {
        alive = false;
      };
    }, [activeChild]),
  );

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const progress = Math.min(1, (stats?.todayCount ?? 0) / DAILY_GOAL);
  const done = stats?.todayCount ?? 0;
  const avatarBg = colors.childAvatarBg[(activeChild?.avatarIndex ?? 0) % colors.childAvatarBg.length];
  const heroGradient: readonly [string, string, string] = isDark
    ? ['#2A3146', '#1B2031', '#1B2440']
    : ['#FFF3D9', '#FFF8E7', '#EAF1FE'];
  const ringSubtitle =
    progress >= 1 ? t('youDidIt') : progress >= 0.5 ? t('halfwayKeepGoing') : t('fewQuickActivities');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.topRow}>
          <StreakBadge streak={stats?.streak ?? 0} />
          <Pressable onPress={exitActiveMode} hitSlop={10} style={styles.exitBtn}>
            <Ionicons name="person-circle-outline" size={32} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.heroRow}>
          <Animated.View style={[styles.avatarWrap, { transform: [{ translateY }] }]}>
            <View style={[styles.avatarGlow, { backgroundColor: avatarBg }]} />
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarInitial}>
                {activeChild?.name?.charAt(0).toUpperCase() ?? '★'}
              </Text>
            </View>
            <Text style={styles.sparkle1}>✨</Text>
            <Text style={styles.sparkle2}>⭐</Text>
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hi}>{t('greetingHi', { name: activeChild?.name ?? '' })}</Text>
            <Text style={styles.tagline}>{t('ready')}</Text>
          </View>
        </View>

        <View style={styles.ringCard}>
          <ProgressRing size={160} strokeWidth={14} progress={progress}>
            <Text style={styles.ringValue}>
              {done}
              <Text style={styles.ringOf}>/{DAILY_GOAL}</Text>
            </Text>
            <Text style={styles.ringCaption}>{t('todayShort')}</Text>
          </ProgressRing>
          <View style={styles.ringText}>
            <Text style={styles.ringTitle}>{t('dailyGoal')}</Text>
            <Text style={styles.ringSub}>{ringSubtitle}</Text>
            <View style={styles.miniStatsRow}>
              <MiniStat icon="trophy" label={`${stats?.masteryScore ?? 0}%`} sub={t('mastery')} colors={colors} />
              <MiniStat icon="book" label={`L${activeChild?.currentLevel ?? 1}`} sub={t('level')} colors={colors} />
            </View>
          </View>
        </View>

        <View style={styles.ctaCol}>
          <GradientButton
            label={t('letsLearn')}
            icon="sparkles"
            colors={['#5B8DEF', '#4CAF9E']}
            onPress={() => navigation.navigate('Learn')}
          />
          <GradientButton
            label={t('quickWarmUp')}
            icon="flash"
            colors={['#FFB74D', '#FF8A65']}
            onPress={() => navigation.navigate('Assessment')}
          />
          <GradientButton
            label={t('myRewards')}
            icon="trophy"
            colors={['#BDB2FF', '#8E7BE8']}
            onPress={() => navigation.navigate('Rewards')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const MiniStat: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sub: string;
  colors: ThemeColors;
}> = ({ icon, label, sub, colors }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <Ionicons name={icon} size={18} color={colors.accent} />
    <View>
      <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: colors.textPrimary }}>
        {label}
      </Text>
      <Text style={{ fontFamily: FontFamily.regular, fontSize: 11, color: colors.textSecondary }}>{sub}</Text>
    </View>
  </View>
);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1, padding: Spacing.lg },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    exitBtn: { padding: 4 },

    heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginTop: Spacing.lg },
    avatarWrap: { width: 104, height: 104, alignItems: 'center', justifyContent: 'center' },
    avatarGlow: {
      position: 'absolute',
      width: 104,
      height: 104,
      borderRadius: 52,
      opacity: 0.4,
      transform: [{ scale: 1.15 }],
    },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.card,
    },
    avatarInitial: { fontFamily: FontFamily.bold, fontSize: FontSize.xxl, color: '#3D3D3D' },
    sparkle1: { position: 'absolute', top: -4, right: -2, fontSize: 22 },
    sparkle2: { position: 'absolute', bottom: 2, left: -4, fontSize: 16 },

    hi: { fontFamily: FontFamily.bold, fontSize: FontSize.xxl, color: colors.textPrimary },
    tagline: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.base,
      color: colors.textSecondary,
      marginTop: 4,
    },

    ringCard: {
      marginTop: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.base,
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    ringValue: { fontFamily: FontFamily.bold, fontSize: 38, color: colors.textPrimary },
    ringOf: { fontSize: 18, color: colors.textSecondary },
    ringCaption: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginTop: -4,
    },
    ringText: { flex: 1 },
    ringTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: colors.textPrimary },
    ringSub: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: FontSize.sm * 1.5,
    },
    miniStatsRow: { flexDirection: 'row', gap: Spacing.base, marginTop: Spacing.sm },

    ctaCol: { marginTop: 'auto', gap: Spacing.sm, paddingTop: Spacing.lg },
  });
