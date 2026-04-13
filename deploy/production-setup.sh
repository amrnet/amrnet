#!/bin/bash
# =============================================================================
# AMRnet Production Hardening — Run ON EC2
# =============================================================================
set -euo pipefail

BUCKET="amrnet-datalake-730335416977"
REGION="us-east-2"
MONGO_ADMIN_USER="amrnet_admin"
MONGO_ADMIN_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
MONGO_APP_USER="amrnet_app"
MONGO_APP_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)

echo "═══════════════════════════════════════"
echo "  AMRnet Production Setup"
echo "═══════════════════════════════════════"
echo ""

# ─────────────────────────────────────────
# 1. MongoDB Authentication
# ─────────────────────────────────────────
echo "[1/7] Securing MongoDB with authentication..."

# Create admin and app users
mongosh --quiet <<MONGOEOF
use admin
db.createUser({
  user: "${MONGO_ADMIN_USER}",
  pwd: "${MONGO_ADMIN_PASS}",
  roles: [{ role: "root", db: "admin" }]
});

// App user with readWrite on all organism databases
db.createUser({
  user: "${MONGO_APP_USER}",
  pwd: "${MONGO_APP_PASS}",
  roles: [
    { role: "readWrite", db: "styphi" },
    { role: "readWrite", db: "kpneumo" },
    { role: "readWrite", db: "ngono" },
    { role: "readWrite", db: "ecoli" },
    { role: "readWrite", db: "decoli" },
    { role: "readWrite", db: "shige" },
    { role: "readWrite", db: "senterica" },
    { role: "readWrite", db: "sentericaints" },
    { role: "readWrite", db: "saureus" },
    { role: "readWrite", db: "strepneumo" },
    { role: "readWrite", db: "unr" },
    { role: "readWrite", db: "amrnet_admin" }
  ]
});

print("✓ MongoDB users created");
MONGOEOF

# Enable auth in mongod config
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
  logRotate: reopen

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
MONGOCFG

sudo systemctl restart mongod
sleep 2
echo "  ✓ MongoDB auth enabled"

# ─────────────────────────────────────────
# 2. Update .env with auth credentials
# ─────────────────────────────────────────
echo "[2/7] Updating production .env..."

cat > /opt/amrnet/.env <<ENVEOF
# MongoDB — local with authentication
MONGODB_URI="mongodb://${MONGO_APP_USER}:${MONGO_APP_PASS}@127.0.0.1:27017/?authSource=admin"
MONGO_URI="mongodb://${MONGO_APP_USER}:${MONGO_APP_PASS}@127.0.0.1:27017/?authSource=admin"

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
ENVEOF

echo "  ✓ .env updated with auth credentials"

# ─────────────────────────────────────────
# 3. nginx production config
# ─────────────────────────────────────────
echo "[3/7] Configuring nginx for production..."

sudo tee /etc/nginx/conf.d/amrnet.conf > /dev/null <<'NGINX'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=download:10m rate=2r/s;

server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_types application/json text/plain text/css application/javascript text/csv;
    gzip_min_length 500;
    gzip_comp_level 6;
    gzip_vary on;

    # Timeouts
    proxy_read_timeout 600s;
    proxy_connect_timeout 60s;
    proxy_send_timeout 600s;
    client_max_body_size 10M;

    # Health check (no proxy needed)
    location /health {
        return 200 '{"status":"ok","timestamp":"$time_iso8601"}';
        add_header Content-Type application/json;
    }

    # API rate limiting
    location /api/v1/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Download endpoint — stricter rate limit
    location /api/v1/organisms/ {
        limit_req zone=download burst=5 nodelay;
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets — long cache
    location /static/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Everything else
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

    # Block sensitive paths
    location ~ /\. { deny all; }
    location ~ \.env$ { deny all; }
}
NGINX

sudo nginx -t && sudo systemctl restart nginx
echo "  ✓ nginx production config applied"

# ─────────────────────────────────────────
# 4. PM2 production mode + auto-restart
# ─────────────────────────────────────────
echo "[4/7] Configuring PM2 for production..."

pm2 delete amrnet 2>/dev/null || true

cd /opt/amrnet
pm2 start server.js \
  --name amrnet \
  --max-memory-restart 12G \
  --node-args="--max-old-space-size=12288" \
  -i 1 \
  --env production \
  --merge-logs \
  --log-date-format "YYYY-MM-DD HH:mm:ss Z"

pm2 save

# Auto-start on reboot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null || true
pm2 save

echo "  ✓ PM2 configured with auto-restart"

# ─────────────────────────────────────────
# 5. Log rotation
# ─────────────────────────────────────────
echo "[5/7] Setting up log rotation..."

sudo tee /etc/logrotate.d/amrnet > /dev/null <<'LOGROTATE'
/home/ec2-user/.pm2/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}

/var/log/mongodb/mongod.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    postrotate
        /bin/kill -SIGUSR1 $(cat /var/lib/mongo/mongod.lock 2>/dev/null) 2>/dev/null || true
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    postrotate
        /bin/systemctl reload nginx 2>/dev/null || true
    endscript
}
LOGROTATE

echo "  ✓ Log rotation configured (14 days retention)"

# ─────────────────────────────────────────
# 6. Daily S3 backup cron
# ─────────────────────────────────────────
echo "[6/7] Setting up daily backups to S3..."

sudo tee /opt/amrnet/backup-to-s3.sh > /dev/null <<BACKUP
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M)
DUMP_DIR="/tmp/amrnet_backup_\$DATE"

echo "[\$(date)] Starting AMRnet backup..."

mongodump \
  --uri="mongodb://${MONGO_APP_USER}:${MONGO_APP_PASS}@127.0.0.1:27017/?authSource=admin" \
  --out="\$DUMP_DIR" --gzip 2>/dev/null

tar -czf "/tmp/amrnet_backup_\$DATE.tar.gz" -C "/tmp" "amrnet_backup_\$DATE"

aws s3 cp "/tmp/amrnet_backup_\$DATE.tar.gz" \
  "s3://${BUCKET}/backups/amrnet_backup_\$DATE.tar.gz" \
  --region "${REGION}" --quiet

rm -rf "\$DUMP_DIR" "/tmp/amrnet_backup_\$DATE.tar.gz"

echo "[\$(date)] Backup complete → s3://${BUCKET}/backups/amrnet_backup_\$DATE.tar.gz"
BACKUP

sudo chmod +x /opt/amrnet/backup-to-s3.sh

# Add daily cron at 3 AM UTC
(crontab -l 2>/dev/null | grep -v backup-to-s3; echo "0 3 * * * /opt/amrnet/backup-to-s3.sh >> /var/log/amrnet-backup.log 2>&1") | crontab -

echo "  ✓ Daily backup cron installed (3 AM UTC)"

# ─────────────────────────────────────────
# 7. Save credentials securely
# ─────────────────────────────────────────
echo "[7/7] Saving credentials..."

CREDS_FILE="/opt/amrnet/.credentials"
cat > "$CREDS_FILE" <<CREDS
# AMRnet Production Credentials — KEEP SECURE
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

MongoDB Admin:    ${MONGO_ADMIN_USER} / ${MONGO_ADMIN_PASS}
MongoDB App:      ${MONGO_APP_USER} / ${MONGO_APP_PASS}
Connection URI:   mongodb://${MONGO_APP_USER}:${MONGO_APP_PASS}@127.0.0.1:27017/?authSource=admin

API Admin Key:    amrnet-admin-2026
S3 Bucket:        s3://${BUCKET}

CloudFront:       d2jkqpkclo114b.cloudfront.net
Domain:           www.amrnet.org
CREDS

chmod 600 "$CREDS_FILE"
echo "  ✓ Credentials saved to ${CREDS_FILE} (chmod 600)"

echo ""
echo "═══════════════════════════════════════"
echo "  Production Setup Complete!"
echo "═══════════════════════════════════════"
echo ""
echo "  Dashboard:    https://www.amrnet.org"
echo "  Swagger:      https://www.amrnet.org/api-docs"
echo "  API Register: https://www.amrnet.org/api-register"
echo "  Health:       https://www.amrnet.org/health"
echo ""
echo "  MongoDB:      auth enabled (credentials in ${CREDS_FILE})"
echo "  Backups:      daily at 3 AM UTC → s3://${BUCKET}/backups/"
echo "  Logs:         rotated daily, 14-day retention"
echo "  SSL:          via CloudFront (ACM certificate)"
echo ""
echo "  ⚠  SAVE THESE CREDENTIALS — they won't be shown again:"
echo ""
echo "  MongoDB Admin: ${MONGO_ADMIN_USER} / ${MONGO_ADMIN_PASS}"
echo "  MongoDB App:   ${MONGO_APP_USER} / ${MONGO_APP_PASS}"
echo ""
