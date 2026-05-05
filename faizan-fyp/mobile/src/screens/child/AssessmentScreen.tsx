import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/common/GradientButton';
import { ChoiceCard } from '@/components/exercises/ChoiceCard';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { Exercise, ExerciseType } from '@/types';
import { SEED_EXERCISES } from '@/data/exercises';

const MODULES: ExerciseType[] = ['phonics', 'vocabulary', 'reading', 'pronunciation'];

export const AssessmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeChild } = useAuth();
  const language = activeChild?.learnerProfile.preferredLanguage ?? 'en';

  const questions = useMemo<Exercise[]>(() => {
    return MODULES.map((m) => {
      const pool = SEED_EXERCISES.filter(
        (e) => e.type === m && e.language === language && e.difficulty <= 2,
      );
      return pool[0];
    }).filter(Boolean);
  }, [language]);

  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ module: ExerciseType; correct: boolean }[]>([]);

  const q = questions[idx];
  const done = idx >= questions.length;

  const submit = () => {
    if (!q) return;
    const isMcq = (q.options?.length ?? 0) > 0;
    const correct = isMcq ? selectedId === q.correctOptionId : true;
    setAnswers((prev) => [...prev, { module: q.type, correct }]);
    setSelectedId(null);
    setIdx((i) => i + 1);
  };

  const Header = (
    <View style={styles.topBar}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
      </Pressable>
      <Text style={styles.topTitle}>Warm up</Text>
      <View style={{ width: 26 }} />
    </View>
  );

  if (done) {
    const score = Math.round((answers.filter((a) => a.correct).length / answers.length) * 100);
    const weakest = answers.find((a) => !a.correct)?.module;
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {Header}
        <View style={styles.doneBox}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.title}>All done!</Text>
          <Text style={styles.body}>
            You scored {score}%. We'll tailor the lessons to your pace.
          </Text>
          {weakest ? (
            <Text style={styles.body}>
              We'll start gentle on: <Text style={styles.bold}>{weakest}</Text>.
            </Text>
          ) : (
            <Text style={styles.body}>Amazing run — you nailed the warmup!</Text>
          )}
          <GradientButton
            label="Start learning"
            icon="sparkles"
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!q) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {Header}
        <View style={styles.doneBox}>
          <Text style={styles.body}>No assessment items available in your language yet.</Text>
          <GradientButton label="Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {Header}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>
          Warmup {idx + 1} of {questions.length}
        </Text>
        <Text style={styles.prompt}>{q.prompt}</Text>
        {q.instruction ? <Text style={styles.instruction}>{q.instruction}</Text> : null}

        {q.options && q.options.length > 0 ? (
          <View style={styles.choices}>
            {q.options.map((opt) => (
              <ChoiceCard
                key={opt.id}
                label={opt.label}
                state={selectedId === opt.id ? 'selected' : 'idle'}
                onPress={() => setSelectedId(opt.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.pronBox}>
            <Text style={styles.pronWord}>{q.targetWord}</Text>
            <Text style={styles.pronHelp}>Say it out loud, then tap "I said it!"</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.stickyActions}>
        <GradientButton
          label={q.options ? 'Next' : 'I said it!'}
          icon="arrow-forward"
          onPress={submit}
          disabled={!!q.options && !selectedId}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: { padding: 4 },
  topTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },

  scroll: { padding: Spacing.lg, gap: Spacing.sm },
  step: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  prompt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginTop: 4,
    lineHeight: FontSize.lg * 1.4,
  },
  instruction: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  choices: { marginTop: Spacing.base },
  pronBox: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginTop: Spacing.base,
  },
  pronWord: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  pronHelp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  stickyActions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  doneBox: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  doneEmoji: { fontSize: 72 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: FontSize.base * 1.6,
    textAlign: 'center',
  },
  bold: { fontFamily: FontFamily.bold, textTransform: 'capitalize' },
});
