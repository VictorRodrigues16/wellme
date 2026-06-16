import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

export type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'offline'
  | 'error'
  | 'simulated';

interface BadgeConfig {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const CONFIG: Record<ConnectionStatus, BadgeConfig> = {
  connected: { color: colors.primary, icon: 'radio', text: 'Ao vivo' },
  connecting: { color: colors.gold, icon: 'sync', text: 'Conectando…' },
  offline: { color: colors.locked, icon: 'cloud-offline', text: 'Offline' },
  error: { color: colors.error, icon: 'warning', text: 'Erro' },
  simulated: { color: colors.blue, icon: 'flask', text: 'Simulado' },
};

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  label?: string;
}

/**
 * Pílula de status de conexão reutilizável (tempo real / sensores).
 * Pulsa em 'connecting' e 'connected' para sinalizar atividade.
 */
export function ConnectionBadge({ status, label }: ConnectionBadgeProps) {
  const cfg = CONFIG[status];
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (status === 'connecting' || status === 'connected') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.45, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [status]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: cfg.color + '22', borderColor: cfg.color + '66' },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Conexão: ${label ?? cfg.text}`}
    >
      <Animated.View style={dotStyle}>
        <Ionicons name={cfg.icon} size={13} color={cfg.color} />
      </Animated.View>
      <Text style={[styles.label, { color: cfg.color }]} numberOfLines={1}>
        {label ?? cfg.text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 5,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
});
