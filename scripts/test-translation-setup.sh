#!/bin/bash

# Test script to validate the translation workflow setup
# Usage: ./test-translation-setup.sh

echo "🧪 Testing Translation Workflow Setup..."
echo "========================================"

# Check if required files exist
echo "📁 Checking file structure..."

# Check for locale files
if [ -f "client/locales/en.json" ]; then
    echo "✅ Found: client/locales/en.json"
    EN_FILE="client/locales/en.json"
elif [ -f "client/src/locales/en.json" ]; then
    echo "✅ Found: client/src/locales/en.json"
    EN_FILE="client/src/locales/en.json"
else
    echo "❌ Error: No en.json file found in expected locations"
    echo "   Expected: client/locales/en.json or client/src/locales/en.json"
    exit 1
fi

# Check for translator script
if [ -f ".github/scripts/translator_improved.py" ]; then
    echo "✅ Found: .github/scripts/translator_improved.py"
else
    echo "❌ Error: Missing .github/scripts/translator_improved.py"
    exit 1
fi

# Check for workflow file
if [ -f ".github/workflows/translate_app.yml" ]; then
    echo "✅ Found: .github/workflows/translate_app.yml"
else
    echo "❌ Error: Missing .github/workflows/translate_app.yml"
    exit 1
fi

# Check JSON validity
echo ""
echo "🔍 Validating JSON files..."
if python3 -m json.tool "$EN_FILE" > /dev/null 2>&1; then
    echo "✅ Valid JSON: $EN_FILE"
else
    echo "❌ Invalid JSON: $EN_FILE"
    exit 1
fi

# Count translation keys
KEY_COUNT=$(python3 -c "import json; data=json.load(open('$EN_FILE')); print(len(data))" 2>/dev/null || echo "0")
echo "📊 Found $KEY_COUNT translation keys in $EN_FILE"

# Check Python dependencies (if Python is available)
echo ""
echo "🐍 Checking Python environment..."
if command -v python3 &> /dev/null; then
    echo "✅ Python3 is available"

    # Check if openai is available (won't be in CI until installed)
    if python3 -c "import openai" 2>/dev/null; then
        echo "✅ OpenAI library is available"
    else
        echo "⚠️  OpenAI library not installed (will be installed in CI)"
    fi
else
    echo "⚠️  Python3 not found (will be available in CI)"
fi

# Check environment variables
echo ""
echo "🔐 Checking environment configuration..."
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY is set"
else
    echo "⚠️  OPENAI_API_KEY not set (should be configured in GitHub Secrets)"
fi

# Check Git branch
echo ""
echo "🌿 Checking Git branch..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "📍 Current branch: $CURRENT_BRANCH"

if [[ "$CURRENT_BRANCH" == "devrev-final" || "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "staging" ]]; then
    echo "✅ Branch matches workflow triggers"
else
    echo "⚠️  Branch does not match workflow triggers (devrev-final, main, staging)"
fi

echo ""
echo "📋 Setup Summary:"
echo "==================="
echo "✅ File structure is correct"
echo "✅ JSON files are valid"
echo "✅ Translation script is present"
echo "✅ GitHub workflow is configured"
echo ""
echo "🚀 Ready for translation workflow!"
echo ""
echo "💡 To trigger the workflow:"
echo "   1. Make changes to $EN_FILE"
echo "   2. Commit and push to trigger automatic translation"
echo "   3. Or manually trigger via GitHub Actions tab"
echo ""
echo "🔐 Required GitHub Secrets:"
echo "   - OPENAI_API_KEY: Your OpenAI API key"
echo ""
