import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  progress: number; // 0..1
  height?: number;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
}

export const ProgressBar: React.FC<Props> = ({
  progress,
  height = 10,
  colors = ['#5B8DEF', '#4CAF9E'],
  style,
}) => {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, width]);

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View
        style={{
          height: '100%',
          width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#EFE4CC',
    borderRadius: 999,
    overflow: 'hidden',
  },
});

export default ProgressBar;
