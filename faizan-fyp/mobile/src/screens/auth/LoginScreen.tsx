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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch {
      /* error surfaced via context */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your child's learning journey.</Text>
      </View>

      <Input
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="parent@example.com"
      />
      <Input
        label="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Log in" onPress={onSubmit} loading={submitting} />

      <View style={styles.links}>
        <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
          Forgot password?
        </Text>
        <Text style={styles.linkMuted}>
          New here?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Create an account
          </Text>
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.xl, marginTop: Spacing.lg },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
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
  links: { marginTop: Spacing.xl, alignItems: 'center', gap: Spacing.base },
  link: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  linkMuted: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
