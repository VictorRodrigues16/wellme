import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useRealtime, type RealtimeStatus } from '../../src/context/RealtimeContext';
import { colors } from '../../src/theme/colors';
import { fontFamily } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ConnectionBadge, type ConnectionStatus } from '../../src/components/ui/ConnectionBadge';
import { StateView } from '../../src/components/ui/StateView';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import type { LeaderboardEntry } from '../../src/realtime/socket';

const BADGE_STATUS: Record<RealtimeStatus, ConnectionStatus> = {
  idle: 'offline',
  connecting: 'connecting',
  connected: 'connected',
  error: 'error',
  simulated: 'simulated',
};

export default function ArenaScreen() {
  const insets = useSafeAreaInsets();
  const { status, leaderboard, feed, onlineCount, myHeroId, connect, disconnect, retry } =
    useRealtime();

  // Conecta ao focar, desconecta ao sair (lazy-connect).
  useFocusEffect(
    useCallback(() => {
      connect();
      return () => disconnect();
    }, [connect, disconnect]),
  );

  const maxXp = leaderboard.length > 0 ? Math.max(...leaderboard.map((e) => e.xp), 1) : 1;
  const isLoading = (status === 'connecting' || status === 'idle') && leaderboard.length === 0;
  const isError = status === 'error' && leaderboard.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.purple, colors.purpleDark]}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Arena ao Vivo</Text>
            <Text style={styles.subtitle}>Ranking de heróis em tempo real</Text>
          </View>
          <ConnectionBadge status={BADGE_STATUS[status]} />
        </View>
        <View style={styles.onlineRow}>
          <Ionicons name="people" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={styles.onlineText}>
            {onlineCount > 0 ? `${onlineCount} heróis online` : 'Procurando heróis…'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <StateView status="loading" title="Entrando na arena…" message="Conectando ao ranking ao vivo" />
        ) : isError ? (
          <StateView
            status="error"
            title="Sem conexão com a Arena"
            message="Não foi possível entrar no ranking ao vivo."
            onRetry={retry}
          />
        ) : (
          <>
            {leaderboard.map((entry, i) => (
              <LeaderboardRow
                key={entry.heroId}
                entry={entry}
                isMe={entry.heroId === myHeroId}
                maxXp={maxXp}
                index={i}
              />
            ))}

            {leaderboard.length <= 1 && (
              <Text style={styles.hint}>
                Você é o único por aqui. Complete uma missão para subir no ranking! ✨
              </Text>
            )}

            <Text style={styles.feedTitle}>Atividade recente</Text>
            {feed.length === 0 ? (
              <Text style={styles.feedEmpty}>Nenhum evento ainda…</Text>
            ) : (
              feed.map((e) => (
                <Animated.View key={e.id} entering={FadeInDown} style={styles.feedItem}>
                  <Ionicons name="flash" size={14} color={colors.gold} />
                  <Text style={styles.feedText} numberOfLines={1}>
                    {e.text}
                  </Text>
                </Animated.View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function LeaderboardRow({
  entry,
  isMe,
  maxXp,
  index,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  maxXp: number;
  index: number;
}) {
  const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18)}
      entering={FadeIn.delay(index * 40)}
      style={[styles.row, isMe && styles.rowMe]}
    >
      <View style={styles.rankBox}>
        <Text style={styles.rankText}>{medal ?? `${entry.rank}º`}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
            {entry.name} {isMe ? '(você)' : ''}
          </Text>
          <Text style={styles.xp}>{entry.xp} XP</Text>
        </View>
        <ProgressBar
          progress={entry.xp / maxXp}
          height={10}
          showShine={false}
          gradientColors={isMe ? [colors.primary, colors.primaryDark] : [colors.purple, colors.purpleDark]}
        />
        <Text style={styles.level}>Nível {entry.level}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontFamily: fontFamily.extraBold, fontSize: 24, color: '#fff' },
  subtitle: { fontFamily: fontFamily.semiBold, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  onlineText: { fontFamily: fontFamily.bold, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowMe: { borderWidth: 2, borderColor: colors.primary },
  rankBox: { width: 40, alignItems: 'center' },
  rankText: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.text },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.text, flex: 1, marginRight: 8 },
  nameMe: { color: colors.primary },
  xp: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.gold },
  level: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  hint: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  feedTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  feedEmpty: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textSecondary },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: 6,
  },
  feedText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.text, flex: 1 },
});
