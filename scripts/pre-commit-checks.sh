#!/bin/bash
# =============================================================================
# Pre-commit quality gate — catches the kinds of bugs junior devs make
# Install:  ln -s ../../scripts/pre-commit-checks.sh .git/hooks/pre-commit
# =============================================================================
set -euo pipefail

CHANGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$' || true)

if [ -z "$CHANGED" ]; then
  exit 0
fi

echo "🔍 Running pre-commit checks on $(echo "$CHANGED" | wc -l | tr -d ' ') file(s)..."

ERRORS=0

# ─── 1. Block console.log commits ────────────────────────────────────────
CONSOLE_LOGS=$(echo "$CHANGED" | xargs grep -nE '^\s*console\.log\(' 2>/dev/null || true)
if [ -n "$CONSOLE_LOGS" ]; then
  echo ""
  echo "❌ console.log found — use proper debugging or remove before commit:"
  echo "$CONSOLE_LOGS" | head -10
  ERRORS=$((ERRORS+1))
fi

# ─── 2. Block large blocks of commented-out code ─────────────────────────
# Specifically: 3+ consecutive lines starting with // in the ADDED lines
COMMENTED_BLOCKS=$(git diff --cached --unified=0 $CHANGED 2>/dev/null | \
  awk '/^\+\s*\/\//{c++; if(c>=3) print "FOUND"; next} /^[^+]/{c=0} /^\+/{c=0}' | head -1)
if [ "$COMMENTED_BLOCKS" = "FOUND" ]; then
  echo ""
  echo "⚠️  Large block of commented-out code detected."
  echo "   Delete obsolete code (git keeps history) or use a feature flag."
  ERRORS=$((ERRORS+1))
fi

# ─── 3. Block `!== '-'` on numeric expressions ────────────────────────────
# Catches the 3201379d Ampicillin bug: countMarkers() !== '-' is always true
NUMBER_STRING_COMPARE=$(echo "$CHANGED" | xargs grep -nE 'count\w*\([^)]*\)\s*!==\s*'"'"'-'"'"'' 2>/dev/null || true)
if [ -n "$NUMBER_STRING_COMPARE" ]; then
  echo ""
  echo "❌ Numeric function result compared to '-' — this is always truthy:"
  echo "$NUMBER_STRING_COMPARE"
  echo "   Did you mean: x['column'] != null && x['column'] !== '-' ?"
  ERRORS=$((ERRORS+1))
fi

# ─── 4. Block removal of $limit on MongoDB pipelines ─────────────────────
REMOVED_LIMIT=$(git diff --cached --unified=0 $CHANGED 2>/dev/null | \
  grep -E '^-\s*\{\s*\$limit' || true)
ADDED_COMMENTED_LIMIT=$(git diff --cached --unified=0 $CHANGED 2>/dev/null | \
  grep -E '^\+\s*//\s*\{\s*\$limit' || true)
if [ -n "$REMOVED_LIMIT$ADDED_COMMENTED_LIMIT" ]; then
  echo ""
  echo "⚠️  \$limit removed or commented from MongoDB pipeline."
  echo "   This can blow up response size for 500K+ genome collections."
  echo "   Ask before committing."
  ERRORS=$((ERRORS+1))
fi

# ─── 5. Run ESLint on staged files ────────────────────────────────────────
if [ -f "client/package.json" ]; then
  CLIENT_FILES=$(echo "$CHANGED" | grep '^client/src/' || true)
  if [ -n "$CLIENT_FILES" ]; then
    echo ""
    echo "Running ESLint..."
    (cd client && npx eslint $(echo "$CLIENT_FILES" | sed 's|client/||g') --max-warnings 0 2>&1) || ERRORS=$((ERRORS+1))
  fi
fi

# ─── Summary ──────────────────────────────────────────────────────────────
echo ""
if [ $ERRORS -gt 0 ]; then
  echo "❌ $ERRORS issue(s) found. Commit blocked."
  echo ""
  echo "To bypass (NOT recommended):"
  echo "  git commit --no-verify"
  exit 1
fi

echo "✅ Pre-commit checks passed."
