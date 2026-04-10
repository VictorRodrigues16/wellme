import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INITIAL_USER,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
} from './initialData';
import type { GameState } from './types';

const STORAGE_KEY = '@saudequest:state:v5';

export function buildInitialState(): GameState {
  return {
    user: { ...INITIAL_USER },
    // deep clone para não mutar INITIAL_MISSIONS
    missions: INITIAL_MISSIONS.map((m) => ({
      ...m,
      content: JSON.parse(JSON.stringify(m.content)),
    })),
    achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
  };
}

export async function loadState(): Promise<GameState> {
  try {
    // Clean up old storage keys
    const oldKeys = ['@saudequest:state:v1', '@saudequest:state:v2', '@saudequest:state:v3', '@saudequest:state:v4'];
    await AsyncStorage.multiRemove(oldKeys).catch(() => {});

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const fallback = buildInitialState();
    return {
      user: {
        ...fallback.user,
        ...(parsed.user ?? {}),
        completedDates: (parsed.user as any)?.completedDates ?? [],
      },
      missions:
        parsed.missions && parsed.missions.length > 0
          ? parsed.missions
          : fallback.missions,
      achievements:
        parsed.achievements && parsed.achievements.length > 0
          ? parsed.achievements
          : fallback.achievements,
    };
  } catch (err) {
    console.warn('Erro ao carregar estado, usando inicial:', err);
    return buildInitialState();
  }
}

export async function saveState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Erro ao salvar estado:', err);
  }
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
