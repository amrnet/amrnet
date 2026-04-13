#!/bin/bash
# =============================================================================
# Deploy to PRODUCTION from main branch
# Run from your Mac after merging development → main
# =============================================================================
set -euo pipefail

KEY="~/.ssh/dragon.pem"
PROD_IP="52.86.233.198"
PROD_USER="ec2-user"
BRANCH="main"
APP_DIR="/opt/amrnet"

echo "═══════════════════════════════════════"
echo "  AMRnet Production Deploy"
echo "  Branch: ${BRANCH}"
echo "  Target: ${PROD_IP}"
echo "═══════════════════════════════════════"
echo ""

# Safety check
read -p "Deploy ${BRANCH} to PRODUCTION (${PROD_IP})? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# Ensure we're on main and it's clean
echo "[1/5] Checking local branch..."
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "$BRANCH" ]; then
  echo "  Switching to ${BRANCH}..."
  git checkout "$BRANCH"
fi
git pull origin "$BRANCH"
echo "  ✓ On ${BRANCH}, up to date"

# Upload code
echo "[2/5] Uploading code to production..."
rsync -avz --progress \
  --exclude node_modules \
  --exclude client/node_modules \
  --exclude client/build \
  --exclude .git \
  --exclude .env \
  --exclude .credentials \
  -e "ssh -i ${KEY}" \
  . ${PROD_USER}@${PROD_IP}:${APP_DIR}/

# Build and restart on server
echo "[3/5] Installing dependencies..."
ssh -i ${KEY} ${PROD_USER}@${PROD_IP} "cd ${APP_DIR} && npm install --omit=dev --legacy-peer-deps"

echo "[4/5] Building React frontend..."
ssh -i ${KEY} ${PROD_USER}@${PROD_IP} "cd ${APP_DIR}/client && npm install --legacy-peer-deps && npm run build"

echo "[5/5] Restarting application..."
ssh -i ${KEY} ${PROD_USER}@${PROD_IP} "cd ${APP_DIR} && pm2 restart amrnet"

# Verify
echo ""
echo "Verifying..."
sleep 3
HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" https://www.amrnet.org/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✓ Production is healthy (HTTP ${HTTP_CODE})"
else
  echo "  ✗ Production may have issues (HTTP ${HTTP_CODE})"
  echo "  Check logs: ssh -i ${KEY} ${PROD_USER}@${PROD_IP} 'pm2 logs amrnet --lines 20'"
fi

echo ""
echo "═══════════════════════════════════════"
echo "  Production deploy complete!"
echo "  https://www.amrnet.org"
echo "═══════════════════════════════════════"
