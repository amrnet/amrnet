#!/bin/bash
# =============================================================================
# Deploy AMRnet application on EC2
# Run this AFTER setup-ec2.sh and migrate-atlas.sh
# =============================================================================
set -euo pipefail

APP_DIR="/opt/amrnet"
REPO_URL="https://github.com/lshtm-genomics/amrnet.git"  # adjust if different

echo "========================================="
echo "  AMRnet Deployment"
echo "========================================="

# -----------------------------------------------------------
# 1. Clone or update repo
# -----------------------------------------------------------
if [ -d "$APP_DIR/.git" ]; then
  echo "[1/5] Updating existing repo..."
  cd "$APP_DIR"
  git pull origin main || git pull origin master
else
  echo "[1/5] Cloning repository..."
  # If you're deploying from local, use scp instead:
  #   scp -r /path/to/amrnet/* ec2-user@<EC2_IP>:/opt/amrnet/
  # For now, assume code is already in $APP_DIR
  if [ ! -f "$APP_DIR/server.js" ]; then
    echo "ERROR: No code found in $APP_DIR"
    echo "Upload your code first:"
    echo "  From your Mac, run:"
    echo "  rsync -avz --exclude node_modules --exclude .git --exclude client/node_modules \\"
    echo "    /Users/lshlt19/GitHub/051225_devrev-final/amrnet/ ec2-user@<EC2_IP>:/opt/amrnet/"
    exit 1
  fi
fi

cd "$APP_DIR"

# -----------------------------------------------------------
# 2. Create production .env
# -----------------------------------------------------------
echo "[2/5] Creating production .env..."
cat > "$APP_DIR/.env" <<'ENV'
# MongoDB — local instance (no Atlas dependency)
MONGODB_URI="mongodb://127.0.0.1:27017"
MONGO_URI="mongodb://127.0.0.1:27017"

# Per-organism DB names
MONGO_DBNAME_SENTERICA="senterica"
MONGO_DBNAME_SENTERICAINTS="sentericaints"
MONGO_DBNAME_ECOLI="ecoli"
MONGO_DBNAME_SHIGE="shige"
MONGO_DBNAME_STYPHI="styphi"
MONGO_DBNAME_KPNEUMO="kpneumo"
MONGO_DBNAME_DECOLI="decoli"
MONGO_DBNAME_NGONO="ngono"
MONGO_DBNAME_SAUREUS="saureus"
MONGO_DBNAME_STREPNEUMO="strepneumo"

# Server
PORT=8080
NODE_ENV=production

# Frontend
REACT_APP_API_URL=/api/
ENV

echo "  .env created (using local MongoDB)"

# -----------------------------------------------------------
# 3. Install dependencies
# -----------------------------------------------------------
echo "[3/5] Installing server dependencies..."
npm install --omit=dev --legacy-peer-deps

echo "[3/5] Installing client dependencies..."
cd "$APP_DIR/client"
npm install --legacy-peer-deps

# -----------------------------------------------------------
# 4. Build React frontend
# -----------------------------------------------------------
echo "[4/5] Building React production bundle..."
npm run build

cd "$APP_DIR"

# -----------------------------------------------------------
# 5. Start with pm2
# -----------------------------------------------------------
echo "[5/5] Starting AMRnet with pm2..."

# Stop existing instance if any
pm2 delete amrnet 2>/dev/null || true

# Start with production settings
pm2 start server.js \
  --name amrnet \
  --max-memory-restart 12G \
  --node-args="--max-old-space-size=12288" \
  --env production

# Save pm2 process list (auto-restart on reboot)
pm2 save

# Setup pm2 startup script
pm2 startup 2>&1 | tail -1
echo ""
echo "  If prompted, run the sudo command above to enable auto-start on reboot."

echo ""
echo "========================================="
echo "  Deployment complete!"
echo "========================================="
echo ""
echo "AMRnet is running at:"
echo "  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<EC2_PUBLIC_IP>'):80"
echo ""
echo "Useful commands:"
echo "  pm2 logs amrnet     — view logs"
echo "  pm2 restart amrnet  — restart app"
echo "  pm2 monit           — monitor CPU/RAM"
echo ""
echo "To PAUSE (stop costs after demo):"
echo "  1. AWS Console → EC2 → Select instance → Instance State → Stop"
echo "  2. You'll only pay for EBS storage (~$0.50/day) while stopped"
echo "  3. To resume: Instance State → Start (IP may change)"
echo ""
