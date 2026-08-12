#!/usr/bin/env bash
# Non-interactive Supabase install for Hostinger VPS (run as root via SSH).
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/root/supabase-project}"
PUBLIC_URL="${SUPABASE_PUBLIC_URL:-https://supabase.intrawebtech.com}"
SITE_URL="${SITE_URL:-https://portal.intrawebtech.com}"
POOLER_TENANT_ID="${POOLER_TENANT_ID:-intraweb-nexus}"

if [[ -d "$INSTALL_DIR" && -f "$INSTALL_DIR/docker-compose.yml" ]]; then
  echo "Supabase already installed at $INSTALL_DIR"
  cd "$INSTALL_DIR"
  docker compose ps
  exit 0
fi

echo "==> Installing Supabase to $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
work="$(mktemp -d)"
git clone --depth 1 --branch master https://github.com/supabase/supabase.git "$work/supabase"
cp -a "$work/supabase/docker/." "$INSTALL_DIR/"
rm -rf "$work"

cd "$INSTALL_DIR"
cp .env.example .env

if [[ -x utils/generate-keys.sh ]]; then
  sh utils/generate-keys.sh --update-env
fi
if [[ -x utils/add-new-auth-keys.sh ]]; then
  sh utils/add-new-auth-keys.sh --update-env || true
fi

sed -i \
  -e "s|^SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=${PUBLIC_URL}|" \
  -e "s|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=${PUBLIC_URL}|" \
  -e "s|^SITE_URL=.*|SITE_URL=${SITE_URL}|" \
  -e "s|^POOLER_TENANT_ID=.*|POOLER_TENANT_ID=${POOLER_TENANT_ID}|" \
  -e "s|^DASHBOARD_USERNAME=.*|DASHBOARD_USERNAME=supabase|" \
  .env

cat > docker-compose.override.yml <<'EOF'
services:
  kong:
    ports: !reset []
    networks:
      - default
      - edge
  supavisor:
    hostname: supabase-pooler
    ports: !override
      - "127.0.0.1:15432:5432"
      - "127.0.0.1:6543:6543"

networks:
  edge:
    external: true
    name: edge
EOF

export COMPOSE_FILE="docker-compose.yml:docker-compose.override.yml"
docker compose pull
docker compose up -d

echo "==> Waiting for Kong..."
for i in $(seq 1 60); do
  if curl -sf http://127.0.0.1:8000/rest/v1/ >/dev/null 2>&1; then
    echo "Kong is up"
    break
  fi
  sleep 5
done

docker compose ps
echo ""
echo "==> Secrets (save now):"
grep -E '^(POSTGRES_PASSWORD|DASHBOARD_PASSWORD|JWT_SECRET|ANON_KEY|SERVICE_ROLE_KEY|SUPABASE_PUBLISHABLE_KEY|SUPABASE_SECRET_KEY|POOLER_TENANT_ID)=' .env || true
