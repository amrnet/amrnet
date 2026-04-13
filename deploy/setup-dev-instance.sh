#!/bin/bash
# =============================================================================
# Create and setup DEV EC2 instance
# Run from your Mac — requires AWS CLI configured
# =============================================================================
set -euo pipefail

REGION="us-east-1"
KEY_NAME="dragon"
INSTANCE_TYPE="t3.medium"  # Smaller than prod (t3.xlarge)
AMI_ID=""  # Will auto-detect Amazon Linux 2023

echo "═══════════════════════════════════════"
echo "  AMRnet Dev Instance Setup"
echo "═══════════════════════════════════════"
echo ""

# 1. Find the latest Amazon Linux 2023 AMI
echo "[1/6] Finding latest Amazon Linux 2023 AMI..."
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" \
  --output text --region $REGION)
echo "  AMI: ${AMI_ID}"

# 2. Get security group from production instance
echo "[2/6] Getting security group from production..."
PROD_SG=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=52.86.233.198" \
  --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" \
  --output text --region $REGION)
echo "  Security Group: ${PROD_SG}"

# Get subnet
SUBNET=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=52.86.233.198" \
  --query "Reservations[0].Instances[0].SubnetId" \
  --output text --region $REGION)

# 3. Launch dev instance
echo "[3/6] Launching dev instance (${INSTANCE_TYPE})..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$PROD_SG" \
  --subnet-id "$SUBNET" \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":100,"VolumeType":"gp3"}}]' \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=amrnet-dev}]" \
  --region $REGION \
  --query "Instances[0].InstanceId" \
  --output text)
echo "  Instance: ${INSTANCE_ID}"

# 4. Wait for running
echo "[4/6] Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region $REGION
DEV_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text --region $REGION)
echo "  IP: ${DEV_IP}"

# 5. Wait for SSH
echo "[5/6] Waiting for SSH..."
for i in $(seq 1 30); do
  if ssh -i ~/.ssh/dragon.pem -o StrictHostKeyChecking=no -o ConnectTimeout=5 ec2-user@${DEV_IP} "echo ok" 2>/dev/null; then
    break
  fi
  sleep 5
done

# 6. Setup the instance (reuse production setup script)
echo "[6/6] Running setup on dev instance..."

# Upload setup script
scp -i ~/.ssh/dragon.pem \
  deploy/setup-ec2.sh \
  ec2-user@${DEV_IP}:/tmp/setup-ec2.sh

# Run setup
ssh -i ~/.ssh/dragon.pem ec2-user@${DEV_IP} "chmod +x /tmp/setup-ec2.sh && /tmp/setup-ec2.sh"

# Copy MongoDB data from production
echo ""
echo "Copying MongoDB data from production to dev..."
ssh -i ~/.ssh/dragon.pem ec2-user@52.86.233.198 \
  "mongodump --uri='mongodb://amrnet_app:REDACTED@127.0.0.1:27017/?authSource=admin' --out=/tmp/dev_dump --gzip 2>/dev/null && tar -czf /tmp/dev_dump.tar.gz -C /tmp dev_dump"

scp -i ~/.ssh/dragon.pem ec2-user@52.86.233.198:/tmp/dev_dump.tar.gz /tmp/dev_dump.tar.gz
scp -i ~/.ssh/dragon.pem /tmp/dev_dump.tar.gz ec2-user@${DEV_IP}:/tmp/dev_dump.tar.gz

ssh -i ~/.ssh/dragon.pem ec2-user@${DEV_IP} "cd /tmp && tar -xzf dev_dump.tar.gz && mongorestore --drop --gzip /tmp/dev_dump"

# Create app directory and upload code
ssh -i ~/.ssh/dragon.pem ec2-user@${DEV_IP} "sudo mkdir -p /opt/amrnet && sudo chown ec2-user /opt/amrnet"

# Create dev .env (no auth for simplicity)
ssh -i ~/.ssh/dragon.pem ec2-user@${DEV_IP} "cat > /opt/amrnet/.env << 'EOF'
MONGODB_URI=mongodb://127.0.0.1:27017
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DBNAME_SENTERICA=senterica
MONGO_DBNAME_SENTERICAINTS=sentericaints
MONGO_DBNAME_ECOLI=ecoli
MONGO_DBNAME_SHIGE=shige
MONGO_DBNAME_STYPHI=styphi
MONGO_DBNAME_KPNEUMO=kpneumo
MONGO_DBNAME_DECOLI=decoli
MONGO_DBNAME_NGONO=ngono
MONGO_DBNAME_SAUREUS=saureus
MONGO_DBNAME_STREPNEUMO=strepneumo
PORT=8080
NODE_ENV=development
REACT_APP_API_URL=/api/
EOF"

# Update deploy-dev.sh with the actual IP
sed -i.bak "s/DEV_IP_HERE/${DEV_IP}/" deploy/deploy-dev.sh && rm -f deploy/deploy-dev.sh.bak

echo ""
echo "═══════════════════════════════════════"
echo "  Dev Instance Ready!"
echo "═══════════════════════════════════════"
echo ""
echo "  IP:    ${DEV_IP}"
echo "  SSH:   ssh -i ~/.ssh/dragon.pem ec2-user@${DEV_IP}"
echo "  URL:   http://${DEV_IP}"
echo ""
echo "  Next: Deploy code with ./deploy/deploy-dev.sh"
echo ""
echo "  Updated deploy/deploy-dev.sh with DEV_IP=${DEV_IP}"
echo ""
