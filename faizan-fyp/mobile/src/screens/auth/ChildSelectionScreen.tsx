import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientButton } from '@/components/common/GradientButton';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { AuthStackParamList, ChildProfile } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ChildSelection'>;

export const ChildSelectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { profile, children, enterChildMode, enterParentMode, signOut } = useAuth();

  const onPickChild = async (child: ChildProfile) => {
    await enterChildMode(child.id);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFF3D9', '#FFF8E7', '#EAF1FE']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.hi}>Hi {profile?.name?.split(' ')[0] ?? 'there'}!</Text>
          <Text style={styles.title}>Who's learning today?</Text>
        </View>

        <FlatList
          data={children}
          keyExtractor={(c) => c.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🎒</Text>
              <Text style={styles.emptyText}>
                No child profiles yet. Tap "Add a child" below to set up the first one.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => onPickChild(item)} style={styles.childCard}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: Colors.childAvatarBg[item.avatarIndex % Colors.childAvatarBg.length] },
                ]}
              >
                <Text style={styles.avatarInitial}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.childName}>{item.name}</Text>
              <View style={styles.childMetaRow}>
                <Ionicons name="star" size={12} color={Colors.accent} />
                <Text style={styles.childMeta}>Level {item.currentLevel}</Text>
              </View>
            </Pressable>
          )}
        />

        <View style={styles.actions}>
          <GradientButton
            label="Add a child"
            icon="add-circle"
            colors={['#4CAF9E', '#2E8B7A']}
            onPress={() => navigation.navigate('CreateChild')}
          />
          <GradientButton
            label="Parent dashboard"
            icon="stats-chart"
            colors={['#5B8DEF', '#3A6BC4']}
            onPress={enterParentMode}
          />
          <Pressable onPress={signOut} style={styles.logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1, padding: Spacing.lg },
  header: { marginBottom: Spacing.base },
  hi: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.textSecondary },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, marginTop: Spacing.xs },

  grid: { paddingVertical: Spacing.sm, gap: Spacing.base },
  row: { gap: Spacing.base, marginBottom: Spacing.base },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  childCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#1F3B73',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: Spacing.xs,
  },
  avatarInitial: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary },
  childName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  childMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  childMeta: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textSecondary },

  actions: { gap: Spacing.sm, marginTop: Spacing.base },
  logout: { alignSelf: 'center', paddingVertical: Spacing.sm },
  logoutText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.textSecondary },
});
