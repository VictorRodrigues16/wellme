# WellMe — Arena ao Vivo (servidor Socket.IO)

Servidor de tempo real para o ranking de heróis. **Não faz parte do bundle do app** —
roda separado (ex.: Railway), porque o deploy web do app (Vercel, `expo export -p web`)
é estático e **não mantém conexões WebSocket persistentes**.

## Rodar localmente

```bash
cd server
npm install
PORT=3001 CORS_ORIGIN=* npm start
# Healthcheck: http://localhost:3001/health  → {"ok":true,...}
```

No app, aponte para esse servidor criando `.env.local` na raiz do projeto:

```
EXPO_PUBLIC_REALTIME_URL=http://localhost:3001
EXPO_PUBLIC_REALTIME_MODE=auto
```

> Para testar no celular (Expo Go), use o IP da sua máquina na LAN
> (`http://192.168.x.x:3001`) ou um túnel `wss://` (cloudflared/ngrok), pois
> `localhost` aponta para o próprio aparelho.

## Deploy no Railway

1. No painel do Railway: **New Project → Deploy from GitHub repo** (ou `railway up`).
2. **Defina o Root Directory do serviço como `server`** (Settings → Root Directory).
   Assim o Railway instala só as deps do servidor e roda `npm start`.
3. Variáveis de ambiente do serviço:
   - `CORS_ORIGIN = https://wellme-fiap.vercel.app` (domínio do app; use vírgulas para vários)
   - `PORT` → o Railway injeta automaticamente (não precisa definir).
4. O Railway gera uma URL pública `https://<seu-serviço>.up.railway.app`.
5. No app, defina `EXPO_PUBLIC_REALTIME_URL` com essa URL:
   - **Web (Vercel):** adicione a env var no projeto do Vercel e refaça o build.
   - **Dev/Expo Go:** coloque em `.env.local`.

### Deploy via CLI (alternativa)

```bash
npm i -g @railway/cli
railway login            # abre o navegador
cd server
railway init             # cria o projeto
railway up               # publica este diretório
railway domain           # gera a URL pública
```

> Tokens de API do Railway nunca devem ir para o código nem para o `.env` versionado.
> Use `railway login` ou exporte o token só na sua sessão de terminal.

## Eventos (contrato)

| Evento | Direção | Payload |
|---|---|---|
| handshake `auth` | client → server | `{ heroId, name, xp, level }` |
| `hero:xp` | client → server | `{ heroId, name, xp, level }` |
| `leaderboard:update` | server → todos | `{ entries: [{heroId,name,xp,level,rank}], updatedAt }` |
| `hero:event` | server → todos | `{ id, heroId, name, text, delta, ts }` |
| `presence:count` | server → todos | `{ online }` |

O `heroId` é um hash não reversível de `heroCode+nome` — o `heroCode` (credencial)
nunca trafega na rede.
