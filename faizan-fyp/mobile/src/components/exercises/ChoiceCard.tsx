import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'disabled';

interface Props {
  label: string;
  state: ChoiceState;
  onPress: () => void;
}

export const ChoiceCard: React.FC<Props> = ({ label, state, onPress }) => {
  const style = stateStyle[state];
  const disabled = state === 'disabled' || state === 'correct' || state === 'incorrect';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        style.container,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, style.label]}>{label}</Text>
    </Pressable>
  );
};

const stateStyle = {
  idle: {
    container: { backgroundColor: Colors.card, borderColor: Colors.border },
    label: { color: Colors.textPrimary },
  },
  selected: {
    container: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
    label: { color: Colors.primaryDark },
  },
  correct: {
    container: { backgroundColor: '#E8F6EE', borderColor: Colors.success },
    label: { color: Colors.success },
  },
  incorrect: {
    container: { backgroundColor: '#FDECEC', borderColor: Colors.error },
    label: { color: Colors.error },
  },
  disabled: {
    container: { backgroundColor: Colors.card, borderColor: Colors.border, opacity: 0.5 },
    label: { color: Colors.textMuted },
  },
} as const;

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
