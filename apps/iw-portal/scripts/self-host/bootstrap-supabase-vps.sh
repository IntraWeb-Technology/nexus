#!/usr/bin/env bash
# Bootstrap self-hosted Supabase on a Hostinger (or any) Linux VPS with Docker.
# Run ON THE VPS as root or a sudo user — not on your laptop.
#
# Prerequisites: Ubuntu/Debian, curl, outbound HTTPS.
# Official docs: https://supabase.com/docs/guides/self-hosting/docker
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-$HOME/supabase-project}"

echo "==> Supabase self-host bootstrap"
echo "    Install directory: $INSTALL_DIR"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker not found — running official Supabase setup.sh (installs Docker on supported distros)"
else
  echo "==> Docker present: $(docker --version)"
fi

if [[ -d "$INSTALL_DIR" && -f "$INSTALL_DIR/docker-compose.yml" ]]; then
  echo "ERROR: $INSTALL_DIR already contains a Supabase stack."
  echo "       Use: cd $INSTALL_DIR && sh run.sh start"
  exit 1
fi

echo ""
echo "==> Running Supabase setup.sh (interactive — set your public HTTPS URL when prompted)"
echo "    Example SUPABASE_PUBLIC_URL: https://supabase.yourdomain.com"
echo ""

curl -fsSL https://supabase.link/setup.sh | sh

if [[ ! -d "$INSTALL_DIR" ]]; then
  # setup.sh default
  INSTALL_DIR="$PWD/supabase-project"
fi

cd "$INSTALL_DIR"

echo ""
echo "==> Starting stack"
sh run.sh start

echo ""
echo "==> Credentials (save to password manager now):"
sh run.sh secrets

echo ""
echo "==> Next steps (manual):"
echo "  1. Configure HTTPS reverse proxy (Caddy/Nginx) → Kong :8000"
echo "  2. ufw allow 22,80,443; restrict 5432/6543 to trusted IPs only"
echo "  3. From dev machine: supabase db push --db-url postgresql://..."
echo "  4. See docs/architecture/supabase-self-host-hostinger.md"
echo ""
echo "Local health check:"
curl -sf "http://127.0.0.1:8000/rest/v1/" -o /dev/null && echo "  REST gateway: OK" || echo "  REST gateway: not ready yet — wait and re-run docker compose ps"
