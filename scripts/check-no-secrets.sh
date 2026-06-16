#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Checklist "sem segredo no código" — Sprint 4 (rubrica de Segurança).
# Falha (exit 1) se encontrar credenciais ou URLs sensíveis hardcoded fora
# dos lugares permitidos. Rode com: npm run check:secrets
# ---------------------------------------------------------------------------
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 2

FAIL=0
SCAN_DIRS=(app src server scripts)
# Exclui o próprio checker (seus padrões de regex casariam consigo mesmo).
EXCLUDES="--exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.expo --exclude-dir=.git --exclude-dir=build --exclude=check-no-secrets.sh --exclude=*.md"

report() { echo "❌ $1"; echo "$2"; echo; FAIL=1; }

# 1) URLs ws/wss/mqtt hardcoded — devem vir de src/config/env.ts (EXPO_PUBLIC_*)
HITS=$(grep -rnE "wss?://|mqtt://" $EXCLUDES "${SCAN_DIRS[@]}" 2>/dev/null \
  | grep -v "src/config/env.ts" || true)
[ -n "$HITS" ] && report "URL de socket/broker hardcoded (use EXPO_PUBLIC_* em src/config/env.ts):" "$HITS"

# 2) Atribuições de segredo (api_key/secret/password = "valor")
HITS=$(grep -rniE "(api[_-]?key|client[_-]?secret|[_-]?secret|password)[[:space:]]*[:=][[:space:]]*['\"][^'\"]+" $EXCLUDES "${SCAN_DIRS[@]}" 2>/dev/null || true)
[ -n "$HITS" ] && report "Possível segredo hardcoded (api_key/secret/password):" "$HITS"

# 3) Token/UUID no formato do Railway hardcoded no código
HITS=$(grep -rnE "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" $EXCLUDES "${SCAN_DIRS[@]}" 2>/dev/null || true)
[ -n "$HITS" ] && report "Possível token/UUID hardcoded (ex.: token do Railway):" "$HITS"

# 4) Credencial (heroCode) passada como string literal — deve ser sempre variável
HITS=$(grep -rnE "setHeroCode\(['\"]" $EXCLUDES "${SCAN_DIRS[@]}" 2>/dev/null || true)
[ -n "$HITS" ] && report "heroCode hardcoded como literal (gere em runtime, não fixe no bundle):" "$HITS"

# 5) Arquivo .env real versionado por engano
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  report ".env real está no git — remova-o e use .env.local (não versionado)." ".env"
fi

if [ "$FAIL" -eq 0 ]; then
  echo "✅ Nenhum segredo encontrado no código."
fi
exit $FAIL
