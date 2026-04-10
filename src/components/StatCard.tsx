import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { SHADOW_OFFSET } from '../theme/spacing';

interface StatCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  value: number;
  label: string;
  color: string;
  shadowColor: string;
}

export function StatCard({ iconName, iconColor = '#FFFFFF', value, label, color, shadowColor }: StatCardProps) {
  const pressed = useSharedValue(0);
  const displayValue = useSharedValue(0);

  useEffect(() => {
    displayValue.value = withTiming(value, { duration: 1000 });
  }, [value]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: pressed.value * SHADOW_OFFSET },
      { scale: 1 - pressed.value * 0.02 },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value,
  }));

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 80 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Animated.View
        style={[styles.shadow, { backgroundColor: shadowColor }, shadowStyle]}
      />
      <Animated.View
        style={[styles.body, { backgroundColor: color }, bodyStyle]}
      >
        <Ionicons name={iconName} size={28} color={iconColor} style={styles.icon} />
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: 0,
    right: 0,
    bottom: -SHADOW_OFFSET,
    borderRadius: 16,
  },
  body: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    marginBottom: 4,
  },
  value: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
