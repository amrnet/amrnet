#!/bin/bash

# Script to fix common ESLint issues in AMRnet
echo "🔧 Fixing ESLint issues in AMRnet..."

cd client

# Fix unused theme parameters in MUI files
echo "📝 Fixing unused theme parameters..."
find src -name "*MUI.js" -type f -exec sed -i '' 's/makeStyles((theme)/makeStyles((_theme)/g' {} \;

# Fix unused variables that should start with underscore
echo "📝 Fixing unused variables..."

# Run ESLint with auto-fix for fixable issues
echo "🔍 Running ESLint auto-fix..."
npx eslint src --fix --ext .js,.ts,.tsx

echo "✅ Basic ESLint fixes completed!"
echo "🔍 Run 'npm run lint' to see remaining issues that need manual fixing."
