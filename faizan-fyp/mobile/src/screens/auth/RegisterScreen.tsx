import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/common/Screen';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { register, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLocalError(null);
    if (!name.trim()) return setLocalError('Please enter your name.');
    if (!email.trim()) return setLocalError('Please enter your email.');
    if (password.length < 6) return setLocalError('Password must be at least 6 characters.');
    if (password !== confirm) return setLocalError('Passwords do not match.');

    setSubmitting(true);
    try {
      await register({ email: email.trim(), password, name: name.trim() });
    } catch {
      /* error surfaced via context */
    } finally {
      setSubmitting(false);
    }
  };

  const message = localError ?? error;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Create a parent account</Text>
        <Text style={styles.subtitle}>
          You will manage your child's profile, progress, and settings from here.
        </Text>
      </View>

      <Input
        label="Your name"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Aisha Khan"
      />
      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder="parent@example.com"
      />
      <Input
        label="Password"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
      />
      <Input
        label="Confirm password"
        secureTextEntry
        autoComplete="new-password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat your password"
      />

      {message ? <Text style={styles.error}>{message}</Text> : null}

      <Button label="Create account" onPress={onSubmit} loading={submitting} />

      <Text style={styles.linkMuted}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Log in
        </Text>
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.xl, marginTop: Spacing.sm },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.5,
  },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.base,
    textAlign: 'center',
  },
  link: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  linkMuted: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
