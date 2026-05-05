import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { SelectNavigator } from './SelectNavigator';
import { ParentNavigator } from './ParentNavigator';
import { ChildNavigator } from './ChildNavigator';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Button } from '@/components/common/Button';

const Splash: React.FC = () => (
  <View style={styles.splash}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

const AdminBlocked: React.FC = () => {
  const { signOut } = useAuth();
  return (
    <View style={styles.splash}>
      <Text style={styles.blockedTitle}>Admin is on the web</Text>
      <Text style={styles.blockedBody}>
        Please use the admin web dashboard to manage content and users.
      </Text>
      <View style={{ marginTop: Spacing.lg, width: '80%' }}>
        <Button label="Log out" variant="ghost" onPress={signOut} />
      </View>
    </View>
  );
};

export const RootNavigator: React.FC = () => {
  const { firebaseUser, profile, activeMode, activeChild, loading } = useAuth();

  let content: React.ReactNode;

  if (loading) {
    content = <Splash />;
  } else if (!firebaseUser || !profile) {
    content = <AuthNavigator />;
  } else if (profile.role === 'admin') {
    content = <AdminBlocked />;
  } else if (activeMode === 'child' && activeChild) {
    content = <ChildNavigator />;
  } else if (activeMode === 'parent') {
    content = <ParentNavigator />;
  } else {
    content = <SelectNavigator />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  blockedTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
    textAlign: 'center',
  },
  blockedBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.5,
  },
});
