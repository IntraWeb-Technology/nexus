#!/usr/bin/env bash
# Fix 502 Bad Gateway for supabase.intrawebtech.com on the Hostinger VPS.
# Caddy (edge network) is up but Kong is not reachable.
#
# Run ON THE VPS as root:
#   bash fix-supabase-502-edge.sh
#
# Prereq: Supabase project at /root/supabase-project (from setup.sh).
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/root/supabase-project}"
PUBLIC_URL="${SUPABASE_PUBLIC_URL:-https://supabase.intrawebtech.com}"

cd "$PROJECT_DIR" || { echo "Missing $PROJECT_DIR — run setup.sh first."; exit 1; }

echo "==> Ensuring Docker edge network exists (shared with n8n Caddy)"
docker network inspect edge >/dev/null 2>&1 || docker network create edge

echo "==> Wiring Kong + pooler to edge network and binding Kong to localhost:8000"
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

echo "==> Register override with run.sh (required — override is NOT auto-loaded)"
if [[ -x ./run.sh ]]; then
  sh run.sh config add override 2>/dev/null || true
  sh run.sh config show
fi

export COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml:docker-compose.override.yml}"

echo "==> Starting Supabase stack"
if [[ -x ./run.sh ]]; then
  sh run.sh pull || docker compose pull
  # Free 127.0.0.1:8000 if a stale kong container holds the port after a failed recreate
  if ss -tlnp 2>/dev/null | grep -q '127.0.0.1:8000' || netstat -tlnp 2>/dev/null | grep -q '127.0.0.1:8000'; then
    stale=$(docker ps -aq --filter name=supabase-kong 2>/dev/null || true)
    if [[ -n "$stale" ]]; then
      echo "==> Stopping stale supabase-kong before recreate"
      docker stop supabase-kong 2>/dev/null || true
      docker rm supabase-kong 2>/dev/null || true
    fi
  fi
  sh run.sh recreate kong supavisor || docker compose up -d --force-recreate kong supavisor
else
  docker compose pull
  docker compose up -d --force-recreate kong supavisor
fi

echo "==> Waiting for Kong on 127.0.0.1:8000 (up to 5 min)..."
for i in $(seq 1 60); do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 3 http://127.0.0.1:8000/rest/v1/ 2>/dev/null || echo "000")
  if [[ "$code" != "000" ]]; then
    echo "Kong responded: HTTP $code"
    break
  fi
  if [[ "$i" -eq 60 ]]; then
    echo "ERROR: Kong still not reachable. Run diagnose-supabase-vps.sh and check docker compose logs kong db"
    docker compose ps -a
    exit 1
  fi
  sleep 5
done

echo ""
echo "==> Container status"
docker compose ps

echo ""
echo "==> External check (expect 401 or 200, not 502)"
ext=$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 10 "${PUBLIC_URL}/auth/v1/" 2>/dev/null || echo "000")
echo "${PUBLIC_URL}/auth/v1/ -> HTTP $ext"

if [[ "$ext" == "502" ]]; then
  echo ""
  echo "Still 502: Kong is up on the host but Caddy cannot reach it."
  echo ""
  echo "1) Confirm Kong joined the edge network:"
  echo "   docker inspect supabase-kong --format '{{range \$k,\$v := .NetworkSettings.Networks}}{{printf \"%s \" \$k}}{{end}}'"
  echo "   (must include 'edge')"
  echo ""
  echo "2) List containers on edge (note the Kong container name):"
  echo "   docker network inspect edge --format '{{range .Containers}}{{.Name}} {{end}}'"
  echo ""
  echo "3) Find Caddy and its config:"
  echo "   docker ps --format '{{.Names}}' | grep -i caddy"
  echo "   # then inspect mounts or exec cat Caddyfile"
  echo ""
  echo "4) Caddy must reverse_proxy to the Kong *container name* on edge, NOT 127.0.0.1:8000"
  echo "   Example Caddyfile block:"
  echo "   supabase.intrawebtech.com {"
  echo "     reverse_proxy supabase-kong:8000"
  echo "   }"
  echo "   Then reload Caddy: docker exec <caddy-container> caddy reload --config /etc/caddy/Caddyfile"
fi

if [[ "$ext" == "401" || "$ext" == "200" ]]; then
  echo ""
  echo "SUCCESS. Save credentials:"
  if [[ -x ./run.sh ]]; then sh run.sh secrets; else grep -E '^(POSTGRES_PASSWORD|DASHBOARD_PASSWORD|JWT_SECRET|ANON_KEY|SERVICE_ROLE_KEY|SUPABASE_PUBLISHABLE_KEY|SUPABASE_SECRET_KEY)=' .env; fi
fi
