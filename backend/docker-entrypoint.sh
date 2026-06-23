#!/bin/sh
set -e

echo "[backend] Running database migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "[backend] RUN_SEED=true, seeding database..."
  npx prisma db seed
else
  echo "[backend] Skipping seed (set RUN_SEED=true for first deploy only)"
fi

exec npm run start:prod
