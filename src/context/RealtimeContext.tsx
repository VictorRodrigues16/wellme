import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useGame } from './GameContext';
import { shouldConnectRealtime } from '../config/env';
import {
  createSocket,
  deriveHeroId,
  levelForXp,
  type AppSocket,
  type LeaderboardEntry,
  type HeroEvent,
} from '../realtime/socket';
import { startSimulator, type SimulatorHandle, type SimMe } from '../realtime/simulator';

export type RealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'simulated';

interface RealtimeValue {
  status: RealtimeStatus;
  leaderboard: LeaderboardEntry[];
  feed: HeroEvent[];
  onlineCount: number;
  myHeroId: string | null;
  /** Conecta sob demanda (chamado quando a aba Arena ganha foco). */
  connect: () => void;
  /** Desconecta ao sair da aba (economia de bateria / sem socket ocioso). */
  disconnect: () => void;
  retry: () => void;
}

const RealtimeContext = createContext<RealtimeValue | null>(null);

const FEED_MAX = 8;
const CONNECT_TIMEOUT_MS = 4500;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { session, state, hydrated } = useGame();

  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [feed, setFeed] = useState<HeroEvent[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const socketRef = useRef<AppSocket | null>(null);
  const simRef = useRef<SimulatorHandle | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<RealtimeStatus>('idle');
  const prevXpRef = useRef<number | null>(null);

  // Valores de jogo lidos via ref para manter connect()/startSimulated() estáveis
  // (sem reconectar a cada mudança de XP enquanto a aba está em foco).
  const gameRef = useRef({ session, state, hydrated });
  useEffect(() => {
    gameRef.current = { session, state, hydrated };
  }, [session, state, hydrated]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const myHeroId = session ? deriveHeroId(session.heroCode, session.name) : null;

  const buildMe = useCallback((): SimMe => {
    const g = gameRef.current;
    const xp = g.state?.user.xp ?? 0;
    const code = g.session?.heroCode ?? 'anon';
    const name = g.session?.name ?? g.state?.user.name ?? 'Você';
    return { heroId: deriveHeroId(code, name), name, xp, level: levelForXp(xp) };
  }, []);

  const pushFeed = useCallback((e: HeroEvent) => {
    setFeed((prev) => [e, ...prev].slice(0, FEED_MAX));
  }, []);

  const teardown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (simRef.current) {
      simRef.current.stop();
      simRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const startSimulated = useCallback(() => {
    teardown();
    setStatus('simulated');
    simRef.current = startSimulator(buildMe(), {
      onLeaderboard: setLeaderboard,
      onEvent: pushFeed,
      onPresence: setOnlineCount,
    });
  }, [teardown, buildMe, pushFeed]);

  const connect = useCallback(() => {
    if (
      statusRef.current === 'connected' ||
      statusRef.current === 'simulated' ||
      statusRef.current === 'connecting'
    ) {
      return;
    }
    if (!gameRef.current.session) return;

    // Sem URL ou modo forçado → simulado direto.
    if (!shouldConnectRealtime) {
      startSimulated();
      return;
    }

    setStatus('connecting');
    const socket = createSocket(buildMe());
    if (!socket) {
      startSimulated();
      return;
    }
    socketRef.current = socket;

    // Se não conectar a tempo (servidor dormindo/offline), cai no modo simulado.
    timeoutRef.current = setTimeout(() => {
      if (socketRef.current && !socketRef.current.connected) {
        startSimulated();
      }
    }, CONNECT_TIMEOUT_MS);

    socket.on('connect', () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setStatus('connected');
      const me = buildMe();
      prevXpRef.current = me.xp;
      socket.emit('hero:xp', me);
    });
    socket.on('disconnect', () => {
      if (statusRef.current === 'connected') setStatus('connecting');
    });
    socket.on('leaderboard:update', (p) => setLeaderboard(p.entries));
    socket.on('hero:event', (e) => pushFeed(e));
    socket.on('presence:count', (p) => setOnlineCount(p.online));
  }, [startSimulated, buildMe, pushFeed]);

  const disconnect = useCallback(() => {
    teardown();
    setStatus('idle');
    setLeaderboard([]);
    setFeed([]);
    setOnlineCount(0);
    prevXpRef.current = null;
  }, [teardown]);

  const retry = useCallback(() => {
    teardown();
    setStatus('idle');
    statusRef.current = 'idle';
    setTimeout(() => connect(), 60);
  }, [teardown, connect]);

  // Emite hero:xp quando o XP muda (após conclusão de missão ou passos).
  // Ignora a primeira passada (hidratação) para não emitir "XP fantasma".
  useEffect(() => {
    if (!hydrated) return;
    const xp = state?.user.xp;
    if (xp == null) return;
    if (prevXpRef.current == null) {
      prevXpRef.current = xp;
      return;
    }
    if (xp === prevXpRef.current) return;
    prevXpRef.current = xp;

    const me = buildMe();
    if (status === 'connected' && socketRef.current?.connected) {
      socketRef.current.emit('hero:xp', me);
    } else if (status === 'simulated' && simRef.current) {
      simRef.current.updateMe(me);
    }
  }, [state?.user.xp, hydrated, status, buildMe]);

  // Logout → derruba conexão.
  useEffect(() => {
    if (!session && statusRef.current !== 'idle') {
      teardown();
      setStatus('idle');
    }
  }, [session, teardown]);

  // Cleanup ao desmontar o provider.
  useEffect(() => () => teardown(), [teardown]);

  const value: RealtimeValue = {
    status,
    leaderboard,
    feed,
    onlineCount,
    myHeroId,
    connect,
    disconnect,
    retry,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime precisa estar dentro de RealtimeProvider');
  return ctx;
}
