import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { usePedometer } from '../../src/context/PedometerContext';
import { colors } from '../../src/theme/colors';
import { fontFamily } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Button3D } from '../../src/components/ui/Button3D';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { StateView } from '../../src/components/ui/StateView';
import { VitaMascot } from '../../src/components/mascot/VitaMascot';
import {
  scheduleHydrationReminder,
  scheduleMoveReminder,
  scheduleDemoReminder,
  cancelAllWellMeReminders,
  hasScheduledReminders,
} from '../../src/services/notificationsService';

export default function MovimentoScreen() {
  const insets = useSafeAreaInsets();
  const {
    isWeb,
    available,
    permission,
    loading,
    todaySteps,
    goal,
    requestPermission,
    simulateSteps,
  } = usePedometer();

  const [remindersOn, setRemindersOn] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);

  useEffect(() => {
    hasScheduledReminders().then(setRemindersOn);
  }, []);

  const toggleReminders = useCallback(async () => {
    setNotifBusy(true);
    try {
      if (remindersOn) {
        await cancelAllWellMeReminders();
      } else {
        const id = await scheduleHydrationReminder();
        if (id) await scheduleMoveReminder(Math.max(0, goal - todaySteps));
      }
    } finally {
      // Reflete o estado REAL (mesmo em falha parcial).
      setRemindersOn(await hasScheduledReminders());
      setNotifBusy(false);
    }
  }, [remindersOn, goal, todaySteps]);

  const progress = Math.min(todaySteps / goal, 1);
  const pct = Math.round(progress * 100);
  const reachedGoal = todaySteps >= goal;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.orange, colors.orangeDark]}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <Text style={styles.title}>Movimento</Text>
        <Text style={styles.subtitle}>Seus passos viram XP do pilar Movimento</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <StateView status="loading" title="Verificando sensor de passos…" />
        ) : (
          <>
            {/* Tela principal de passos — sempre visível (com dados reais, simulados ou zerados) */}
            <View style={styles.card}>
              <VitaMascot size={110} expression={reachedGoal ? 'excited' : 'happy'} />
              <Text style={styles.steps}>{todaySteps.toLocaleString('pt-BR')}</Text>
              <Text style={styles.stepsLabel}>de {goal.toLocaleString('pt-BR')} passos</Text>
              <ProgressBar
                progress={progress}
                height={18}
                gradientColors={[colors.orange, colors.gold]}
                label={`${pct}%`}
                style={{ width: '100%', marginTop: spacing.md }}
              />
              {reachedGoal && (
                <Text style={styles.goalReached}>🎉 Meta do dia batida!</Text>
              )}
            </View>

            {/* Estados de permissão / plataforma */}
            {permission === 'granted' ? (
              <Text style={styles.note}>
                Contador ativo. Caminhe com o celular e veja os passos subirem — a cada 1000
                passos você ganha XP.
              </Text>
            ) : permission === 'undetermined' ? (
              <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>Ative o contador de passos</Text>
                <Text style={styles.actionMsg}>
                  Vamos pedir acesso à atividade física do seu aparelho para contar seus passos.
                </Text>
                <Button3D
                  label="Ativar contador"
                  icon="walk"
                  color={colors.orange}
                  shadowColor={colors.orangeDark}
                  onPress={requestPermission}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : isWeb ? (
              <View style={styles.actionCard}>
                <Ionicons name="globe-outline" size={22} color={colors.blue} />
                <Text style={styles.actionTitle}>Sensor não existe no navegador</Text>
                <Text style={styles.actionMsg}>
                  O contador de passos usa o sensor do celular — abra o WellMe no app (Expo Go /
                  iOS / Android) para contar passos de verdade. Aqui dá pra simular:
                </Text>
                <Button3D
                  label="Simular +1000 passos"
                  icon="add-circle"
                  color={colors.orange}
                  shadowColor={colors.orangeDark}
                  onPress={() => simulateSteps(1000)}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : (
              // denied ou sem sensor no device
              <View style={styles.actionCard}>
                <Ionicons name="alert-circle" size={22} color={colors.error} />
                <Text style={styles.actionTitle}>
                  {available ? 'Acesso ao movimento negado' : 'Sem sensor de passos'}
                </Text>
                <Text style={styles.actionMsg}>
                  {available
                    ? 'Libere o acesso à atividade física nas configurações para ganhar XP caminhando.'
                    : 'Seu aparelho não tem sensor de passos. Você ainda pode registrar manualmente.'}
                </Text>
                {available ? (
                  <Button3D
                    label="Abrir configurações"
                    icon="settings"
                    color={colors.blue}
                    shadowColor={colors.blueDark}
                    onPress={() => Linking.openSettings()}
                    fullWidth
                    style={{ marginTop: spacing.md }}
                  />
                ) : (
                  <Button3D
                    label="Registrar +1000 passos"
                    icon="add-circle"
                    color={colors.orange}
                    shadowColor={colors.orangeDark}
                    onPress={() => simulateSteps(1000)}
                    fullWidth
                    style={{ marginTop: spacing.md }}
                  />
                )}
              </View>
            )}

            {/* Notificações locais */}
            <View style={styles.actionCard}>
              <View style={styles.notifHeader}>
                <Ionicons name="notifications" size={20} color={colors.gold} />
                <Text style={styles.actionTitle}>Lembretes</Text>
              </View>
              {isWeb ? (
                <Text style={styles.actionMsg}>
                  Notificações locais funcionam no app (Expo Go / iOS / Android), não no navegador.
                </Text>
              ) : (
                <>
                  <Text style={styles.actionMsg}>
                    Receba lembretes locais de hidratação e movimento.
                  </Text>
                  <Button3D
                    label={remindersOn ? 'Desativar lembretes' : 'Ativar lembretes'}
                    icon={remindersOn ? 'notifications-off' : 'notifications'}
                    color={remindersOn ? colors.locked : colors.gold}
                    shadowColor={remindersOn ? colors.lockedDark : colors.goldDark}
                    onPress={toggleReminders}
                    disabled={notifBusy}
                    fullWidth
                    style={{ marginTop: spacing.md }}
                  />
                  <Button3D
                    label="Testar lembrete (15s)"
                    icon="time"
                    color={colors.blue}
                    shadowColor={colors.blueDark}
                    size="small"
                    onPress={async () => {
                      await scheduleDemoReminder();
                      setRemindersOn(await hasScheduledReminders());
                    }}
                    style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
                  />
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
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
  title: { fontFamily: fontFamily.extraBold, fontSize: 24, color: '#fff' },
  subtitle: { fontFamily: fontFamily.semiBold, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
  },
  steps: { fontFamily: fontFamily.black, fontSize: 44, color: colors.text, marginTop: spacing.sm },
  stepsLabel: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary },
  goalReached: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.primary,
    marginTop: spacing.md,
  },
  note: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 19,
  },
  actionCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.xs,
  },
  actionMsg: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 19,
  },
});
