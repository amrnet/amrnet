# AMRnet AWS EC2 Deployment Guide

## Quick Deploy (~30 minutes total)

### Step 1: Launch EC2 Instance (AWS Console — 2 min)

1. Go to **AWS Console** → **EC2** → **Launch Instance**
2. Configure:
   - **Name:** `amrnet-production`
   - **AMI:** Amazon Linux 2023 (free tier eligible AMI)
   - **Instance type:** `t3.xlarge` (4 vCPU, 16 GB RAM)
   - **Key pair:** Create new → `amrnet-key` → Download `.pem` file
   - **Network:** Default VPC, **us-east-2** (Ohio)
   - **Security Group:** Create new with these rules:
     - SSH (22) → My IP
     - HTTP (80) → Anywhere (0.0.0.0/0)
     - HTTPS (443) → Anywhere (0.0.0.0/0)
   - **Storage:** 200 GB gp3
3. Click **Launch Instance**
4. Wait for "running" status, note the **Public IPv4 address**

### Step 2: Connect to EC2 (1 min)

```bash
# Set permissions on key file
chmod 400 ~/Downloads/amrnet-key.pem

# Connect (replace <EC2_IP> with your instance's public IP)
ssh -i ~/Downloads/amrnet-key.pem ec2-user@<EC2_IP>
```

### Step 3: Upload Code from Your Mac (3 min)

Open a **new terminal on your Mac** (not the SSH session):

```bash
# Upload AMRnet code to EC2
rsync -avz --progress \
  --exclude node_modules \
  --exclude client/node_modules \
  --exclude client/build \
  --exclude .git \
  -e "ssh -i ~/Downloads/amrnet-key.pem" \
  /Users/lshlt19/GitHub/051225_devrev-final/amrnet/ \
  ec2-user@<EC2_IP>:/opt/amrnet/
```

### Step 4: Run Setup Script on EC2 (10 min)

Back in your **SSH session**:

```bash
cd /opt/amrnet/deploy
chmod +x setup-ec2.sh migrate-atlas.sh deploy-app.sh

# Install Node.js, MongoDB, nginx
./setup-ec2.sh
```

### Step 5: Migrate Data from Atlas (15 min)

```bash
# This dumps all 10 databases from Atlas and restores locally
./migrate-atlas.sh
```

Expected output:
```
styphi           14100 documents
kpneumo          48158 documents
ngono            29365 documents
ecoli            339817 documents
...
Migration complete!
```

### Step 6: Deploy AMRnet (5 min)

```bash
./deploy-app.sh
```

### Step 7: Verify

Open in browser: `http://<EC2_IP>`

You should see AMRnet loading with all organisms and data.

---

## After Demo: PAUSE to Save Costs

### Stop the Instance (keeps data, stops billing for compute)

1. **AWS Console** → **EC2** → **Instances**
2. Select `amrnet-production`
3. **Instance State** → **Stop Instance**

**Cost while stopped:** ~$0.50/day (EBS storage only)

### Resume Later

1. **Instance State** → **Start Instance**
2. Note: Public IP may change. Use an **Elastic IP** ($3.65/mo) if you need a fixed IP.

---

## Troubleshooting

### MongoDB won't start
```bash
sudo systemctl status mongod
sudo journalctl -u mongod --no-pager -n 50
```

### App won't start
```bash
pm2 logs amrnet --lines 50
```

### Check all services
```bash
sudo systemctl status mongod nginx
pm2 status
```

### Test API directly
```bash
curl http://localhost:8080/api/getCollectionCounts
```

### Restart everything
```bash
sudo systemctl restart mongod nginx
pm2 restart amrnet
```
