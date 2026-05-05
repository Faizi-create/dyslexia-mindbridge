import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';

interface Props {
  label: string;
  onPress: () => void;
  colors?: readonly [string, string, ...string[]];
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const GradientButton: React.FC<Props> = ({
  label,
  onPress,
  colors = ['#5B8DEF', '#3A6BC4'],
  icon,
  loading,
  disabled,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 6 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.shadow, style]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled || loading}
        style={styles.pressable}
      >
        <LinearGradient
          colors={disabled ? ['#D6D6D6', '#BFBFBF'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.row}>
              {icon && <Ionicons name={icon} size={22} color="#fff" />}
              <Text style={styles.label}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#1F3B73',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderRadius: Radius.lg,
  },
  pressable: { borderRadius: Radius.lg, overflow: 'hidden' },
  gradient: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: {
    color: '#fff',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 0.4,
  },
});

export default GradientButton;
