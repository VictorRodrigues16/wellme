import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

interface ProgressBarProps {
  progress: number; // 0-1
  label?: string;
  height?: number;
  gradientColors?: [string, string];
  showShine?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  label,
  height = 20,
  gradientColors = [colors.gold, colors.orange],
  showShine = true,
  style,
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0);
  const shineX = useSharedValue(-100);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  useEffect(() => {
    if (showShine) {
      shineX.value = withRepeat(
        withDelay(
          2000,
          withTiming(300, { duration: 1000, easing: Easing.linear })
        ),
        -1,
        false
      );
    }
  }, [showShine]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%` as DimensionValue,
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineX.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {showShine && (
            <Animated.View style={[styles.shine, shineStyle]} />
          )}
        </Animated.View>
        {label && (
          <Text style={styles.label}>{label}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  track: {
    backgroundColor: '#1A2B45',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#374151',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ skewX: '-20deg' }],
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
