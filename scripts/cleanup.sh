#!/bin/bash

# 🧹 AMRnet Repository Cleanup Script
# This script helps remove unnecessary files and secure sensitive data

set -e  # Exit on error

echo "🧹 AMRnet Repository Cleanup"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

echo "Starting cleanup process..."

# 1. Remove sensitive environment files (CRITICAL)
echo "🔐 Securing environment files..."
if [ -f ".env" ] && grep -q "amrnet:" ".env"; then
    print_warning "Found .env file with potential credentials"
    read -p "Remove .env file with credentials? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f .env
        print_status "Removed .env file"
    fi
fi

# Remove other environment files with credentials
for env_file in .env.development .env.production .env.test .env.local .env.development.local .env.production.local .env.test.local; do
    if [ -f "$env_file" ] && grep -q "amrnet:" "$env_file" 2>/dev/null; then
        print_warning "Found $env_file with potential credentials"
        rm -f "$env_file"
        print_status "Removed $env_file"
    fi
done

# 2. Clean up build artifacts
echo "🧽 Cleaning build artifacts..."
rm -rf client/build/
rm -rf node_modules/
rm -rf client/node_modules/
rm -rf .next/
rm -rf dist/
print_status "Removed build artifacts"

# 3. Clean up log files
echo "📋 Cleaning log files..."
find . -name "*.log" -type f -delete
find . -name "npm-debug.log*" -type f -delete
find . -name "yarn-debug.log*" -type f -delete
find . -name "yarn-error.log*" -type f -delete
print_status "Removed log files"

# 4. Clean up temporary files
echo "🗑️  Cleaning temporary files..."
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete
find . -name "*.tmp" -type f -delete
find . -name "*.temp" -type f -delete
print_status "Removed temporary files"

# 5. Clean up cache directories
echo "💾 Cleaning cache directories..."
rm -rf .cache/
rm -rf .npm/
rm -rf .yarn/
rm -rf client/.cache/
print_status "Removed cache directories"

# 6. Check for unnecessary files that might be removed
echo "🔍 Checking for potentially unnecessary files..."

# Check if webpack.config.js is actually used (since using CRACO)
if [ -f "webpack.config.js" ]; then
    if grep -q "craco" client/package.json; then
        print_warning "webpack.config.js found but using CRACO - consider if this file is needed"
    fi
fi

# Check for multiple package-lock files
lock_files=$(find . -name "package-lock.json" | wc -l)
if [ "$lock_files" -gt 2 ]; then
    print_warning "Multiple package-lock.json files found - consider cleaning up duplicates"
fi

# 7. Git cleanup
echo "🔄 Git cleanup..."
if [ -d ".git" ]; then
    # Remove files from git tracking
    git rm --cached .env* 2>/dev/null || true
    print_status "Removed environment files from git tracking"

    # Clean up git
    git gc --prune=now 2>/dev/null || true
    print_status "Cleaned up git repository"
fi

# 8. Verify .gitignore
echo "📝 Verifying .gitignore..."
if ! grep -q "^\.env$" .gitignore; then
    print_warning ".env not found in .gitignore - should be added"
fi

if ! grep -q "node_modules/" .gitignore; then
    print_warning "node_modules/ not found in .gitignore - should be added"
fi

# 9. Security check
echo "🔒 Security check..."
if find . -name "*.js" -o -name "*.json" -o -name "*.env*" | xargs grep -l "mongodb+srv://.*:.*@" 2>/dev/null; then
    print_error "WARNING: Found files that may contain MongoDB credentials!"
    echo "Please review and remove any hardcoded credentials."
fi

echo ""
echo "🎉 Cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example to .env and add your credentials"
echo "2. Run: npm install"
echo "3. Run: cd client && npm install"
echo "4. Review the SECURITY.md file for environment setup"
echo ""
echo "⚠️  Remember to:"
echo "- Never commit .env files with real credentials"
echo "- Rotate any exposed MongoDB credentials"
echo "- Review files before committing"
