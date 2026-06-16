# WellMe — Sprint 4 (Mobile + IoT)

Documento de entrega da Sprint 4. Resume o que foi implementado, como cada item da
rubrica é atendido, como rodar e o roteiro do vídeo.

## Mapeamento da rubrica

| Requisito | Peso | Como atendemos | Onde |
|---|---|---|---|
| **Comunicação em tempo real** | 20% | **Arena ao Vivo**: ranking de heróis em tempo real via **Socket.IO** (eventos cliente↔servidor; a UI reordena sozinha ao receber `leaderboard:update`). | `app/(tabs)/arena.tsx`, `src/context/RealtimeContext.tsx`, `src/realtime/*`, `server/` |
| **Funcionalidade nativa** | 30% | **Pedômetro** (`expo-sensors`) conta passos reais → viram XP; **notificações locais** (`expo-notifications`) de hidratação/movimento. Permissões on-demand com tratamento de recusa. | `app/(tabs)/movimento.tsx`, `src/context/PedometerContext.tsx`, `src/services/notificationsService.ts` |
| **Integração IoT** | ~~20%~~ | **Não implementado** — produto software-only, sem hardware. Justificativa transparente para avaliação. | [docs/JUSTIFICATIVA_IOT.md](./JUSTIFICATIVA_IOT.md) |
| **Qualidade UI/UX + Segurança** | 15% | `StateView`/`ConnectionBadge` padronizam estados (vazio/loading/erro/sucesso) em todas as telas. `heroCode` no **SecureStore** (Keychain/Keystore); URLs via `EXPO_PUBLIC_*`; `npm run check:secrets`. | `src/components/ui/*`, `src/data/secureStorage.ts`, `src/config/env.ts`, `scripts/check-no-secrets.sh` |
| **Documentação** | 15% | README atualizado, este doc, justificativa de IoT, runbook do servidor, roteiro de vídeo. | `README.md`, `docs/`, `server/README.md` |

> Teto de nota assumido sem IoT: ~80%. Ver justificativa.

## Comunicação em tempo real — Arena ao Vivo

- O cliente conecta **sob demanda** (ao focar a aba Arena) e desconecta ao sair (economia de bateria).
- Quando o XP muda (missão concluída ou passos), o app emite `hero:xp`; o servidor faz
  broadcast `leaderboard:update` e **todas as telas reordenam automaticamente**.
- **Presence** mostra "X heróis online"; um **feed** mostra os eventos recentes.
- **Resiliência:** se não houver servidor configurado / ele estiver fora do ar, o app cai
  em **modo simulado** (bots) e o `ConnectionBadge` mostra "Simulado" — a tela nunca quebra.
- O servidor Socket.IO fica em `server/` e é publicado separado (Railway). Ver
  [server/README.md](../server/README.md). O `heroId` é um hash de `heroCode+nome` — a
  credencial nunca trafega.

## Funcionalidade nativa — Movimento

- `expo-sensors` (Pedometer): `getStepCountAsync` (iOS, histórico do dia) +
  `watchStepCount` (iOS/Android, ao vivo). A cada 1000 passos → +20 XP (cap diário).
- `expo-notifications`: lembretes **locais** (funcionam em Expo Go). Trigger `TIME_INTERVAL`
  com `type` (SDK 54); botão "Testar lembrete (15s)" para a demo.
- **Permissões:** solicitadas on-demand; recusa tratada com fallback (mensagem + abrir
  Configurações), nunca trava o app.
- **Web:** sensor/notificações não existem no navegador → guard `Platform.OS === 'web'`
  com fallback "Simular +1000 passos" para a feature continuar demonstrável no Vercel.

## Segurança

- `heroCode` (credencial) movido para `expo-secure-store` (Keychain/Keystore). No web,
  cai para AsyncStorage com aviso — documentado como credencial mock (não senha real).
- Nenhuma URL/segredo hardcoded: tudo em `EXPO_PUBLIC_*` lido por `src/config/env.ts`.
- `npm run check:secrets` falha o build se achar URL `ws/wss/mqtt`, `api_key/secret/password`
  ou tokens/UUID hardcoded.

## Como rodar

```bash
npm install
# (opcional) tempo real real: rode o servidor e configure a URL
#   cd server && npm install && PORT=3001 npm start
#   crie .env.local com EXPO_PUBLIC_REALTIME_URL=http://localhost:3001
npm run ios     # ou: npm run android / npm run web
npm run typecheck
npm run check:secrets
```

Sem `EXPO_PUBLIC_REALTIME_URL`, a Arena roda em **modo simulado** (demo funciona offline).

## Roteiro do vídeo (gravar em segmentos por feature)

1. **Login** → mostrar `heroCode` (vai para o SecureStore) e a Trilha carregando com `StateView`.
2. **Segurança:** rodar `npm run check:secrets` no terminal (saída verde) e abrir `src/config/env.ts`.
3. **Movimento (device físico):** ativar o contador, mostrar o prompt de permissão, caminhar
   e ver os passos subirem; ao cruzar 1000 passos, ver o XP subir na Trilha/Perfil. Ativar um
   lembrete e mostrar a notificação local (botão "Testar lembrete (15s)").
4. **Arena (2 aparelhos):** abrir a aba Arena nos dois, mostrar "2 heróis online"; completar
   uma missão num e ver o ranking reordenar no outro em tempo real; mostrar o feed.
5. **Resiliência:** derrubar o servidor e mostrar o badge virar "Simulado" sem quebrar.
6. **Web (Vercel):** abrir o app no navegador e mostrar os fallbacks elegantes.
7. **IoT:** ler a justificativa ([docs/JUSTIFICATIVA_IOT.md](./JUSTIFICATIVA_IOT.md)).

## Estrutura nova (Sprint 4)

```
app/(tabs)/arena.tsx            # tela de tempo real
app/(tabs)/movimento.tsx        # tela do pedômetro + notificações
src/context/RealtimeContext.tsx # Socket.IO (lazy-connect + fallback simulado)
src/context/PedometerContext.tsx# passos → XP
src/realtime/socket.ts          # contrato de eventos + helpers
src/realtime/simulator.ts       # modo simulado da Arena
src/services/notificationsService.ts
src/components/ui/StateView.tsx       # estados vazio/loading/erro/sucesso
src/components/ui/ConnectionBadge.tsx # status de conexão
src/data/secureStorage.ts       # heroCode no Keychain/Keystore
src/config/env.ts               # EXPO_PUBLIC_* centralizado
scripts/check-no-secrets.sh     # checklist de segurança
server/                         # servidor Socket.IO (deploy no Railway)
```
