#!/bin/bash
# =============================================================================
# AMRnet AWS Infrastructure Setup
# Creates: S3 Data Lake + CloudFront CDN + configures EC2
# Region: us-east-2 (Ohio)
# Prerequisites: aws cli configured, EC2 instance running
# =============================================================================
set -euo pipefail

REGION="us-east-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
EC2_IP="54.242.118.62"  # Update if changed
BUCKET_NAME="amrnet-datalake-${ACCOUNT_ID}"
CF_COMMENT="AMRnet CDN"

echo "═══════════════════════════════════════"
echo "  AMRnet AWS Infrastructure Setup"
echo "═══════════════════════════════════════"
echo "  Account:  $ACCOUNT_ID"
echo "  Region:   $REGION"
echo "  EC2 IP:   $EC2_IP"
echo "  S3:       $BUCKET_NAME"
echo ""

# ─────────────────────────────────────────
# 1. S3 Data Lake
# ─────────────────────────────────────────
echo "[1/4] Creating S3 Data Lake bucket..."

# Create bucket
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION" \
  2>/dev/null && echo "  ✓ Bucket created: $BUCKET_NAME" \
  || echo "  ℹ Bucket already exists: $BUCKET_NAME"

# Enable versioning (protect against accidental deletes)
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled
echo "  ✓ Versioning enabled"

# Block public access (data is private, served via pre-signed URLs)
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo "  ✓ Public access blocked"

# Create folder structure
for folder in raw processed exports backups; do
  aws s3api put-object --bucket "$BUCKET_NAME" --key "${folder}/" > /dev/null
done
echo "  ✓ Folders created: raw/, processed/, exports/, backups/"

# Add lifecycle rules
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET_NAME" \
  --lifecycle-configuration '{
    "Rules": [
      {
        "ID": "MoveBackupsToIA",
        "Filter": { "Prefix": "backups/" },
        "Status": "Enabled",
        "Transitions": [
          { "Days": 30, "StorageClass": "STANDARD_IA" }
        ],
        "Expiration": { "Days": 365 }
      },
      {
        "ID": "CleanupOldRaw",
        "Filter": { "Prefix": "raw/" },
        "Status": "Enabled",
        "Transitions": [
          { "Days": 90, "StorageClass": "STANDARD_IA" }
        ]
      }
    ]
  }'
echo "  ✓ Lifecycle rules configured (backups → IA after 30d, expire 365d)"

# ─────────────────────────────────────────
# 2. Export organism data to S3
# ─────────────────────────────────────────
echo ""
echo "[2/4] Exporting organism datasets to S3..."
echo "  (This exports data from EC2's MongoDB to S3 as downloadable files)"

# Create export script to run on EC2
cat > /tmp/amrnet-s3-export.sh << 'EXPORTEOF'
#!/bin/bash
BUCKET="$1"
REGION="$2"
DUMP_DIR="/tmp/amrnet_exports"
mkdir -p "$DUMP_DIR"

declare -A DB_COLS=(
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
)

for DB in "${!DB_COLS[@]}"; do
  COL="${DB_COLS[$DB]}"
  echo "  Exporting $DB..."

  # Export as JSON
  mongoexport --db="$DB" --collection="$COL" \
    --query='{"dashboard view":{"$regex":"^include$","$options":"i"}}' \
    --out="$DUMP_DIR/${DB}.json" --jsonArray 2>/dev/null

  # Compress
  gzip -f "$DUMP_DIR/${DB}.json"

  # Upload to S3
  aws s3 cp "$DUMP_DIR/${DB}.json.gz" "s3://${BUCKET}/exports/${DB}.json.gz" \
    --region "$REGION" --quiet

  echo "    → s3://${BUCKET}/exports/${DB}.json.gz"
done

# Also create a mongodump backup
echo "  Creating full mongodump backup..."
BACKUP_DATE=$(date +%Y%m%d)
mongodump --out="$DUMP_DIR/backup_${BACKUP_DATE}" --gzip 2>/dev/null
tar -czf "$DUMP_DIR/amrnet_backup_${BACKUP_DATE}.tar.gz" -C "$DUMP_DIR" "backup_${BACKUP_DATE}"
aws s3 cp "$DUMP_DIR/amrnet_backup_${BACKUP_DATE}.tar.gz" \
  "s3://${BUCKET}/backups/amrnet_backup_${BACKUP_DATE}.tar.gz" \
  --region "$REGION" --quiet
echo "    → s3://${BUCKET}/backups/amrnet_backup_${BACKUP_DATE}.tar.gz"

rm -rf "$DUMP_DIR"
echo "  ✓ All exports complete"
EXPORTEOF

echo "  Uploading export script to EC2..."
scp -i ~/.ssh/dragon.pem -o StrictHostKeyChecking=no \
  /tmp/amrnet-s3-export.sh ec2-user@${EC2_IP}:/tmp/amrnet-s3-export.sh

echo "  Configuring AWS CLI on EC2..."
# Copy AWS credentials to EC2
ssh -i ~/.ssh/dragon.pem ec2-user@${EC2_IP} "mkdir -p ~/.aws"
scp -i ~/.ssh/dragon.pem ~/.aws/credentials ec2-user@${EC2_IP}:~/.aws/credentials 2>/dev/null || true
scp -i ~/.ssh/dragon.pem ~/.aws/config ec2-user@${EC2_IP}:~/.aws/config 2>/dev/null || true

echo "  Running export on EC2 (this may take a few minutes)..."
ssh -i ~/.ssh/dragon.pem ec2-user@${EC2_IP} \
  "sudo dnf install -y awscli 2>/dev/null; chmod +x /tmp/amrnet-s3-export.sh && /tmp/amrnet-s3-export.sh ${BUCKET_NAME} ${REGION}"

# ─────────────────────────────────────────
# 3. CloudFront CDN
# ─────────────────────────────────────────
echo ""
echo "[3/4] Creating CloudFront distribution..."

# Create CloudFront distribution pointing to EC2
DISTRIBUTION_CONFIG=$(cat <<CFEOF
{
  "CallerReference": "amrnet-$(date +%s)",
  "Comment": "$CF_COMMENT",
  "Enabled": true,
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "amrnet-ec2",
        "DomainName": "$EC2_IP",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": { "Quantity": 1, "Items": ["TLSv1.2"] }
        }
      },
      {
        "Id": "amrnet-s3-exports",
        "DomainName": "${BUCKET_NAME}.s3.${REGION}.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "amrnet-ec2",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": { "Quantity": 7, "Items": ["GET","HEAD","OPTIONS","PUT","PATCH","POST","DELETE"], "CachedMethods": { "Quantity": 2, "Items": ["GET","HEAD"] } },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": { "Forward": "none" },
      "Headers": { "Quantity": 3, "Items": ["X-API-Key", "Authorization", "Origin"] }
    },
    "MinTTL": 0,
    "DefaultTTL": 0,
    "MaxTTL": 0,
    "Compress": true
  },
  "CacheBehaviors": {
    "Quantity": 2,
    "Items": [
      {
        "PathPattern": "/static/*",
        "TargetOriginId": "amrnet-ec2",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": { "Quantity": 2, "Items": ["GET","HEAD"], "CachedMethods": { "Quantity": 2, "Items": ["GET","HEAD"] } },
        "ForwardedValues": { "QueryString": false, "Cookies": { "Forward": "none" } },
        "MinTTL": 86400,
        "DefaultTTL": 604800,
        "MaxTTL": 2592000,
        "Compress": true
      },
      {
        "PathPattern": "/api/v1/*",
        "TargetOriginId": "amrnet-ec2",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": { "Quantity": 7, "Items": ["GET","HEAD","OPTIONS","PUT","PATCH","POST","DELETE"], "CachedMethods": { "Quantity": 2, "Items": ["GET","HEAD"] } },
        "ForwardedValues": {
          "QueryString": true,
          "Cookies": { "Forward": "none" },
          "Headers": { "Quantity": 2, "Items": ["X-API-Key", "Authorization"] }
        },
        "MinTTL": 0,
        "DefaultTTL": 300,
        "MaxTTL": 3600,
        "Compress": true
      }
    ]
  },
  "PriceClass": "PriceClass_100",
  "ViewerCertificate": { "CloudFrontDefaultCertificate": true }
}
CFEOF
)

CF_RESULT=$(aws cloudfront create-distribution \
  --distribution-config "$DISTRIBUTION_CONFIG" \
  --region us-east-1 \
  --output json 2>&1) || true

CF_DOMAIN=$(echo "$CF_RESULT" | grep -o '"DomainName": "[^"]*"' | head -1 | cut -d'"' -f4)
CF_ID=$(echo "$CF_RESULT" | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CF_DOMAIN" ]; then
  echo "  ✓ CloudFront distribution created"
  echo "  Domain: https://${CF_DOMAIN}"
  echo "  ID: ${CF_ID}"
  echo "  Status: Deploying (takes 5-15 minutes to propagate)"
else
  echo "  ℹ CloudFront creation output:"
  echo "$CF_RESULT" | head -5
fi

# ─────────────────────────────────────────
# 4. Summary
# ─────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "  Infrastructure Setup Complete!"
echo "═══════════════════════════════════════"
echo ""
echo "  EC2:         https://${EC2_IP}"
echo "  S3 Bucket:   s3://${BUCKET_NAME}"
echo "  CloudFront:  https://${CF_DOMAIN:-<deploying>}"
echo ""
echo "  Swagger:     https://${CF_DOMAIN:-${EC2_IP}}/api-docs"
echo "  API:         https://${CF_DOMAIN:-${EC2_IP}}/api/v1/organisms"
echo "  Register:    https://${CF_DOMAIN:-${EC2_IP}}/api-register"
echo ""
echo "  S3 Exports:  s3://${BUCKET_NAME}/exports/"
echo "  S3 Backups:  s3://${BUCKET_NAME}/backups/"
echo ""
echo "  Next steps:"
echo "    1. Wait 5-15 min for CloudFront to deploy"
echo "    2. Test: curl https://${CF_DOMAIN:-<domain>}"
echo "    3. Optional: attach a custom domain (e.g., amrnet.org)"
echo ""
