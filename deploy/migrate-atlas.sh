#!/bin/bash
# =============================================================================
# Migrate MongoDB data from Atlas to local MongoDB on EC2
# Run this AFTER setup-ec2.sh
# =============================================================================
set -euo pipefail

# Atlas connection string
ATLAS_URI="mongodb+srv://heroku:REDACTED@clusteramrnet.ff6mu3f.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAMRnet"
LOCAL_URI="mongodb://127.0.0.1:27017"

# All databases and their collections
declare -A DB_COLLECTIONS=(
  ["styphi"]="amrnetdb_styphi"
  ["kpneumo"]="amrnetdb_kpneumo"
  ["ngono"]="amrnetdb_ngono"
  ["ecoli"]="amrnetdb_ecoli"
  ["decoli"]="amrnetdb_decoli"
  ["shige"]="amrnetdb_shige"
  ["senterica"]="amrnetdb_senterica"
  ["sentericaints"]="amrnetdb_ints"
  ["saureus"]="amrnetdb_saureus"
  ["strepneumo"]="amrnetdb_spneumo"
  ["unr"]="unr"
)

DUMP_DIR="/tmp/amrnet_dump"
mkdir -p "$DUMP_DIR"

echo "========================================="
echo "  Atlas → Local MongoDB Migration"
echo "========================================="
echo ""
echo "Total databases to migrate: ${#DB_COLLECTIONS[@]}"
echo ""

# Verify local MongoDB is running
if ! mongosh --quiet --eval "db.runCommand({ping:1})" "$LOCAL_URI" > /dev/null 2>&1; then
  echo "ERROR: Local MongoDB is not running. Start it with: sudo systemctl start mongod"
  exit 1
fi
echo "Local MongoDB: OK"

# Verify Atlas connectivity
if ! mongosh --quiet --eval "db.runCommand({ping:1})" "$ATLAS_URI" > /dev/null 2>&1; then
  echo "ERROR: Cannot connect to Atlas. Check network/credentials."
  exit 1
fi
echo "Atlas connection: OK"
echo ""

TOTAL_START=$(date +%s)

for DB in "${!DB_COLLECTIONS[@]}"; do
  COL="${DB_COLLECTIONS[$DB]}"
  echo "─────────────────────────────────────────"
  echo "[$DB] Dumping $DB/$COL from Atlas..."

  START=$(date +%s)

  # Dump from Atlas
  mongodump \
    --uri="$ATLAS_URI" \
    --db="$DB" \
    --collection="$COL" \
    --out="$DUMP_DIR" \
    --gzip \
    2>&1 | tail -1

  # Also dump any additional collections in the DB (e.g., ints_collection_from_enterica)
  if [ "$DB" = "sentericaints" ]; then
    echo "[$DB] Also dumping ints_collection_from_enterica..."
    mongodump \
      --uri="$ATLAS_URI" \
      --db="$DB" \
      --collection="ints_collection_from_enterica" \
      --out="$DUMP_DIR" \
      --gzip \
      2>&1 | tail -1 || echo "  (collection may not exist, skipping)"
  fi

  # Restore to local
  echo "[$DB] Restoring to local MongoDB..."
  mongorestore \
    --uri="$LOCAL_URI" \
    --db="$DB" \
    --drop \
    --gzip \
    "$DUMP_DIR/$DB" \
    2>&1 | tail -3

  END=$(date +%s)
  ELAPSED=$((END - START))
  echo "[$DB] Done in ${ELAPSED}s"
  echo ""
done

TOTAL_END=$(date +%s)
TOTAL_ELAPSED=$((TOTAL_END - TOTAL_START))

echo "========================================="
echo "  Migration complete! (${TOTAL_ELAPSED}s total)"
echo "========================================="
echo ""

# Verify counts
echo "Document counts (local):"
for DB in "${!DB_COLLECTIONS[@]}"; do
  COL="${DB_COLLECTIONS[$DB]}"
  COUNT=$(mongosh --quiet --eval "db.getSiblingDB('$DB').getCollection('$COL').countDocuments({})" "$LOCAL_URI")
  printf "  %-16s %s documents\n" "$DB" "$COUNT"
done

# Cleanup
rm -rf "$DUMP_DIR"
echo ""
echo "Dump files cleaned up."
