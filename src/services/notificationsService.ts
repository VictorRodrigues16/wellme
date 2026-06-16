import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Notificações LOCAIS (sem push remoto). Funcionam em Expo Go SDK 54.
 * No web (Vercel) não há suporte → todas as funções são no-op seguras.
 *
 * Nota SDK 54: o trigger por intervalo EXIGE `type: TIME_INTERVAL`, e
 * `repeats: true` só funciona no iOS com `seconds >= 60`.
 */

const isWeb = Platform.OS === 'web';
const TAG = 'wellme-reminder';

// Exibe a notificação mesmo com o app em primeiro plano.
if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Solicita permissão de notificação (on-demand). Retorna true se concedida. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

export async function scheduleHydrationReminder(): Promise<string | null> {
  if (isWeb) return null;
  if (!(await ensureNotificationPermission())) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Hora de se hidratar!',
      body: 'Beba um copo de água e mantenha sua meta do dia.',
      data: { tag: TAG },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 2,
      repeats: true,
    },
  });
}

export async function scheduleMoveReminder(remainingSteps: number): Promise<string | null> {
  if (isWeb) return null;
  if (!(await ensureNotificationPermission())) return null;
  const remaining = Math.max(0, Math.round(remainingSteps));
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🚶 Bora se mexer!',
      body: `Faltam ${remaining} passos pra sua meta de hoje.`,
      data: { tag: TAG },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 3,
      repeats: true,
    },
  });
}

/** Lembrete único de 15s — usado para DEMONSTRAR ao vivo no vídeo. */
export async function scheduleDemoReminder(): Promise<string | null> {
  if (isWeb) return null;
  if (!(await ensureNotificationPermission())) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Lembrete WellMe',
      body: 'Este é um lembrete local de demonstração!',
      data: { tag: TAG },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 15,
      repeats: false,
    },
  });
}

export async function cancelAllWellMeReminders(): Promise<void> {
  if (isWeb) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* no-op */
  }
}

export async function hasScheduledReminders(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    return list.length > 0;
  } catch {
    return false;
  }
}
