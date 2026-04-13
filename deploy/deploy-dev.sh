#!/bin/bash
# =============================================================================
# Deploy to DEV instance from development branch
# Run from your Mac to test changes before production
# =============================================================================
set -euo pipefail

KEY="~/.ssh/dragon.pem"
DEV_IP="3.88.180.89"  # Update after creating dev instance
DEV_USER="ec2-user"
BRANCH="development"
APP_DIR="/opt/amrnet"

echo "═══════════════════════════════════════"
echo "  AMRnet Dev Deploy"
echo "  Branch: ${BRANCH}"
echo "  Target: ${DEV_IP}"
echo "═══════════════════════════════════════"
echo ""

# Ensure we're on development
echo "[1/5] Checking local branch..."
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "$BRANCH" ]; then
  echo "  Switching to ${BRANCH}..."
  git checkout "$BRANCH"
fi
git pull origin "$BRANCH" 2>/dev/null || true
echo "  ✓ On ${BRANCH}"

# Upload code
echo "[2/5] Uploading code to dev..."
rsync -avz --progress \
  --exclude node_modules \
  --exclude client/node_modules \
  --exclude client/build \
  --exclude .git \
  --exclude .env \
  --exclude .credentials \
  -e "ssh -i ${KEY}" \
  . ${DEV_USER}@${DEV_IP}:${APP_DIR}/

# Build and restart
echo "[3/5] Installing dependencies..."
ssh -i ${KEY} ${DEV_USER}@${DEV_IP} "cd ${APP_DIR} && npm install --omit=dev --legacy-peer-deps"

echo "[4/5] Building React frontend..."
ssh -i ${KEY} ${DEV_USER}@${DEV_IP} "cd ${APP_DIR}/client && npm install --legacy-peer-deps && npm run build"

echo "[5/5] Restarting application..."
ssh -i ${KEY} ${DEV_USER}@${DEV_IP} "cd ${APP_DIR} && pm2 restart amrnet"

# Verify
sleep 3
HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" http://${DEV_IP}/health 2>/dev/null || echo "000")
echo ""
echo "Dev instance: http://${DEV_IP} (HTTP ${HTTP_CODE})"
echo ""
