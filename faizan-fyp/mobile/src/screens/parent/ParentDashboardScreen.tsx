import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { ChildProfile } from '@/types';
import { fetchRecentSessions } from '@/services/progressService';
import { ChildStats, computeStats, updateChildSettings } from '@/services/parentService';
import { requestInsights, AIInsights } from '@/services/aiService';

export const ParentDashboardScreen: React.FC = () => {
  const { profile, children, signOut, exitActiveMode, refreshChildren } = useAuth();
  const [selected, setSelected] = useState<ChildProfile | null>(children[0] ?? null);

  useEffect(() => {
    if (!selected && children.length > 0) setSelected(children[0]);
  }, [children, selected]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refreshChildren().catch(() => {})} />
        }
      >
        <Text style={styles.hi}>Welcome, {profile?.name?.split(' ')[0] ?? 'Parent'}</Text>
        <Text style={styles.title}>Parent dashboard</Text>

        {children.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childRow}>
            {children.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setSelected(c)}
                style={[styles.chip, selected?.id === c.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, selected?.id === c.id && styles.chipTextActive]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {selected ? (
          <ChildPanel child={selected} />
        ) : (
          <Text style={styles.empty}>No child profiles yet. Add one from "Switch child".</Text>
        )}

        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          <Button label="Switch child" variant="secondary" onPress={exitActiveMode} />
          <Button label="Log out" variant="ghost" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ChildPanel: React.FC<{ child: ChildProfile }> = ({ child }) => {
  const { refreshChildren } = useAuth();
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(child.dailyTimeLimitMinutes);
  const [highContrast, setHighContrast] = useState(child.accessibility.highContrast);
  const [largeText, setLargeText] = useState(child.accessibility.largeText);
  const [audioHints, setAudioHints] = useState(child.accessibility.audioHints);

  useEffect(() => {
    setDailyLimit(child.dailyTimeLimitMinutes);
    setHighContrast(child.accessibility.highContrast);
    setLargeText(child.accessibility.largeText);
    setAudioHints(child.accessibility.audioHints);
  }, [child.id]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [child.id]),
  );

  const loadStats = async () => {
    try {
      const sessions = await fetchRecentSessions(child.id, 30);
      setStats(computeStats(sessions));
    } catch {
      setStats({ todayMs: 0, weekMs: 0, masteryScore: 0, exercisesToday: 0, exercisesWeek: 0, recentSkills: [] });
    }
  };

  const onRequestReport = async () => {
    setLoadingInsights(true);
    try {
      const sessions = await fetchRecentSessions(child.id, 30);
      const attempts = sessions.flatMap((s) => s.attempts);
      const ai = await requestInsights({
        studentId: child.id,
        recentAttempts: attempts,
        learnerProfile: child.learnerProfile,
      });
      setInsights(ai);
    } finally {
      setLoadingInsights(false);
    }
  };

  const onSaveSettings = async () => {
    await updateChildSettings(child.id, {
      dailyTimeLimitMinutes: dailyLimit,
      accessibility: { highContrast, largeText, audioHints },
    });
    await refreshChildren();
  };

  return (
    <View>
      <View style={styles.cardGrid}>
        <Stat label="Today" value={formatMin(stats?.todayMs)} unit="min" />
        <Stat label="This week" value={formatMin(stats?.weekMs)} unit="min" />
        <Stat label="Mastery" value={`${stats?.masteryScore ?? 0}`} unit="%" />
        <Stat label="Level" value={String(child.currentLevel)} unit="" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent skills</Text>
        {stats && stats.recentSkills.length > 0 ? (
          stats.recentSkills.map((s) => (
            <View key={s} style={styles.skillRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.body}>No activity yet. Encourage the first session!</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI insights</Text>
        {insights ? (
          <>
            <Text style={styles.body}>
              Mastery: <Text style={styles.bold}>{insights.masteryScore}%</Text>
            </Text>
            {insights.strengths.length > 0 && (
              <>
                <Text style={styles.label}>Strengths</Text>
                {insights.strengths.map((s, i) => (
                  <Text key={i} style={styles.body}>
                    • {s}
                  </Text>
                ))}
              </>
            )}
            {insights.challenges.length > 0 && (
              <>
                <Text style={styles.label}>To work on</Text>
                {insights.challenges.map((s, i) => (
                  <Text key={i} style={styles.body}>
                    • {s}
                  </Text>
                ))}
              </>
            )}
            {insights.recommendations.length > 0 && (
              <>
                <Text style={styles.label}>Recommended next</Text>
                {insights.recommendations.map((s, i) => (
                  <Text key={i} style={styles.body}>
                    • {s}
                  </Text>
                ))}
              </>
            )}
          </>
        ) : (
          <Text style={styles.body}>
            Tap below to generate a fresh report based on recent activity.
          </Text>
        )}
        <View style={{ marginTop: Spacing.sm }}>
          <Button label="Request progress report" onPress={onRequestReport} loading={loadingInsights} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily time limit</Text>
        <View style={styles.limitRow}>
          {[15, 20, 30, 45, 60].map((n) => (
            <Pressable
              key={n}
              onPress={() => setDailyLimit(n)}
              style={[styles.limitChip, dailyLimit === n && styles.limitChipActive]}
            >
              <Text style={[styles.limitChipText, dailyLimit === n && styles.limitChipTextActive]}>
                {n}m
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Accessibility</Text>
        <SettingRow label="High contrast" value={highContrast} onChange={setHighContrast} />
        <SettingRow label="Large text" value={largeText} onChange={setLargeText} />
        <SettingRow label="Audio hints" value={audioHints} onChange={setAudioHints} />
      </View>

      <Button label="Save settings" onPress={onSaveSettings} />
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>
      {value}
      <Text style={styles.statUnit}>{unit}</Text>
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SettingRow: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch value={value} onValueChange={onChange} thumbColor={Colors.card} trackColor={{ false: Colors.border, true: Colors.primary }} />
  </View>
);

function formatMin(ms?: number): string {
  if (!ms) return '0';
  return String(Math.round(ms / 60000));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  hi: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  childRow: { marginBottom: Spacing.base, flexGrow: 0 },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textPrimary },
  chipTextActive: { color: Colors.textOnPrimary },
  empty: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.primary,
  },
  statUnit: { fontSize: FontSize.base, color: Colors.textSecondary },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  cardTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  skillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: FontSize.sm * 1.5,
  },
  bold: { fontFamily: FontFamily.bold },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  limitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  limitChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  limitChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  limitChipText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textPrimary },
  limitChipTextActive: { color: Colors.textOnPrimary },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
});
