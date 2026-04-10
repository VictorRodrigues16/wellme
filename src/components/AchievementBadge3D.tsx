import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface AchievementBadge3DProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  onPress?: () => void;
}

const ICON_COLORS: Record<string, string> = {
  star: colors.gold,
  water: colors.blue,
  walk: colors.orange,
  nutrition: colors.primary,
  leaf: colors.primary,
  flame: colors.orange,
  trophy: colors.gold,
  medal: colors.purple,
};

export function AchievementBadge3D({
  icon,
  title,
  description,
  unlocked,
  onPress,
}: AchievementBadge3DProps) {
  const pressed = useSharedValue(0);
  const shineX = useSharedValue(-80);

  const badgeColor = unlocked ? (ICON_COLORS[icon] || colors.primary) : colors.locked;
  const badgeDark = unlocked ? darken(badgeColor) : colors.lockedDark;

  useEffect(() => {
    if (unlocked) {
      shineX.value = withRepeat(
        withTiming(200, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [unlocked]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * 5 }, { scale: 1 - pressed.value * 0.03 }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value,
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineX.value }],
  }));

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 80 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const IONICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
    star: 'star',
    water: 'water',
    walk: 'walk',
    nutrition: 'nutrition',
    leaf: 'leaf',
    flame: 'flame',
    trophy: 'trophy',
    medal: 'medal',
  };

  const iconName = IONICON_MAP[icon] || 'medal';

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      style={styles.container}
      accessibilityLabel={`${title}: ${unlocked ? 'desbloqueada' : 'bloqueada'}`}
    >
      {/* Shadow */}
      <Animated.View
        style={[styles.shadow, { backgroundColor: badgeDark }, shadowStyle]}
      />
      {/* Body */}
      <Animated.View
        style={[
          styles.body,
          { backgroundColor: badgeColor, opacity: unlocked ? 1 : 0.5 },
          bodyStyle,
        ]}
      >
        {/* Highlight */}
        <View style={styles.highlight} />

        {/* Shine effect */}
        {unlocked && (
          <Animated.View style={[styles.shine, shineStyle]} />
        )}

        {/* Icon */}
        <Ionicons
          name={unlocked ? iconName : 'lock-closed'}
          size={28}
          color="#FFFFFF"
        />

        {/* Gold ring for unlocked */}
        {unlocked && (
          <View style={styles.goldRing} />
        )}
      </Animated.View>

      {/* Title */}
      <Text
        style={[styles.title, !unlocked && styles.lockedTitle]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function darken(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - 40);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - 40);
  const b = Math.max(0, (num & 0x0000FF) - 40);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    width: 76,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 4,
  },
  shadow: {
    position: 'absolute',
    top: 4,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  body: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },
  highlight: {
    position: 'absolute',
    top: 3,
    width: 46,
    height: 23,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ skewX: '-20deg' }],
  },
  goldRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.gold,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  lockedTitle: {
    color: colors.textSecondary,
  },
});
