#!/bin/bash
# =============================================================================
# Create CloudFront distribution + SSL certificate for amrnet.org
# =============================================================================
set -euo pipefail

EC2_DNS="ec2-54-242-118-62.compute-1.amazonaws.com"
DOMAIN="amrnet.org"

echo "═══════════════════════════════════════"
echo "  CloudFront + SSL Setup for ${DOMAIN}"
echo "═══════════════════════════════════════"
echo ""

# ─────────────────────────────────────────
# 1. Request SSL certificate (must be in us-east-1 for CloudFront)
# ─────────────────────────────────────────
echo "[1/3] Requesting SSL certificate for ${DOMAIN}..."

CERT_ARN=$(aws acm request-certificate \
  --domain-name "${DOMAIN}" \
  --subject-alternative-names "*.${DOMAIN}" \
  --validation-method DNS \
  --region us-east-1 \
  --query CertificateArn \
  --output text)

echo "  ✓ Certificate requested: ${CERT_ARN}"

# Wait a moment for ACM to generate validation records
sleep 5

# Get DNS validation records
echo ""
echo "  ╔════════════════════════════════════════════════════════╗"
echo "  ║  ADD THESE DNS RECORDS TO YOUR DOMAIN REGISTRAR       ║"
echo "  ╚════════════════════════════════════════════════════════╝"
echo ""

aws acm describe-certificate \
  --certificate-arn "${CERT_ARN}" \
  --region us-east-1 \
  --query "Certificate.DomainValidationOptions[*].ResourceRecord.{Name:Name,Type:Type,Value:Value}" \
  --output table

echo ""
echo "  Add the CNAME record(s) above to your DNS provider."
echo "  Waiting for validation (this can take 5-30 minutes)..."
echo ""
echo "  You can check status with:"
echo "    aws acm describe-certificate --certificate-arn ${CERT_ARN} --region us-east-1 --query Certificate.Status"
echo ""
read -p "  Press ENTER after you've added the DNS records (or Ctrl+C to exit and run step 2 later)..."

# Wait for validation
echo "  Waiting for certificate validation..."
aws acm wait certificate-validated \
  --certificate-arn "${CERT_ARN}" \
  --region us-east-1 2>/dev/null &
WAIT_PID=$!

# Check every 30 seconds with feedback
for i in $(seq 1 40); do
  STATUS=$(aws acm describe-certificate \
    --certificate-arn "${CERT_ARN}" \
    --region us-east-1 \
    --query Certificate.Status \
    --output text 2>/dev/null)
  if [ "$STATUS" = "ISSUED" ]; then
    echo "  ✓ Certificate validated and issued!"
    kill $WAIT_PID 2>/dev/null || true
    break
  fi
  echo "    Status: ${STATUS} (checking again in 30s... ${i}/40)"
  sleep 30
done

# ─────────────────────────────────────────
# 2. Create CloudFront distribution
# ─────────────────────────────────────────
echo ""
echo "[2/3] Creating CloudFront distribution..."

CALLER_REF="amrnet-$(date +%s)"

DIST_CONFIG=$(cat <<EOF
{
  "CallerReference": "${CALLER_REF}",
  "Comment": "AMRnet - Global AMR Surveillance Platform",
  "Enabled": true,
  "Aliases": {
    "Quantity": 2,
    "Items": ["${DOMAIN}", "www.${DOMAIN}"]
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "amrnet-ec2",
        "DomainName": "${EC2_DNS}",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          },
          "OriginReadTimeout": 60,
          "OriginKeepaliveTimeout": 5
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "amrnet-ec2",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
    "OriginRequestPolicyId": "216adef6-5c7f-47e4-b989-5492eafa07d3",
    "Compress": true
  },
  "CacheBehaviors": {
    "Quantity": 1,
    "Items": [
      {
        "PathPattern": "/static/*",
        "TargetOriginId": "amrnet-ec2",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
          "Quantity": 2,
          "Items": ["GET", "HEAD"],
          "CachedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"]
          }
        },
        "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
        "Compress": true
      }
    ]
  },
  "PriceClass": "PriceClass_200",
  "ViewerCertificate": {
    "ACMCertificateArn": "${CERT_ARN}",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "Certificate": "${CERT_ARN}",
    "CertificateSource": "acm"
  },
  "HttpVersion": "http2and3"
}
EOF
)

CF_RESULT=$(aws cloudfront create-distribution \
  --distribution-config "${DIST_CONFIG}" \
  --output json)

CF_DOMAIN=$(echo "$CF_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['Distribution']['DomainName'])")
CF_ID=$(echo "$CF_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['Distribution']['Id'])")

echo "  ✓ CloudFront distribution created!"
echo "  ID:     ${CF_ID}"
echo "  Domain: ${CF_DOMAIN}"

# ─────────────────────────────────────────
# 3. DNS instructions
# ─────────────────────────────────────────
echo ""
echo "[3/3] Final DNS setup"
echo ""
echo "  ╔════════════════════════════════════════════════════════╗"
echo "  ║  ADD THESE DNS RECORDS TO YOUR DOMAIN REGISTRAR       ║"
echo "  ╚════════════════════════════════════════════════════════╝"
echo ""
echo "  Type    Name              Value"
echo "  ─────   ────────────────  ─────────────────────────────"
echo "  CNAME   ${DOMAIN}         ${CF_DOMAIN}"
echo "  CNAME   www.${DOMAIN}     ${CF_DOMAIN}"
echo ""
echo "  (If ${DOMAIN} is an apex/root domain, use ALIAS/ANAME"
echo "   record instead of CNAME, or use Route 53)"
echo ""

echo "═══════════════════════════════════════"
echo "  Setup Complete!"
echo "═══════════════════════════════════════"
echo ""
echo "  CloudFront:  https://${CF_DOMAIN} (deploying, 5-15 min)"
echo "  After DNS:   https://${DOMAIN}"
echo ""
echo "  Swagger:     https://${DOMAIN}/api-docs"
echo "  API:         https://${DOMAIN}/api/v1/organisms"
echo "  Register:    https://${DOMAIN}/api-register"
echo "  Dashboard:   https://${DOMAIN}"
echo ""
echo "  CloudFront ID: ${CF_ID}"
echo "  Certificate:   ${CERT_ARN}"
echo ""
echo "  To check deployment status:"
echo "    aws cloudfront get-distribution --id ${CF_ID} --query Distribution.Status"
echo ""
