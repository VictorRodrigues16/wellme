// ---------------------------------------------------------------------------
// WellMe — Arena ao Vivo (servidor Socket.IO).
//
// Servidor de tempo real para o ranking de heróis. NÃO faz parte do bundle do
// app Expo — roda separado (ex.: Railway). Mantém o leaderboard em memória,
// trata presença e faz broadcast quando um herói ganha XP.
//
// Variáveis de ambiente:
//   PORT         → porta (o Railway injeta automaticamente)
//   CORS_ORIGIN  → origem permitida (ex.: https://wellme-fiap.vercel.app).
//                  Use vírgulas para múltiplas; padrão "*" (apenas para dev).
// ---------------------------------------------------------------------------
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// heroId -> { heroId, socketId, name, xp, level }
const heroes = new Map();

function buildLeaderboard() {
  const entries = [...heroes.values()]
    .map((h) => ({ heroId: h.heroId, name: h.name, xp: h.xp, level: h.level }))
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({ ...e, rank: i + 1 }));
  return { entries, updatedAt: new Date().toISOString() };
}

const httpServer = http.createServer((req, res) => {
  // Healthcheck (útil para "acordar" o serviço e para o Railway monitorar).
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'wellme-arena', online: heroes.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(',').map((s) => s.trim()),
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const auth = socket.handshake.auth || {};
  const heroId = String(auth.heroId || socket.id);

  heroes.set(heroId, {
    heroId,
    socketId: socket.id,
    name: String(auth.name || 'Herói'),
    xp: Number(auth.xp) || 0,
    level: Number(auth.level) || 1,
  });

  io.emit('presence:count', { online: heroes.size });
  io.emit('leaderboard:update', buildLeaderboard());

  socket.on('hero:xp', (p) => {
    const h = heroes.get(heroId);
    if (!h) return;
    const newXp = Number(p && p.xp);
    if (!Number.isFinite(newXp)) return;
    const delta = newXp - h.xp;
    h.xp = newXp;
    h.level = Number(p && p.level) || h.level;
    h.name = String((p && p.name) || h.name);

    if (delta > 0) {
      io.emit('hero:event', {
        id: `${heroId}-${Date.now()}`,
        heroId,
        name: h.name,
        text: `${h.name} ganhou +${delta} XP`,
        delta,
        ts: new Date().toISOString(),
      });
    }
    io.emit('leaderboard:update', buildLeaderboard());
  });

  socket.on('disconnect', () => {
    heroes.delete(heroId);
    io.emit('presence:count', { online: heroes.size });
    io.emit('leaderboard:update', buildLeaderboard());
  });
});

httpServer.listen(PORT, () => {
  console.log(`WellMe Arena server escutando na porta ${PORT} (CORS: ${CORS_ORIGIN})`);
});
