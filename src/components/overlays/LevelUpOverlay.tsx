import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { VitaMascot } from '../mascot/VitaMascot';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

type OverlayType = 'level-up' | 'module-complete';

interface LevelUpOverlayProps {
  type: OverlayType;
  level?: number;
  moduleName?: string;
  onDismiss: () => void;
}

export function LevelUpOverlay({ type, level, moduleName, onDismiss }: LevelUpOverlayProps) {
  const vitaOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  const ease = Easing.out(Easing.cubic);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    vitaOpacity.value = withTiming(1, { duration: 800, easing: ease });
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 700, easing: ease }));
    btnOpacity.value = withDelay(1000, withTiming(1, { duration: 600, easing: ease }));
  }, []);

  const vitaStyle = useAnimatedStyle(() => ({ opacity: vitaOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  const isLevelUp = type === 'level-up';
  const title = isLevelUp ? `NÍVEL ${level}!` : 'MÓDULO COMPLETO!';
  const subtitle = isLevelUp ? 'Você subiu de nível!' : `${moduleName} concluído!`;
  const bgColor = isLevelUp ? colors.gold : colors.primary;

  return (
    <View style={styles.overlay}>
      <Animated.View style={vitaStyle}>
        <VitaMascot size={150} expression="excited" />
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        <View style={[styles.badge, { backgroundColor: bgColor }]}>
          <Ionicons
            name={isLevelUp ? 'arrow-up-circle' : 'checkmark-done-circle'}
            size={28}
            color="#FFFFFF"
          />
          <Text style={styles.badgeText}>{title}</Text>
        </View>

        <Text style={styles.subtitle}>{subtitle}</Text>

        {isLevelUp && (
          <View style={styles.levelCircle}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[styles.dismissContainer, btnStyle]}>
        <Pressable onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>CONTINUAR</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 27, 45, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  content: {
    alignItems: 'center',
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  levelCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 4,
    borderColor: colors.goldDark,
  },
  levelNumber: {
    fontFamily: fontFamily.extraBold,
    fontSize: 36,
    color: '#FFFFFF',
  },
  dismissContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    paddingHorizontal: 40,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  dismissText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
