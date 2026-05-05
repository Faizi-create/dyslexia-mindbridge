import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';

interface Props {
  kind: 'correct' | 'incorrect';
  title: string;
  message: string;
}

export const FeedbackBanner: React.FC<Props> = ({ kind, title, message }) => {
  const correct = kind === 'correct';
  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: correct ? '#E8F6EE' : '#FDECEC', borderColor: correct ? Colors.success : Colors.error },
      ]}
    >
      <Ionicons
        name={correct ? 'checkmark-circle' : 'alert-circle'}
        size={32}
        color={correct ? Colors.success : Colors.error}
      />
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: correct ? Colors.success : Colors.error }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: Spacing.base,
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    alignItems: 'flex-start',
  },
  textCol: { flex: 1 },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    marginBottom: Spacing.xs,
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: FontSize.sm * 1.5,
  },
});
