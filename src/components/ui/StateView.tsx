import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { VitaMascot, type VitaExpression } from '../mascot/VitaMascot';
import { Button3D } from './Button3D';

export type StateStatus = 'loading' | 'empty' | 'error' | 'success';

interface StateViewProps {
  status: StateStatus;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  mascotSize?: number;
  style?: StyleProp<ViewStyle>;
}

const EXPRESSION: Record<StateStatus, VitaExpression> = {
  loading: 'happy',
  empty: 'sleepy',
  error: 'sleepy',
  success: 'celebrate',
};

const DEFAULT_TITLE: Record<StateStatus, string> = {
  loading: 'Carregando…',
  empty: 'Nada por aqui ainda',
  error: 'Algo deu errado',
  success: 'Tudo certo!',
};

/**
 * Estado de tela reutilizável (vazio/loading/erro/sucesso) com a mascote Vita.
 * Padroniza o tratamento de estados exigido pela rubrica de UI/UX.
 */
export function StateView({
  status,
  title,
  message,
  onRetry,
  retryLabel = 'TENTAR DE NOVO',
  mascotSize = 120,
  style,
}: StateViewProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, style]}
      accessibilityRole="summary"
      accessibilityLabel={title ?? DEFAULT_TITLE[status]}
    >
      <VitaMascot
        size={mascotSize}
        expression={EXPRESSION[status]}
        animated={status === 'loading'}
      />
      <Text style={styles.title}>{title ?? DEFAULT_TITLE[status]}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {status === 'loading' && (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.md }}
        />
      )}

      {status === 'error' && onRetry ? (
        <Button3D
          label={retryLabel}
          icon="refresh"
          color={colors.error}
          shadowColor={colors.errorDark}
          onPress={onRetry}
          style={{ marginTop: spacing.lg }}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  message: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
