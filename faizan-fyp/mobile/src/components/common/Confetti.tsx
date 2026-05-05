import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const COLORS = ['#5B8DEF', '#4CAF9E', '#FFB74D', '#E57373', '#BDB2FF', '#FFC6FF', '#A0C4FF'];
const PIECES = 24;

interface Props {
  trigger: number; // increment to re-fire
}

export const Confetti: React.FC<Props> = ({ trigger }) => {
  const { width, height } = Dimensions.get('window');
  const animsRef = useRef(
    Array.from({ length: PIECES }, () => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      startX: Math.random() * width,
      drift: (Math.random() - 0.5) * 200,
      delay: Math.random() * 300,
    })),
  );

  useEffect(() => {
    if (!trigger) return;
    animsRef.current.forEach((p) => {
      p.y.setValue(0);
      p.x.setValue(0);
      p.rotate.setValue(0);
      p.opacity.setValue(1);
      Animated.parallel([
        Animated.timing(p.y, {
          toValue: height,
          duration: 1400 + Math.random() * 600,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.x, {
          toValue: p.drift,
          duration: 1600,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 4 + Math.random() * 4,
          duration: 1800,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 1800,
          delay: p.delay + 600,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [trigger, height]);

  if (!trigger) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {animsRef.current.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -20,
            left: p.startX,
            width: 10,
            height: 14,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: [
              { translateY: p.y },
              { translateX: p.x },
              {
                rotate: p.rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

export default Confetti;
