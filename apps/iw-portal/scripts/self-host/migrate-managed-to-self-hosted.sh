#!/usr/bin/env bash
# Documented migration steps: managed Supabase → self-hosted Postgres.
# Does NOT run dumps automatically — set env vars and uncomment sections you need.
#
# Usage:
#   export MANAGED_DATABASE_URL='postgresql://postgres.[ref]:[pass]@aws-0-....pooler.supabase.com:5432/postgres'
#   export SELF_HOSTED_DATABASE_URL='postgresql://postgres.your-tenant-id:[pass]@187.77.0.115:5432/postgres?sslmode=disable'
#   bash migrate-managed-to-self-hosted.sh
set -euo pipefail

DUMP_FILE="${DUMP_FILE:-./nexus-portal-$(date +%Y%m%d).dump}"

if [[ -z "${MANAGED_DATABASE_URL:-}" ]]; then
  echo "Set MANAGED_DATABASE_URL (Supabase Dashboard → Database → direct connection, port 5432)."
  exit 1
fi

if [[ -z "${SELF_HOSTED_DATABASE_URL:-}" ]]; then
  echo "Set SELF_HOSTED_DATABASE_URL (VPS Supavisor session URL)."
  exit 1
fi

echo "==> Step 1: Dump managed public schema (+ storage metadata tables if needed)"
echo "    Output: $DUMP_FILE"
echo ""
echo "Uncomment the pg_dump block in this script, or run:"
echo ""
cat <<EOF
pg_dump "\$MANAGED_DATABASE_URL" \\
  --format=custom --no-owner --no-acl \\
  --schema=public \\
  -f "$DUMP_FILE"
EOF

# pg_dump "$MANAGED_DATABASE_URL" \
#   --format=custom --no-owner --no-acl \
#   --schema=public \
#   -f "$DUMP_FILE"

echo ""
echo "==> Step 2: Restore to self-hosted"
cat <<EOF
pg_restore --no-owner --no-acl --clean --if-exists \\
  -d "\$SELF_HOSTED_DATABASE_URL" \\
  "$DUMP_FILE"
EOF

# pg_restore --no-owner --no-acl --clean --if-exists \
#   -d "$SELF_HOSTED_DATABASE_URL" \
#   "$DUMP_FILE"

echo ""
echo "==> Step 3: Push any migrations not in dump (from apps/iw-portal)"
cat <<'EOF'
cd apps/iw-portal
pnpm exec supabase db push --db-url "$SELF_HOSTED_DATABASE_URL"
pnpm exec supabase migration list --db-url "$SELF_HOSTED_DATABASE_URL"
EOF

echo ""
echo "==> Step 4: Storage — re-copy bucket objects"
echo "    Buckets: client-uploads, change-order-packets"
echo "    Use Supabase CLI or custom script; paths are project_id/... in DB."

echo ""
echo "==> Step 5: Update Vercel env — see .env.self-hosted.example"
