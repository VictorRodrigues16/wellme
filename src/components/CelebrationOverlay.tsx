import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from './Button3D';
import { VitaMascot } from './VitaMascot';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { Text } from 'react-native';

interface CelebrationOverlayProps {
  title: string;
  xpEarned: number;
  onContinue: () => void;
}

export function CelebrationOverlay({ title, xpEarned, onContinue }: CelebrationOverlayProps) {
  const vitaOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const xpOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    vitaOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    xpOpacity.value = withDelay(800, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    btnOpacity.value = withDelay(1300, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, []);

  const vitaStyle = useAnimatedStyle(() => ({ opacity: vitaOpacity.value }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const xpStyle = useAnimatedStyle(() => ({ opacity: xpOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.bigIcon, vitaStyle]}>
          <VitaMascot size={160} expression="celebrate" />
        </Animated.View>

        <Animated.View style={textStyle}>
          <Text style={styles.celebrateLabel}>Mandou bem!</Text>
          <Text style={styles.title}>MISSÃO COMPLETA!</Text>
        </Animated.View>

        <Animated.View style={[styles.missionCard, textStyle]}>
          <Text style={styles.missionTitle}>{title}</Text>
        </Animated.View>

        <Animated.View style={[styles.xpBadge, xpStyle]}>
          <Ionicons name="flash" size={24} color={colors.textDark} />
          <Text style={styles.xpText}>+{xpEarned} XP</Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, btnStyle]}>
          <Button3D
            label="CONTINUAR"
            onPress={onContinue}
            color={colors.primary}
            shadowColor={colors.primaryDark}
            size="large"
            fullWidth
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 27, 45, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  bigIcon: {
    marginBottom: 12,
  },
  celebrateLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 32,
    color: colors.gold,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 200, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 12,
  },
  missionCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  missionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 40,
  },
  xpText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    color: colors.textDark,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
