import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';

interface Props {
  streak: number;
}

export const StreakBadge: React.FC<Props> = ({ streak }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak <= 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [streak, pulse]);

  if (streak <= 0) {
    return (
      <View style={[styles.wrap, styles.dim]}>
        <Ionicons name="flame-outline" size={16} color="#9CA3AF" />
        <Text style={styles.dimText}>Start a streak!</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <LinearGradient
        colors={['#FF8A65', '#FF6A3D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wrap}
      >
        <Ionicons name="flame" size={16} color="#fff" />
        <Text style={styles.text}>{streak}-day streak</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  text: { color: '#fff', fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  dim: { backgroundColor: '#F3F4F6' },
  dimText: { color: '#9CA3AF', fontFamily: FontFamily.semiBold, fontSize: FontSize.sm },
});

export default StreakBadge;
