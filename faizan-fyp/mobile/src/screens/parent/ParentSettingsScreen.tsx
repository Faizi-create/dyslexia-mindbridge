import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/common/GradientButton';
import { ChildPicker } from '@/components/parent/ChildPicker';
import { useAuth } from '@/context/AuthContext';
import { useParentContext } from '@/context/ParentContext';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { ThemeColors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { Language } from '@/types';
import { updateChildSettings } from '@/services/parentService';

export const ParentSettingsScreen: React.FC = () => {
  const { profile, children, signOut, exitActiveMode, refreshChildren } = useAuth();
  const { selectedChild, setSelectedChildId } = useParentContext();
  const { lang, setLang, t } = useTranslation();
  const { colors, isDark, setMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [dailyLimit, setDailyLimit] = useState(selectedChild?.dailyTimeLimitMinutes ?? 30);
  const [highContrast, setHighContrast] = useState(selectedChild?.accessibility.highContrast ?? false);
  const [largeText, setLargeText] = useState(selectedChild?.accessibility.largeText ?? false);
  const [audioHints, setAudioHints] = useState(selectedChild?.accessibility.audioHints ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedChild) return;
    setDailyLimit(selectedChild.dailyTimeLimitMinutes);
    setHighContrast(selectedChild.accessibility.highContrast);
    setLargeText(selectedChild.accessibility.largeText);
    setAudioHints(selectedChild.accessibility.audioHints);
    setSaved(false);
  }, [selectedChild]);

  const onSave = async () => {
    if (!selectedChild) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateChildSettings(selectedChild.id, {
        dailyTimeLimitMinutes: dailyLimit,
        accessibility: { highContrast, largeText, audioHints },
      });
      await refreshChildren();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settings')}</Text>
        <Text style={styles.subtitle}>{profile?.email}</Text>

        <ChildPicker children={children} selectedId={selectedChild?.id ?? null} onSelect={setSelectedChildId} />

        {/* App language */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('appLanguage')}</Text>
          <Text style={styles.cardHint}>{t('appLanguageHint')}</Text>
          <View style={styles.segmented}>
            <SegmentedOption
              label={t('english')}
              active={lang === 'en'}
              onPress={() => setLang('en' as Language)}
              colors={colors}
            />
            <SegmentedOption
              label={t('urdu')}
              active={lang === 'ur'}
              onPress={() => setLang('ur' as Language)}
              colors={colors}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appearance</Text>
          <Text style={styles.cardHint}>Switch between light and dark mode.</Text>
          <View style={styles.segmented}>
            <SegmentedOption
              label="☀️  Light"
              active={!isDark}
              onPress={() => setMode('light')}
              colors={colors}
            />
            <SegmentedOption
              label="🌙  Dark"
              active={isDark}
              onPress={() => setMode('dark')}
              colors={colors}
            />
          </View>
        </View>

        {selectedChild && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('dailyTimeLimit')}</Text>
              <Text style={styles.cardHint}>{t('dailyTimeLimitHint', { name: selectedChild.name })}</Text>
              <View style={styles.limitRow}>
                {[15, 20, 30, 45, 60].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setDailyLimit(n)}
                    style={[
                      styles.limitChip,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      dailyLimit === n && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.limitChipText,
                        { color: colors.textPrimary },
                        dailyLimit === n && { color: '#fff' },
                      ]}
                    >
                      {n}m
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('accessibility')}</Text>
              <Text style={styles.cardHint}>{t('accessibilityHint', { name: selectedChild.name })}</Text>
              <SettingRow
                icon="contrast"
                label={t('highContrast')}
                desc={t('highContrastDesc')}
                value={highContrast}
                onChange={setHighContrast}
                colors={colors}
              />
              <SettingRow
                icon="text"
                label={t('largeText')}
                desc={t('largeTextDesc')}
                value={largeText}
                onChange={setLargeText}
                colors={colors}
              />
              <SettingRow
                icon="volume-high"
                label={t('audioHints')}
                desc={t('audioHintsDesc')}
                value={audioHints}
                onChange={setAudioHints}
                colors={colors}
              />
            </View>

            <GradientButton
              label={saved ? t('saved') : t('saveSettings')}
              icon={saved ? 'checkmark-circle' : 'save'}
              onPress={onSave}
              loading={saving}
            />
          </>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('account')}</Text>
          <Pressable onPress={exitActiveMode} style={styles.listRow}>
            <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
            <Text style={styles.listLabel}>{t('switchChild')}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
          <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
          <Pressable onPress={signOut} style={styles.listRow}>
            <Ionicons name="log-out" size={22} color={colors.error} />
            <Text style={[styles.listLabel, { color: colors.error }]}>{t('logOut')}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SegmentedOption: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ThemeColors;
}> = ({ label, active, onPress, colors }) => (
  <Pressable
    onPress={onPress}
    style={{
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: Radius.md,
      backgroundColor: active ? colors.primary : 'transparent',
    }}
  >
    <Text
      style={{
        fontFamily: FontFamily.bold,
        fontSize: FontSize.base,
        color: active ? '#fff' : colors.textPrimary,
      }}
    >
      {label}
    </Text>
  </Pressable>
);

const SettingRow: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: ThemeColors;
}> = ({ icon, label, desc, value, onChange, colors }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm }}>
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: colors.textPrimary }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: FontFamily.regular,
          fontSize: FontSize.xs,
          color: colors.textSecondary,
          marginTop: 2,
        }}
      >
        {desc}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      thumbColor={'#fff'}
      trackColor={{ false: colors.border, true: colors.primary }}
    />
  </View>
);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.base },
    title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: colors.textPrimary },
    subtitle: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary },

    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: colors.textPrimary },
    cardHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: colors.textSecondary },

    segmented: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      padding: 4,
      gap: 4,
    },

    limitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
    limitChip: {
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.pill,
      borderWidth: 2,
    },
    limitChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },

    listRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
    listLabel: { flex: 1, fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: colors.textPrimary },
    rowDivider: { height: 1 },
  });
