import {
  type LeaderboardEntry,
  type HeroEvent,
  levelForXp,
  withRanks,
} from './socket';

/**
 * Modo simulado da Arena: quando NÃO há servidor (sem EXPO_PUBLIC_REALTIME_URL,
 * modo 'simulated', ou falha de conexão), bots ganham XP localmente para a
 * tela nunca aparecer quebrada na demonstração. A UI mostra o badge "Simulado".
 */

export interface SimMe {
  heroId: string;
  name: string;
  xp: number;
  level: number;
}

export interface SimulatorHandle {
  stop: () => void;
  updateMe: (me: SimMe) => void;
}

interface Bot {
  heroId: string;
  name: string;
  xp: number;
}

const BOT_NAMES = ['Lia 🤖', 'Téo 🤖', 'Mia 🤖', 'Caio 🤖'];

export interface SimulatorCallbacks {
  onLeaderboard: (entries: LeaderboardEntry[]) => void;
  onEvent: (e: HeroEvent) => void;
  onPresence: (online: number) => void;
}

export function startSimulator(
  initialMe: SimMe,
  cb: SimulatorCallbacks,
): SimulatorHandle {
  let me = initialMe;
  const bots: Bot[] = BOT_NAMES.map((name, i) => ({
    heroId: `bot-${i}`,
    name,
    xp: 60 + Math.floor(Math.random() * 240),
  }));

  let evtCounter = 0;

  const emitLeaderboard = () => {
    const entries = withRanks([
      { heroId: me.heroId, name: me.name, xp: me.xp, level: me.level },
      ...bots.map((b) => ({
        heroId: b.heroId,
        name: b.name,
        xp: b.xp,
        level: levelForXp(b.xp),
      })),
    ]);
    cb.onLeaderboard(entries);
  };

  // estado inicial
  cb.onPresence(bots.length + 1);
  emitLeaderboard();

  const tick = setInterval(() => {
    const bot = bots[Math.floor(Math.random() * bots.length)];
    const delta = 10 + Math.floor(Math.random() * 50);
    bot.xp += delta;
    evtCounter += 1;
    cb.onEvent({
      id: `sim-${evtCounter}`,
      heroId: bot.heroId,
      name: bot.name,
      text: `${bot.name} ganhou +${delta} XP`,
      delta,
      ts: new Date().toISOString(),
    });
    emitLeaderboard();
  }, 4000);

  return {
    stop: () => clearInterval(tick),
    updateMe: (next: SimMe) => {
      me = next;
      emitLeaderboard();
    },
  };
}
