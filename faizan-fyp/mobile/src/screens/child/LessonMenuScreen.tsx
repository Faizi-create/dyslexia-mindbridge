import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { ThemeColors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { ChildStackParamList, ChildTabsParamList, ExerciseType } from '@/types';
import { fetchRecentSessions } from '@/services/progressService';
import { computeChildStats, ChildStats } from '@/services/statsService';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StringKey } from '@/i18n/strings';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<ChildTabsParamList, 'Learn'>,
  NativeStackNavigationProp<ChildStackParamList>
>;

const DAILY_GOAL = 5;

interface Tile {
  type: ExerciseType;
  titleKey: StringKey;
  subKey: StringKey;
  emoji: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  gradient: readonly [string, string];
}

const TILES: Tile[] = [
  { type: 'phonics', titleKey: 'modulePhonics', subKey: 'modulePhonicsSub', emoji: '🔤', icon: 'musical-notes', gradient: ['#8EC5FC', '#5B8DEF'] },
  { type: 'reading', titleKey: 'moduleReading', subKey: 'moduleReadingSub', emoji: '📖', icon: 'book', gradient: ['#A8E6A3', '#4CAF9E'] },
  { type: 'vocabulary', titleKey: 'moduleWords', subKey: 'moduleWordsSub', emoji: '💡', icon: 'sparkles', gradient: ['#FFD28A', '#FFA94D'] },
  { type: 'pronunciation', titleKey: 'moduleSayIt', subKey: 'moduleSayItSub', emoji: '🎤', icon: 'mic', gradient: ['#DDB6FF', '#9F7AEA'] },
];

export const LessonMenuScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { activeChild } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [stats, setStats] = useState<ChildStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      if (!activeChild) return;
      fetchRecentSessions(activeChild.id, 30)
        .then((sessions) => {
          if (alive) setStats(computeChildStats(sessions));
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, [activeChild]),
  );

  const done = stats?.todayCount ?? 0;
  const progress = Math.min(1, done / DAILY_GOAL);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hi}>{t('greetingHi', { name: activeChild?.name?.split(' ')[0] ?? '' })}</Text>
            <Text style={styles.title}>{t('whatToPlay')}</Text>
          </View>
        </View>

        <View style={styles.dailyCard}>
          <View style={styles.dailyTop}>
            <Text style={styles.dailyTitle}>{t('todaysGoal')}</Text>
            <Text style={styles.dailyCount}>
              {done}/{DAILY_GOAL}
            </Text>
          </View>
          <ProgressBar progress={progress} />
          <Text style={styles.dailyHint}>
            {progress >= 1 ? t('doneForToday') : t('pickATile')}
          </Text>
        </View>

        <View style={styles.grid}>
          {TILES.map((tile) => {
            const attempted = stats?.moduleAttempted[tile.type] ?? 0;
            const correct = stats?.moduleCorrect[tile.type] ?? 0;
            const moduleProgress = attempted > 0 ? correct / attempted : 0;
            return (
              <ModuleTile
                key={tile.type}
                tile={tile}
                title={t(tile.titleKey)}
                subtitle={t(tile.subKey)}
                statText={attempted > 0 ? t('xCorrect', { c: correct, t: attempted }) : t('notStarted')}
                progress={moduleProgress}
                onPress={() => navigation.navigate('Exercise', { type: tile.type })}
              />
            );
          })}
        </View>

        <Pressable style={styles.rewardLink} onPress={() => navigation.navigate('Rewards')}>
          <Ionicons name="trophy" size={22} color={colors.accent} />
          <Text style={styles.rewardText}>{t('seeYourRewards')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </Pressable>

        <Pressable style={styles.warmup} onPress={() => navigation.navigate('Assessment')}>
          <Ionicons name="flash" size={18} color={colors.primary} />
          <Text style={styles.warmupText}>{t('quickWarmUp')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const ModuleTile: React.FC<{
  tile: Tile;
  title: string;
  subtitle: string;
  statText: string;
  progress: number;
  onPress: () => void;
}> = ({ tile, title, subtitle, statText, progress, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[tileStyles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 6 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()}
        onPress={onPress}
        style={tileStyles.pressable}
      >
        <LinearGradient colors={tile.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tileStyles.tile}>
          <View style={tileStyles.top}>
            <Text style={tileStyles.emoji}>{tile.emoji}</Text>
            <View style={tileStyles.badge}>
              <Ionicons name={tile.icon} size={14} color="#fff" />
            </View>
          </View>
          <View>
            <Text style={tileStyles.title}>{title}</Text>
            <Text style={tileStyles.subtitle}>{subtitle}</Text>
          </View>
          <View style={tileStyles.bar}>
            <View style={[tileStyles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={tileStyles.stat}>{statText}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const tileStyles = StyleSheet.create({
  wrap: { width: '48%', aspectRatio: 0.95, borderRadius: Radius.lg },
  pressable: { flex: 1, borderRadius: Radius.lg, overflow: 'hidden' },
  tile: { flex: 1, padding: Spacing.base, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  emoji: { fontSize: 40 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: '#fff' },
  subtitle: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  bar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: Spacing.sm, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: '#fff' },
  stat: { fontFamily: FontFamily.semiBold, fontSize: 11, color: 'rgba(255,255,255,0.95)', marginTop: 6 },
});

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: Spacing.xl },
    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    hi: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: colors.textSecondary },
    title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: colors.textPrimary },

    dailyCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    dailyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dailyTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.md, color: colors.textPrimary },
    dailyCount: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: colors.primary },
    dailyHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.base, justifyContent: 'space-between' },

    rewardLink: {
      marginTop: Spacing.base,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      alignSelf: 'center',
      backgroundColor: colors.accent + '22',
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.pill,
    },
    rewardText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: colors.accent },
    warmup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      alignSelf: 'center',
      backgroundColor: colors.primary + '22',
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.pill,
      marginTop: Spacing.sm,
    },
    warmupText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: colors.primary },
  });
