#!/usr/bin/env bash
# Run ON THE VPS inside /root/supabase-project (or your install path).
# Collects docker status, resource pressure, and logs for unhealthy services.
set -uo pipefail

PROJECT_DIR="${1:-/root/supabase-project}"
cd "$PROJECT_DIR" || { echo "Missing $PROJECT_DIR"; exit 1; }

echo "========== Host =========="
uptime
free -h
df -h /
echo ""
docker --version
echo ""

echo "========== All containers (incl. non-Supabase on this VPS) =========="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | head -40
echo ""

echo "========== Supabase compose status =========="
docker compose ps -a 2>/dev/null || docker-compose ps -a
echo ""

echo "========== Unhealthy / exited Supabase services =========="
docker compose ps -a 2>/dev/null | awk 'NR==1 || /Exit|unhealthy|starting|Created/' || true
echo ""

echo "========== Memory per container =========="
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}' 2>/dev/null | head -25
echo ""

echo "========== Port listeners (80/443/8000/5432/5678) =========="
ss -tlnp 2>/dev/null | grep -E ':80 |:443 |:8000 |:5432 |:5678 ' || netstat -tlnp 2>/dev/null | grep -E ':80 |:443 |:8000 |:5432 |:5678 '
echo ""

echo "========== Local Kong health (must work on VPS) =========="
curl -sS -o /dev/null -w "localhost:8000/rest/v1/ -> HTTP %{http_code}\n" --connect-timeout 3 http://127.0.0.1:8000/rest/v1/ || echo "Kong not reachable on 127.0.0.1:8000"
echo ""

echo "========== Supabase startup log check =========="
if [[ -f tests/test-container-logs.sh ]]; then
  sh tests/test-container-logs.sh || true
else
  echo "(test-container-logs.sh not found — skip)"
fi
echo ""

echo "========== Last 40 lines — failed-looking services =========="
for svc in db kong auth rest realtime storage studio meta supavisor functions vector imgproxy caddy; do
  state=$(docker compose ps "$svc" 2>/dev/null | tail -1)
  if echo "$state" | grep -qE 'Exit|unhealthy|starting'; then
    echo "--- logs: $svc ---"
    docker compose logs --tail=40 "$svc" 2>/dev/null || true
    echo ""
  fi
done

echo "========== Done — paste this full output for support =========="
