import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INITIAL_USER,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
} from './initialData';
import type { GameState, Session } from './types';
import {
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  SECURE_HEROCODE_KEY,
} from './secureStorage';

const STORAGE_KEY = '@wellme:state:v1';
const SESSION_KEY = '@wellme:session:v1';

export function buildInitialState(): GameState {
  return {
    user: { ...INITIAL_USER },
    // deep clone para nao mutar INITIAL_MISSIONS
    missions: INITIAL_MISSIONS.map((m) => ({
      ...m,
      content: JSON.parse(JSON.stringify(m.content)),
    })),
    achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
  };
}

interface StoredUser {
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastCompletedDate: string | null;
  completedDates?: string[];
}

interface StoredState {
  user?: StoredUser;
  missions?: GameState['missions'];
  achievements?: GameState['achievements'];
}

export async function loadState(): Promise<GameState> {
  try {
    // Clean up old storage keys (legacy SaudeQuest)
    const oldKeys = [
      '@saudequest:state:v1',
      '@saudequest:state:v2',
      '@saudequest:state:v3',
      '@saudequest:state:v4',
      '@saudequest:state:v5',
    ];
    await AsyncStorage.multiRemove(oldKeys).catch(() => {});

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as StoredState;
    const fallback = buildInitialState();
    return {
      user: {
        ...fallback.user,
        ...(parsed.user ?? {}),
        completedDates: parsed.user?.completedDates ?? [],
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

// ===== Sessao =====
// O heroCode (credencial sensivel) fica no SecureStore (Keychain/Keystore).
// Apenas { name, loggedAt } — dados nao sensiveis — ficam no AsyncStorage.

interface StoredSessionMeta {
  name: string;
  loggedAt: string;
  heroCode?: string; // legado: versoes antigas guardavam o heroCode aqui em texto-puro
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSessionMeta;
    if (typeof parsed.name !== 'string' || typeof parsed.loggedAt !== 'string') {
      return null;
    }

    let heroCode = await getSecureItem(SECURE_HEROCODE_KEY);

    // Migracao one-shot: move heroCode legado (texto-puro no JSON) para o SecureStore
    // e reescreve a sessao sem o campo sensivel.
    if (!heroCode && typeof parsed.heroCode === 'string') {
      heroCode = parsed.heroCode;
      await setSecureItem(SECURE_HEROCODE_KEY, heroCode);
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ name: parsed.name, loggedAt: parsed.loggedAt }),
      );
    }

    if (!heroCode) return null;
    return { name: parsed.name, heroCode, loggedAt: parsed.loggedAt };
  } catch (err) {
    console.warn('Erro ao carregar sessao:', err);
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  try {
    const meta: StoredSessionMeta = {
      name: session.name,
      loggedAt: session.loggedAt,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(meta));
    await setSecureItem(SECURE_HEROCODE_KEY, session.heroCode);
  } catch (err) {
    console.warn('Erro ao salvar sessao:', err);
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  await removeSecureItem(SECURE_HEROCODE_KEY);
}
