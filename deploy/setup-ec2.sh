#!/bin/bash
# =============================================================================
# AMRnet EC2 Setup Script — Run on a fresh Amazon Linux 2023 / Ubuntu 24.04
# Region: us-east-2 (Ohio)
# Instance: t3.xlarge (4 vCPU, 16 GB RAM)
# =============================================================================
set -euo pipefail

echo "========================================="
echo "  AMRnet EC2 Setup — $(date)"
echo "========================================="

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  OS="unknown"
fi

echo "Detected OS: $OS"

# -----------------------------------------------------------
# 1. System updates
# -----------------------------------------------------------
echo "[1/6] Updating system packages..."
if [ "$OS" = "amzn" ]; then
  sudo dnf update -y
  sudo dnf install -y git gcc-c++ make tar gzip
elif [ "$OS" = "ubuntu" ]; then
  sudo apt-get update -y && sudo apt-get upgrade -y
  sudo apt-get install -y git build-essential curl gnupg
fi

# -----------------------------------------------------------
# 2. Install Node.js 22 LTS
# -----------------------------------------------------------
echo "[2/6] Installing Node.js 22..."
if [ "$OS" = "amzn" ]; then
  curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
  sudo dnf install -y nodejs
elif [ "$OS" = "ubuntu" ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install pm2 globally
sudo npm install -g pm2

# -----------------------------------------------------------
# 3. Install MongoDB 7.0 Community
# -----------------------------------------------------------
echo "[3/6] Installing MongoDB 7.0..."
if [ "$OS" = "amzn" ]; then
  cat <<'REPO' | sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
REPO
  sudo dnf install -y mongodb-org
elif [ "$OS" = "ubuntu" ]; then
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  sudo apt-get update -y
  sudo apt-get install -y mongodb-org
fi

# Configure MongoDB for performance
sudo tee /etc/mongod.conf > /dev/null <<'MONGOCFG'
storage:
  dbPath: /var/lib/mongo
  wiredTiger:
    engineConfig:
      cacheSizeGB: 6

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
MONGOCFG

sudo systemctl start mongod
sudo systemctl enable mongod
echo "MongoDB status: $(sudo systemctl is-active mongod)"

# -----------------------------------------------------------
# 4. Install nginx (reverse proxy)
# -----------------------------------------------------------
echo "[4/6] Installing nginx..."
if [ "$OS" = "amzn" ]; then
  sudo dnf install -y nginx
elif [ "$OS" = "ubuntu" ]; then
  sudo apt-get install -y nginx
fi

# Configure nginx as reverse proxy
sudo tee /etc/nginx/conf.d/amrnet.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    # Increase timeouts for large data transfers
    proxy_read_timeout 300s;
    proxy_connect_timeout 60s;
    proxy_send_timeout 300s;

    # Increase max body size for data uploads
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_types application/json text/plain text/css application/javascript;
    gzip_min_length 1000;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Remove default config
sudo rm -f /etc/nginx/conf.d/default.conf
if [ "$OS" = "ubuntu" ]; then
  sudo rm -f /etc/nginx/sites-enabled/default
fi

sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
echo "nginx status: $(sudo systemctl is-active nginx)"

# -----------------------------------------------------------
# 5. Install mongodump/mongorestore tools
# -----------------------------------------------------------
echo "[5/6] Installing MongoDB database tools..."
if [ "$OS" = "amzn" ]; then
  sudo dnf install -y mongodb-database-tools
elif [ "$OS" = "ubuntu" ]; then
  sudo apt-get install -y mongodb-database-tools
fi

# -----------------------------------------------------------
# 6. Create app directory
# -----------------------------------------------------------
echo "[6/6] Creating app directory..."
sudo mkdir -p /opt/amrnet
sudo chown "$(whoami)" /opt/amrnet

echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Run: ./migrate-atlas.sh   (migrate data from Atlas)"
echo "  2. Run: ./deploy-app.sh      (deploy AMRnet)"
echo ""
echo "Services running:"
echo "  MongoDB:  $(sudo systemctl is-active mongod) on port 27017"
echo "  nginx:    $(sudo systemctl is-active nginx) on port 80"
echo ""
