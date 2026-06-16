/**
 * Fonte única de configuração via variáveis de ambiente.
 *
 * As variáveis EXPO_PUBLIC_* são embutidas no bundle em tempo de build
 * (são PÚBLICAS por design): use apenas para URLs públicas de servidor,
 * NUNCA para segredos (tokens, senhas, chaves privadas).
 *
 * Importante: o Expo/Metro só faz inline de `process.env.EXPO_PUBLIC_*`
 * quando referenciado de forma ESTÁTICA (como abaixo) — acesso dinâmico
 * (process.env[key]) não é substituído no build.
 */

export type RealtimeMode = 'auto' | 'live' | 'simulated';

const rawMode = process.env.EXPO_PUBLIC_REALTIME_MODE;

export const ENV = {
  /** URL do servidor Socket.IO (ex.: https://wellme-arena.up.railway.app). */
  REALTIME_URL: process.env.EXPO_PUBLIC_REALTIME_URL || undefined,
  /**
   * 'auto'      → conecta se houver REALTIME_URL, senão usa modo simulado
   * 'live'      → força tentativa de conexão real
   * 'simulated' → força modo simulado (demo offline)
   */
  REALTIME_MODE: (rawMode === 'live' || rawMode === 'simulated'
    ? rawMode
    : 'auto') as RealtimeMode,
} as const;

/** Devemos tentar conectar de verdade ao servidor de tempo real? */
export const shouldConnectRealtime =
  ENV.REALTIME_MODE !== 'simulated' && !!ENV.REALTIME_URL;
