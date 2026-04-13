#!/bin/bash
# =============================================================================
# Promote development → main and deploy to production
# Run from your Mac after validating on dev instance
# =============================================================================
set -euo pipefail

echo "═══════════════════════════════════════"
echo "  Promote Development → Production"
echo "═══════════════════════════════════════"
echo ""

# 1. Ensure development is clean and pushed
echo "[1/4] Checking development branch..."
git checkout development
git pull origin development 2>/dev/null || true

# Show what will be merged
AHEAD=$(git log main..development --oneline | wc -l | tr -d ' ')
echo "  ${AHEAD} commits to merge into main:"
git log main..development --oneline
echo ""

if [ "$AHEAD" = "0" ]; then
  echo "  Nothing to promote. development is identical to main."
  exit 0
fi

read -p "Merge these ${AHEAD} commits into main and deploy? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# 2. Merge development → main
echo "[2/4] Merging development → main..."
git checkout main
git pull origin main 2>/dev/null || true
git merge development --no-edit
git push origin main
echo "  ✓ main updated on GitHub"

# 3. Deploy to production
echo "[3/4] Deploying to production..."
./deploy/deploy-production.sh

# 4. Tag the release
echo "[4/4] Tagging release..."
TAG="v$(date +%Y%m%d-%H%M)"
git tag -a "$TAG" -m "Production release ${TAG}"
git push origin "$TAG"
echo "  ✓ Tagged as ${TAG}"

echo ""
echo "═══════════════════════════════════════"
echo "  Promotion complete!"
echo "  Tag: ${TAG}"
echo "  https://www.amrnet.org"
echo "═══════════════════════════════════════"
