import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChoiceCard, ChoiceState } from '@/components/exercises/ChoiceCard';
import { FeedbackBanner } from '@/components/feedback/FeedbackBanner';
import { RewardModal } from '@/components/feedback/RewardModal';
import { GradientButton } from '@/components/common/GradientButton';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Confetti } from '@/components/common/Confetti';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { Exercise, ExerciseAttempt, ExerciseOption, ChildStackParamList } from '@/types';
import { pickExercise } from '@/data/exercises';
import { requestNextActivity } from '@/services/aiService';
import { endSession, recordAttempt, startSession } from '@/services/progressService';
import { speak } from '@/services/ttsService';
import { hapticError, hapticSuccess } from '@/services/hapticsService';

const DAILY_GOAL = 5;
const MODULE_COLORS: Record<
  Exercise['type'],
  { gradient: readonly [string, string]; pill: string }
> = {
  phonics: { gradient: ['#8EC5FC', '#5B8DEF'], pill: '#5B8DEF' },
  reading: { gradient: ['#A8E6A3', '#4CAF9E'], pill: '#4CAF9E' },
  vocabulary: { gradient: ['#FFD28A', '#FFA94D'], pill: '#FFA94D' },
  pronunciation: { gradient: ['#DDB6FF', '#9F7AEA'], pill: '#9F7AEA' },
};

type Nav = NativeStackNavigationProp<ChildStackParamList, 'Exercise'>;
type Route = RouteProp<ChildStackParamList, 'Exercise'>;

export const ExerciseScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { activeChild } = useAuth();

  const language = activeChild?.learnerProfile.preferredLanguage ?? 'en';
  const [level, setLevel] = useState(activeChild?.currentLevel ?? 1);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [goalHit, setGoalHit] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!activeChild) return;
    const seed = pickExercise({
      type: route.params.type,
      language,
      level: activeChild.currentLevel,
    });
    setExercise(seed);
    startTimeRef.current = Date.now();
    startSession(activeChild.id)
      .then(setSessionId)
      .catch(() => {});
    return () => {
      if (sessionId) endSession(sessionId).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild, route.params.type]);

  const selectedOption: ExerciseOption | undefined = useMemo(
    () => exercise?.options?.find((o) => o.id === selectedId),
    [exercise, selectedId],
  );
  const correct = !!(exercise && selectedOption && selectedOption.id === exercise.correctOptionId);
  const palette = exercise ? MODULE_COLORS[exercise.type] : MODULE_COLORS.phonics;

  const choiceState = (optId: string): ChoiceState => {
    if (!revealed) return selectedId === optId ? 'selected' : 'idle';
    if (optId === exercise?.correctOptionId) return 'correct';
    if (optId === selectedId) return 'incorrect';
    return 'disabled';
  };

  const onSubmit = async () => {
    if (!exercise || !selectedId || !activeChild || !sessionId) return;
    setRevealed(true);
    const isCorrect = selectedOption?.id === exercise.correctOptionId;
    const timeSpentMs = Date.now() - startTimeRef.current;
    const attempt: ExerciseAttempt = {
      exerciseId: exercise.id,
      correct: isCorrect,
      selectedOptionId: selectedId,
      timeSpentMs,
      timestamp: Date.now(),
    };
    setAttempts((prev) => [...prev, attempt]);
    if (isCorrect) {
      hapticSuccess();
      setConfettiKey((k) => k + 1);
    } else {
      hapticError();
    }
    recordAttempt({
      sessionId,
      studentId: activeChild.id,
      attempt,
      moduleType: exercise.type,
    }).catch(() => {});
  };

  const onNext = async () => {
    if (!exercise || !activeChild) return;
    const newDone = doneCount + 1;
    setDoneCount(newDone);
    if (newDone >= DAILY_GOAL) {
      setGoalHit(true);
      return;
    }
    const next = await requestNextActivity({
      studentId: activeChild.id,
      currentModule: exercise.type,
      language,
      recentAttempts: attempts,
      learnerProfile: activeChild.learnerProfile,
      currentLevel: level,
      excludeIds: attempts.map((a) => a.exerciseId),
    });
    setLevel(next.nextLevel);
    setExercise(next.exercise);
    setSelectedId(null);
    setRevealed(false);
    startTimeRef.current = Date.now();
  };

  const onSpeakPrompt = () => {
    if (!exercise) return;
    speak(exercise.targetWord ?? exercise.targetSentence ?? exercise.prompt, language);
  };

  const onExit = () => {
    if (sessionId) endSession(sessionId).catch(() => {});
    navigation.goBack();
  };

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No more activities for this level right now. Great work!</Text>
          <GradientButton label="Back" onPress={onExit} />
        </View>
      </SafeAreaView>
    );
  }

  const isMcq = (exercise.options?.length ?? 0) > 0;
  const progress = Math.min(1, (doneCount + (revealed ? 0 : 0)) / DAILY_GOAL);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={onExit} hitSlop={10} style={styles.back}>
          <Ionicons name="close" size={26} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} height={10} colors={palette.gradient} />
        </View>
        <Text style={styles.progressLabel}>
          {doneCount}/{DAILY_GOAL}
        </Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={palette.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promptCard}
        >
          <Text style={styles.moduleLabel}>{moduleLabel(exercise.type)} · Level {exercise.difficulty}</Text>
          <Text style={styles.prompt}>{exercise.prompt}</Text>
          {exercise.instruction ? <Text style={styles.instruction}>{exercise.instruction}</Text> : null}

          <Pressable style={styles.speakBtn} onPress={onSpeakPrompt}>
            <Ionicons name="volume-high" size={18} color="#fff" />
            <Text style={styles.speakBtnText}>Hear it</Text>
          </Pressable>
        </LinearGradient>

        {isMcq ? (
          <View style={styles.choices}>
            {exercise.options!.map((opt) => (
              <ChoiceCard
                key={opt.id}
                label={opt.label}
                state={choiceState(opt.id)}
                onPress={() => setSelectedId(opt.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.pronBox}>
            <Text style={styles.pronWord}>{exercise.targetWord}</Text>
            <Pressable style={[styles.bigSpeak, { backgroundColor: palette.pill }]} onPress={onSpeakPrompt}>
              <Ionicons name="volume-high" size={40} color="#fff" />
            </Pressable>
            <Text style={styles.pronHelp}>Tap to hear it, then say it out loud.</Text>
          </View>
        )}

        {revealed && (
          <View style={{ marginTop: Spacing.base }}>
            <FeedbackBanner
              kind={correct ? 'correct' : 'incorrect'}
              title={correct ? 'Great job! 🎉' : "Let's try again"}
              message={
                correct
                  ? exercise.explanation ?? "You got it right."
                  : selectedOption?.hint && selectedOption.hint.length > 0
                    ? selectedOption.hint
                    : exercise.explanation ?? 'That was close — keep trying!'
              }
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.stickyActions}>
          {!revealed && isMcq ? (
            <GradientButton
              label="Check my answer"
              icon="checkmark-circle"
              colors={palette.gradient}
              disabled={!selectedId}
              onPress={onSubmit}
            />
          ) : !revealed ? (
            <GradientButton
              label="I said it!"
              icon="mic"
              colors={palette.gradient}
              onPress={() => {
                setSelectedId('self-report');
                setRevealed(true);
                hapticSuccess();
                setConfettiKey((k) => k + 1);
                if (!exercise || !activeChild || !sessionId) return;
                const attempt: ExerciseAttempt = {
                  exerciseId: exercise.id,
                  correct: true,
                  timeSpentMs: Date.now() - startTimeRef.current,
                  timestamp: Date.now(),
                };
                setAttempts((prev) => [...prev, attempt]);
                recordAttempt({
                  sessionId,
                  studentId: activeChild.id,
                  attempt,
                  moduleType: exercise.type,
                }).catch(() => {});
              }}
            />
          ) : (
            <GradientButton
              label="Next activity"
              icon="arrow-forward"
              colors={palette.gradient}
              onPress={onNext}
            />
          )}
      </View>

      <Confetti trigger={confettiKey} />

      <RewardModal
        visible={goalHit}
        title="Daily goal reached!"
        subtitle={`${DAILY_GOAL} activities finished today. Amazing focus!`}
        emoji="🏆"
        onClose={() => {
          setGoalHit(false);
          onExit();
        }}
      />
    </SafeAreaView>
  );
};

function moduleLabel(type: Exercise['type']): string {
  switch (type) {
    case 'phonics':
      return 'Phonics';
    case 'reading':
      return 'Reading';
    case 'vocabulary':
      return 'Vocabulary';
    case 'pronunciation':
      return 'Say It';
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  back: { padding: 4 },
  progressWrap: { flex: 1 },
  progressLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },

  body: { flex: 1 },
  bodyContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.base,
  },
  stickyActions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  promptCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#1F3B73',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  moduleLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  prompt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#fff',
    lineHeight: FontSize.lg * 1.35,
  },
  instruction: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.92)',
  },
  speakBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: Spacing.xs,
  },
  speakBtnText: { color: '#fff', fontFamily: FontFamily.bold, fontSize: FontSize.sm },

  choices: { gap: 0 },
  pronBox: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    gap: Spacing.base,
    shadowColor: '#1F3B73',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pronWord: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display,
    color: Colors.textPrimary,
  },
  bigSpeak: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  pronHelp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.base },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
