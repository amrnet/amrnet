#!/bin/bash
# =============================================================================
# Setup automatic daily MongoDB backup to S3
# Run ON EC2 after setup-aws-infrastructure.sh
# =============================================================================
set -euo pipefail

BUCKET="$1"
REGION="${2:-us-east-2}"

if [ -z "$BUCKET" ]; then
  echo "Usage: ./setup-s3-cron-backup.sh <bucket-name> [region]"
  exit 1
fi

# Create backup script
sudo tee /opt/amrnet/backup-to-s3.sh > /dev/null << BACKUP
#!/bin/bash
BUCKET="$BUCKET"
REGION="$REGION"
DATE=\$(date +%Y%m%d_%H%M)
DUMP_DIR="/tmp/amrnet_backup_\$DATE"

echo "[\$(date)] Starting AMRnet backup..."

# Mongodump
mongodump --out="\$DUMP_DIR" --gzip 2>/dev/null

# Compress
tar -czf "/tmp/amrnet_backup_\$DATE.tar.gz" -C "/tmp" "amrnet_backup_\$DATE"

# Upload to S3
aws s3 cp "/tmp/amrnet_backup_\$DATE.tar.gz" \
  "s3://\${BUCKET}/backups/amrnet_backup_\$DATE.tar.gz" \
  --region "\$REGION" --quiet

# Cleanup
rm -rf "\$DUMP_DIR" "/tmp/amrnet_backup_\$DATE.tar.gz"

echo "[\$(date)] Backup complete → s3://\${BUCKET}/backups/amrnet_backup_\$DATE.tar.gz"
BACKUP

sudo chmod +x /opt/amrnet/backup-to-s3.sh

# Add daily cron job at 3 AM UTC
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/amrnet/backup-to-s3.sh >> /var/log/amrnet-backup.log 2>&1") | sort -u | crontab -

echo "✓ Daily backup cron job installed (3 AM UTC)"
echo "  Script: /opt/amrnet/backup-to-s3.sh"
echo "  Log:    /var/log/amrnet-backup.log"
echo "  Test:   sudo /opt/amrnet/backup-to-s3.sh"
