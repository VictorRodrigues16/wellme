import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface VitaSpeechBubbleProps {
  text: string;
  visible: boolean;
  onDismiss: () => void;
  direction?: 'left' | 'right';
}

export function VitaSpeechBubble({
  text,
  visible,
  onDismiss,
  direction = 'left',
}: VitaSpeechBubbleProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        scale.value = withTiming(0, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(onDismiss, 250);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      scale.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      {/* Shadow */}
      <View style={styles.shadow} />
      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.text}>{text}</Text>
      </View>
      {/* Arrow */}
      <View
        style={[
          styles.arrow,
          direction === 'left' ? styles.arrowLeft : styles.arrowRight,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    maxWidth: 220,
  },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: colors.lockedDark,
  },
  body: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 1,
  },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 20,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    zIndex: 0,
  },
  arrowLeft: {
    left: 24,
  },
  arrowRight: {
    right: 24,
  },
});
