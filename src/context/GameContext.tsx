import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadState,
  saveState,
  clearState,
  buildInitialState,
  loadSession,
  saveSession,
  clearSession,
} from '../data/storage';
import { XP_PER_LEVEL, CATEGORY_BY_ACHIEVEMENT } from '../data/initialData';
import type { GameState, Mission, Achievement, Session } from '../data/types';

interface DerivedState {
  xpInLevel: number;
  xpToNext: number;
  levelProgress: number;
  totalCompleted: number;
  unlockedAchievements: number;
}

interface GameContextValue {
  state: GameState | null;
  derived: DerivedState | null;
  hydrated: boolean;
  session: Session | null;
  isAuthenticated: boolean;
  login: (name: string, heroCode: string) => Promise<void>;
  logout: () => Promise<void>;
  completeMission: (missionId: number) => void;
  updateName: (name: string) => void;
  resetProgress: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function diffInDays(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + 'T00:00:00');
  const to = new Date(toISO + 'T00:00:00');
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

// Garante que exista exatamente uma proxima missao "available" quando a
// anterior foi concluida.
function advanceAvailability(missions: Mission[]): Mission[] {
  let unlockedNext = false;
  return missions.map((m, i) => {
    if (m.status === 'completed') return m;
    if (m.status === 'available') return m;
    if (!unlockedNext) {
      const allBeforeDone = missions.slice(0, i).every((x) => x.status === 'completed');
      if (allBeforeDone) {
        unlockedNext = true;
        return { ...m, status: 'available' };
      }
    }
    return m;
  });
}

function recomputeAchievements(state: GameState): Achievement[] {
  const { missions, achievements, user } = state;
  const totalCompleted = missions.filter((m) => m.status === 'completed').length;

  return achievements.map((a) => {
    if (a.unlocked) return a;
    let unlocked = false;

    if (a.id === 'first-mission' && totalCompleted >= 1) unlocked = true;
    if (a.id === 'all-done' && totalCompleted === missions.length) unlocked = true;
    if (a.id === 'streak-7' && user.streak >= 7) unlocked = true;
    if (a.id === 'xp-500' && user.xp >= 500) unlocked = true;

    const catTarget = CATEGORY_BY_ACHIEVEMENT[a.id];
    if (catTarget) {
      const catMissions = missions.filter((m) => m.category === catTarget);
      const allDone =
        catMissions.length > 0 && catMissions.every((m) => m.status === 'completed');
      if (allDone) unlocked = true;
    }

    return unlocked ? { ...a, unlocked: true } : a;
  });
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, setState] = useState<GameState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const [loaded, loadedSession] = await Promise.all([
        loadState(),
        loadSession(),
      ]);
      const normalized: GameState = {
        ...loaded,
        missions: advanceAvailability(loaded.missions),
      };
      // Sincroniza nome do usuario com o nome da sessao se ja existe sessao
      if (loadedSession) {
        normalized.user = { ...normalized.user, name: loadedSession.name };
      }
      setState(normalized);
      setSession(loadedSession);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [state, hydrated]);

  const login = useCallback(async (name: string, heroCode: string) => {
    const newSession: Session = {
      name,
      heroCode,
      loggedAt: new Date().toISOString(),
    };
    await saveSession(newSession);
    setSession(newSession);
    setState((prev) => {
      if (!prev) return prev;
      return { ...prev, user: { ...prev.user, name } };
    });
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const completeMission = useCallback((missionId: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const mission = prev.missions.find((m) => m.id === missionId);
      if (!mission || mission.status === 'completed') return prev;

      const updatedMissions = prev.missions.map((m) =>
        m.id === missionId ? { ...m, status: 'completed' as const } : m
      );
      const missionsAdvanced = advanceAvailability(updatedMissions);

      const newXp = prev.user.xp + mission.xpReward;
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

      const today = todayISO();
      let newStreak = prev.user.streak;
      if (prev.user.lastCompletedDate === today) {
        newStreak = prev.user.streak || 1;
      } else if (prev.user.lastCompletedDate) {
        const diff = diffInDays(prev.user.lastCompletedDate, today);
        if (diff === 1) newStreak = prev.user.streak + 1;
        else if (diff > 1) newStreak = 1;
        else newStreak = prev.user.streak || 1;
      } else {
        newStreak = 1;
      }

      const updatedDates = prev.user.completedDates.includes(today)
        ? prev.user.completedDates
        : [...prev.user.completedDates, today];

      const nextState: GameState = {
        ...prev,
        user: {
          ...prev.user,
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          lastCompletedDate: today,
          completedDates: updatedDates,
        },
        missions: missionsAdvanced,
      };
      nextState.achievements = recomputeAchievements(nextState);
      return nextState;
    });
  }, []);

  const updateName = useCallback((name: string) => {
    setState((prev) => (prev ? { ...prev, user: { ...prev.user, name } } : prev));
    setSession((prev) => (prev ? { ...prev, name } : prev));
    // Persiste nome atualizado na sessao
    setSession((prev) => {
      if (prev) {
        const updated: Session = { ...prev, name };
        saveSession(updated);
        return updated;
      }
      return prev;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    await clearState();
    setState((prev) => {
      const fresh = buildInitialState();
      // mantem o nome se houver sessao
      if (prev) {
        fresh.user = { ...fresh.user, name: prev.user.name };
      }
      return fresh;
    });
  }, []);

  const derived = useMemo<DerivedState | null>(() => {
    if (!state) return null;
    const { user } = state;
    const xpInLevel = user.xp % XP_PER_LEVEL;
    const progress = xpInLevel / XP_PER_LEVEL;
    return {
      xpInLevel,
      xpToNext: XP_PER_LEVEL - xpInLevel,
      levelProgress: progress,
      totalCompleted: state.missions.filter((m) => m.status === 'completed').length,
      unlockedAchievements: state.achievements.filter((a) => a.unlocked).length,
    };
  }, [state]);

  const value: GameContextValue = {
    state,
    derived,
    hydrated,
    session,
    isAuthenticated: session !== null,
    login,
    logout,
    completeMission,
    updateName,
    resetProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame precisa estar dentro de GameProvider');
  return ctx;
}
