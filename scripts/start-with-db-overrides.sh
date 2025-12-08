#!/usr/bin/env bash
set -euo pipefail

# Start AMRnet dev servers with optional per-organism MONGO_DBNAME overrides.
# Usage:
# 1) Copy `.env.devrev.example` to `.env.devrev` and edit DB names, OR
# 2) Export env vars before running, e.g.:
#    export MONGO_DBNAME_SENTERICA="senterica" \
#           MONGO_DBNAME_ECOLI="ecoli" ; ./scripts/start-with-db-overrides.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# If .env.devrev exists, source it into the environment (safe for simple KEY=VALUE files)
if [ -f ./.env.devrev ]; then
  echo "📥 Loading .env.devrev"
  # Export all variables from the file
  set -o allexport
  # shellcheck disable=SC1091
  source ./.env.devrev
  set +o allexport
fi

# Provide sensible defaults if nothing set (non-destructive)
if [ -z "${MONGO_DBNAME_SENTERICA+x}" ]; then
  MONGO_DBNAME_SENTERICA="senterica"
fi
if [ -z "${MONGO_DBNAME_SENTERICAINTS+x}" ]; then
  MONGO_DBNAME_SENTERICAINTS="sentericaints"
fi
if [ -z "${MONGO_DBNAME_ECOLI+x}" ]; then
  MONGO_DBNAME_ECOLI="ecoli"
fi
if [ -z "${MONGO_DBNAME_STYPHI+x}" ]; then
  MONGO_DBNAME_STYPHI="styphi"
fi
if [ -z "${MONGO_DBNAME_NGONO+x}" ]; then
  MONGO_DBNAME_NGONO="ngono"
fi
if [ -z "${MONGO_DBNAME_KPNEUMO+x}" ]; then
  MONGO_DBNAME_KPNEUMO="kpneumo"
fi
if [ -z "${MONGO_DBNAME_DECOLI+x}" ]; then
  MONGO_DBNAME_DECOLI="decoli"
fi
if [ -z "${MONGO_DBNAME_SHIGE+x}" ]; then
  MONGO_DBNAME_SHIGE="shige"
fi

echo "🌱 Starting AMRnet with DB overrides:" \
     "SENTERICA=$MONGO_DBNAME_SENTERICA" \
     "SENTERICAINTS=$MONGO_DBNAME_SENTERICAINTS" \
     "ECOLI=$MONGO_DBNAME_ECOLI" \
     "STYPHI=$MONGO_DBNAME_STYPHI" \
     "NGONO=$MONGO_DBNAME_NGONO" \
     "KPNEUMO=$MONGO_DBNAME_KPNEUMO" \
     "DECOLI=$MONGO_DBNAME_DECOLI" \
     "SHIGE=$MONGO_DBNAME_SHIGE"

bash ./start-dev.sh
