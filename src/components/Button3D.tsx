import React from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { SHADOW_OFFSET } from '../theme/spacing';

interface Button3DProps {
  label: string;
  onPress: () => void;
  color?: string;
  shadowColor?: string;
  textColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button3D({
  label,
  onPress,
  color = colors.primary,
  shadowColor = colors.primaryDark,
  textColor = '#FFFFFF',
  icon,
  disabled = false,
  size = 'medium',
  style,
  fullWidth = false,
}: Button3DProps) {
  const pressed = useSharedValue(0);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * SHADOW_OFFSET }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value,
  }));

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 80 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
    medium: { paddingVertical: 14, paddingHorizontal: 28, fontSize: 16 },
    large: { paddingVertical: 18, paddingHorizontal: 36, fontSize: 18 },
  };

  const s = sizeStyles[size];
  const bgColor = disabled ? colors.locked : color;
  const bgShadow = disabled ? colors.lockedDark : shadowColor;

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, style]}>
      {/* Shadow layer */}
      <Animated.View
        style={[
          styles.shadow,
          {
            backgroundColor: bgShadow,
            borderRadius: size === 'large' ? 16 : 12,
          },
          shadowStyle,
        ]}
      />
      {/* Body layer */}
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.body,
          {
            backgroundColor: bgColor,
            paddingVertical: s.paddingVertical,
            paddingHorizontal: s.paddingHorizontal,
            borderRadius: size === 'large' ? 16 : 12,
          },
          bodyStyle,
        ]}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        {icon && (
          <Ionicons
            name={icon}
            size={s.fontSize + 4}
            color={textColor}
            style={{ marginRight: 8 }}
          />
        )}
        <Text
          style={[
            styles.label,
            { fontSize: s.fontSize, color: textColor },
          ]}
        >
          {label}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: 0,
    right: 0,
    bottom: -SHADOW_OFFSET,
    borderRadius: 12,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
