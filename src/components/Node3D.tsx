import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

export type NodeStatus = 'locked' | 'available' | 'current' | 'completed';

interface Node3DProps {
  status: NodeStatus;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  darkColor: string;
  title?: string;
  onPress?: () => void;
  size?: number;
  accessibilityLabel?: string;
}

export function Node3D({
  status,
  iconName,
  color,
  darkColor,
  title,
  onPress,
  size = 72,
  accessibilityLabel,
}: Node3DProps) {
  const pressed = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (status === 'available' || status === 'current') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [status]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * 5 }],
  }));

  const shadowAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    if (status === 'locked') return;
    pressed.value = withTiming(1, { duration: 80 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0);
  };

  const handlePress = () => {
    if (status === 'locked') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress?.();
  };

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const nodeColor = isLocked ? colors.locked : color;
  const nodeDark = isLocked ? colors.lockedDark : darkColor;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isLocked}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={styles.pressable}
      >
        {/* Glow ring for available/current */}
        {(status === 'available' || isCurrent) && (
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: size + 24,
                height: size + 24,
                borderRadius: (size + 24) / 2,
                borderColor: color,
                shadowColor: color,
              },
              glowStyle,
            ]}
          />
        )}

        {/* Completed golden ring */}
        {isCompleted && (
          <View
            style={[
              styles.completedRing,
              {
                width: size + 16,
                height: size + 16,
                borderRadius: (size + 16) / 2,
              },
            ]}
          />
        )}

        {/* 3D Shadow */}
        <Animated.View
          style={[
            styles.shadow,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
              backgroundColor: nodeDark,
              top: 6,
            },
            shadowAnimStyle,
          ]}
        />

        {/* Main body */}
        <Animated.View
          style={[
            styles.body,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: nodeColor,
              borderColor: nodeDark,
            },
            bodyStyle,
          ]}
        >
          {/* Top highlight (3D shine) */}
          <View
            style={[
              styles.highlightTop,
              {
                width: size * 0.65,
                height: size * 0.35,
                borderTopLeftRadius: size * 0.35,
                borderTopRightRadius: size * 0.35,
              },
            ]}
          />

          {/* Bottom shadow (3D depth) */}
          <View
            style={[
              styles.highlightBottom,
              {
                width: size,
                height: size * 0.35,
                borderBottomLeftRadius: size / 2,
                borderBottomRightRadius: size / 2,
              },
            ]}
          />

          {/* Icon */}
          {isLocked ? (
            <Ionicons name="lock-closed" size={26} color="rgba(255,255,255,0.4)" />
          ) : isCompleted ? (
            <Ionicons name="checkmark" size={30} color="#FFFFFF" />
          ) : (
            <Ionicons name={iconName} size={28} color="#FFFFFF" />
          )}
        </Animated.View>

        {/* Completed star */}
        {isCompleted && (
          <View style={styles.starBadge}>
            <Ionicons name="star" size={14} color="#FFFFFF" />
          </View>
        )}
      </Pressable>

      {/* "INICIAR" badge below node */}
      {isCurrent && (
        <View style={styles.startBadge}>
          <Text style={styles.startText}>INICIAR</Text>
        </View>
      )}

      {/* Title below node */}
      {title && (
        <Text
          style={[
            styles.nodeTitle,
            isLocked && styles.nodeTitleLocked,
            isCompleted && styles.nodeTitleCompleted,
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 110,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  completedRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.gold,
  },
  shadow: {
    position: 'absolute',
    alignSelf: 'center',
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    overflow: 'hidden',
    borderWidth: 3,
  },
  highlightTop: {
    position: 'absolute',
    top: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  highlightBottom: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  starBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    zIndex: 10,
  },
  startBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  startText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 1,
  },
  nodeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 14,
    opacity: 0.9,
  },
  nodeTitleLocked: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
  nodeTitleCompleted: {
    color: colors.gold,
  },
});
