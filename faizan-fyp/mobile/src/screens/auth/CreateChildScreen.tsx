import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/common/Input';
import { GradientButton } from '@/components/common/GradientButton';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'CreateChild'>;

export const CreateChildScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { addChild } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const trimmed = name.trim();
    const parsedAge = parseInt(age, 10);
    if (!trimmed) return setError("Please enter the child's name.");
    if (isNaN(parsedAge) || parsedAge < 4 || parsedAge > 14) {
      return setError('Age should be between 4 and 14.');
    }
    setSubmitting(true);
    try {
      await addChild({
        name: trimmed,
        age: parsedAge,
        grade: grade.trim() || undefined,
        avatarIndex,
      });
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message ?? 'Could not create profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle}>Add a child</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          We'll use this to tailor the activities to your child's pace and strengths.
        </Text>

        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Ayaan"
          autoCapitalize="words"
        />
        <Input
          label="Age"
          value={age}
          onChangeText={setAge}
          placeholder="e.g. 8"
          keyboardType="number-pad"
        />
        <Input
          label="Grade (optional)"
          value={grade}
          onChangeText={setGrade}
          placeholder="e.g. Class 3"
          autoCapitalize="words"
        />

        <Text style={styles.avatarLabel}>Pick an avatar</Text>
        <View style={styles.avatarGrid}>
          {Colors.childAvatarBg.map((color, idx) => (
            <Pressable
              key={idx}
              onPress={() => setAvatarIndex(idx)}
              style={[
                styles.avatarOption,
                { backgroundColor: color },
                avatarIndex === idx && styles.avatarSelected,
              ]}
            >
              <Text style={styles.avatarInitial}>
                {name ? name.charAt(0).toUpperCase() : '★'}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.stickyActions}>
        <GradientButton
          label="Save profile"
          icon="checkmark-circle"
          onPress={onSubmit}
          loading={submitting}
        />
        <Pressable onPress={() => navigation.goBack()} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
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
  topTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },

  scroll: { padding: Spacing.lg, paddingBottom: Spacing.base },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.5,
    marginBottom: Spacing.lg,
  },
  avatarLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: { borderColor: Colors.primary },
  avatarInitial: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.base,
    textAlign: 'center',
  },

  stickyActions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: Spacing.xs,
  },
  cancel: { alignSelf: 'center', paddingVertical: Spacing.sm },
  cancelText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
