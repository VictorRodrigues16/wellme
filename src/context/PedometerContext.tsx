import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useGame } from './GameContext';

export type PedometerPermission =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unsupported';

interface PedometerValue {
  isWeb: boolean;
  available: boolean;
  permission: PedometerPermission;
  loading: boolean;
  todaySteps: number;
  goal: number;
  requestPermission: () => Promise<void>;
  /** Fallback para web / device sem sensor (e botão de demo). Credita XP normalmente. */
  simulateSteps: (n: number) => void;
}

export const STEP_GOAL = 6000;
const STEP_BUCKET = 1000; // a cada 1000 passos…
const XP_PER_BUCKET = 20; // …ganha 20 XP
const MAX_BUCKETS_PER_DAY = 12; // teto de 240 XP/dia por passos

const PedometerContext = createContext<PedometerValue | null>(null);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PedometerProvider({ children }: { children: ReactNode }) {
  const { grantXp } = useGame();
  const isWeb = Platform.OS === 'web';

  const [available, setAvailable] = useState(false);
  const [permission, setPermission] = useState<PedometerPermission>(
    isWeb ? 'unsupported' : 'undetermined',
  );
  const [loading, setLoading] = useState(!isWeb);
  const [todaySteps, setTodaySteps] = useState(0);

  const baseRef = useRef(0);
  const watchSubRef = useRef<{ remove: () => void } | null>(null);
  const lastBucketRef = useRef(0);
  const bucketsRewardedRef = useRef(0);
  const rewardedDateRef = useRef<string>(todayKey());

  const startTracking = useCallback(async () => {
    if (isWeb) return;
    try {
      let base = 0;
      if (Platform.OS === 'ios') {
        // getStepCountAsync é iOS-only (histórico do dia). No Android contamos
        // apenas ao vivo via watchStepCount a partir da abertura da tela.
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        try {
          const res = await Pedometer.getStepCountAsync(start, new Date());
          base = res?.steps ?? 0;
        } catch {
          base = 0;
        }
      }
      baseRef.current = base;
      // Não recompensa retroativamente os passos já existentes ao abrir.
      lastBucketRef.current = Math.floor(base / STEP_BUCKET);
      bucketsRewardedRef.current = 0;
      rewardedDateRef.current = todayKey();
      setTodaySteps(base);

      // Remove um watch anterior (se houver) para não vazar assinatura.
      watchSubRef.current?.remove();
      watchSubRef.current = Pedometer.watchStepCount((result) => {
        setTodaySteps(baseRef.current + (result?.steps ?? 0));
      });
    } catch {
      /* mantém estado atual; UI mostra fallback */
    }
  }, [isWeb]);

  const requestPermission = useCallback(async () => {
    if (isWeb) {
      setPermission('unsupported');
      return;
    }
    setLoading(true);
    try {
      const avail = await Pedometer.isAvailableAsync();
      setAvailable(avail);
      if (!avail) {
        setPermission('denied');
        return;
      }
      const res = await Pedometer.requestPermissionsAsync();
      const status: PedometerPermission = res.granted
        ? 'granted'
        : res.canAskAgain
          ? 'undetermined'
          : 'denied';
      setPermission(status);
      if (res.granted) await startTracking();
    } catch {
      setPermission('denied');
    } finally {
      setLoading(false);
    }
  }, [isWeb, startTracking]);

  const simulateSteps = useCallback((n: number) => {
    setTodaySteps((prev) => prev + Math.max(0, Math.round(n)));
  }, []);

  // Verifica permissão/disponibilidade no mount (sem prompt).
  useEffect(() => {
    if (isWeb) {
      setPermission('unsupported');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const avail = await Pedometer.isAvailableAsync();
        if (cancelled) return;
        setAvailable(avail);
        if (!avail) {
          setPermission('denied');
          return;
        }
        const perm = await Pedometer.getPermissionsAsync();
        if (cancelled) return;
        if (perm.granted) {
          setPermission('granted');
          await startTracking();
        } else {
          setPermission(perm.canAskAgain ? 'undetermined' : 'denied');
        }
      } catch {
        if (!cancelled) setPermission('denied');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isWeb, startTracking]);

  // Credita XP ao cruzar faixas de 1000 passos (idempotente, com cap diário).
  useEffect(() => {
    const today = todayKey();
    if (rewardedDateRef.current !== today) {
      rewardedDateRef.current = today;
      lastBucketRef.current = Math.floor(todaySteps / STEP_BUCKET);
      bucketsRewardedRef.current = 0;
      return;
    }
    const bucket = Math.floor(todaySteps / STEP_BUCKET);
    if (bucket <= lastBucketRef.current) return;
    if (bucketsRewardedRef.current >= MAX_BUCKETS_PER_DAY) {
      lastBucketRef.current = bucket;
      return;
    }
    const newBuckets = Math.min(
      bucket - lastBucketRef.current,
      MAX_BUCKETS_PER_DAY - bucketsRewardedRef.current,
    );
    lastBucketRef.current = bucket;
    bucketsRewardedRef.current += newBuckets;
    if (newBuckets > 0) {
      grantXp(newBuckets * XP_PER_BUCKET, `Passos: ${bucket * STEP_BUCKET}`);
    }
  }, [todaySteps, grantXp]);

  // Limpa o watch ao desmontar.
  useEffect(
    () => () => {
      watchSubRef.current?.remove();
      watchSubRef.current = null;
    },
    [],
  );

  const value: PedometerValue = {
    isWeb,
    available,
    permission,
    loading,
    todaySteps,
    goal: STEP_GOAL,
    requestPermission,
    simulateSteps,
  };

  return <PedometerContext.Provider value={value}>{children}</PedometerContext.Provider>;
}

export function usePedometer(): PedometerValue {
  const ctx = useContext(PedometerContext);
  if (!ctx) throw new Error('usePedometer precisa estar dentro de PedometerProvider');
  return ctx;
}
