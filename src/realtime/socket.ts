import { io, type Socket } from 'socket.io-client';
import { ENV } from '../config/env';
import { XP_PER_LEVEL } from '../data/initialData';

// ===== Tipos de eventos (cliente <-> servidor) =====

export interface LeaderboardEntry {
  heroId: string;
  name: string;
  xp: number;
  level: number;
  rank: number;
}

export interface HeroEvent {
  id: string;
  heroId: string;
  name: string;
  text: string;
  delta: number;
  ts: string;
}

export interface ServerToClient {
  'leaderboard:update': (p: { entries: LeaderboardEntry[]; updatedAt: string }) => void;
  'hero:event': (p: HeroEvent) => void;
  'presence:count': (p: { online: number }) => void;
}

export interface ClientToServer {
  'hero:xp': (p: { heroId: string; name: string; xp: number; level: number }) => void;
}

export type AppSocket = Socket<ServerToClient, ClientToServer>;

export interface SocketAuth {
  heroId: string;
  name: string;
  xp: number;
  level: number;
}

/** Cria o socket apontando para EXPO_PUBLIC_REALTIME_URL. Retorna null se não houver URL. */
export function createSocket(auth: SocketAuth): AppSocket | null {
  if (!ENV.REALTIME_URL) return null;
  return io(ENV.REALTIME_URL, {
    transports: ['websocket', 'polling'],
    auth,
    reconnectionAttempts: 5,
    timeout: 4000,
    autoConnect: true,
  });
}

export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** Ordena por XP (desc) e atribui rank 1..n. */
export function withRanks(
  list: Omit<LeaderboardEntry, 'rank'>[],
): LeaderboardEntry[] {
  return [...list]
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

/**
 * id estável e NÃO reversível para o herói, derivado de heroCode+nome.
 * Evita expor o heroCode (credencial) na rede / em outros clientes.
 */
export function deriveHeroId(heroCode: string, name: string): string {
  const input = `${heroCode}::${name}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return 'h' + h.toString(36);
}
