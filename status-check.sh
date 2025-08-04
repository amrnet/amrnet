#!/bin/bash

echo "🔍 AMRnet Project Status Check"
echo "================================"

cd /Users/lshlt19/GitHub/230625_amrnet/amrnet/client

echo "📁 Current directory: $(pwd)"
echo ""

echo "📝 Checking package.json scripts:"
grep -A 10 '"scripts"' package.json
echo ""

echo "🔧 Testing a few key files for ESLint issues:"

# Test a few key files
echo "  📄 Testing Home component..."
npx eslint src/components/Home/Home.js 2>&1 | head -3

echo "  📄 Testing Dashboard component..."
npx eslint src/components/Dashboard/Dashboard.js 2>&1 | head -3

echo "  📄 Testing i18n configuration..."
npx eslint src/i18n.js 2>&1 | head -3

echo ""
echo "✅ Status check complete!"

echo ""
echo "💡 To start the application:"
echo "   npm run start:no-lint"
echo ""
echo "🔧 To fix remaining ESLint issues:"
echo "   npm run lint:fix"
