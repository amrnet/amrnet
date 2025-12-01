#!/bin/bash

# 📝 Markdown File Naming Convention Fixer
# This script renames markdown files to follow standard conventions

set -e

echo "📝 Fixing Markdown File Naming Conventions"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ This script must be run from the project root directory"
    exit 1
fi

echo "Analyzing markdown files..."

# Files that should stay uppercase (standard conventions)
declare -a keep_uppercase=(
    "README.md"
    "CONTRIBUTING.md" 
    "CHANGELOG.md"
    "LICENSE"
    "CODE_OF_CONDUCT.md"
)

# Function to check if file should stay uppercase
should_keep_uppercase() {
    local file="$1"
    for keep in "${keep_uppercase[@]}"; do
        if [[ "$file" == "$keep" ]]; then
            return 0
        fi
    done
    return 1
}

# Function to convert to lowercase with hyphens
to_lowercase_with_hyphens() {
    echo "$1" | sed 's/_/-/g' | tr '[:upper:]' '[:lower:]'
}

# Find and rename markdown files
renamed_count=0
for file in *.md; do
    if [ -f "$file" ]; then
        if should_keep_uppercase "$file"; then
            print_info "Keeping uppercase: $file"
        else
            new_name=$(to_lowercase_with_hyphens "$file")
            if [ "$file" != "$new_name" ]; then
                if [ -f "$new_name" ]; then
                    echo "⚠️  Target file $new_name already exists, skipping $file"
                else
                    mv "$file" "$new_name"
                    print_status "Renamed: $file → $new_name"
                    ((renamed_count++))
                    
                    # Update any references in other files
                    if [ "$new_name" == "development.md" ]; then
                        # Update references in README or other files
                        if [ -f "README.md" ]; then
                            sed -i.bak 's/DEVELOPMENT\.md/development.md/g' README.md && rm -f README.md.bak
                        fi
                    fi
                fi
            fi
        fi
    fi
done

echo ""
echo "📊 Summary:"
echo "- Files renamed: $renamed_count"
echo "- Standard uppercase files preserved: ${#keep_uppercase[@]}"
echo ""

if [ $renamed_count -gt 0 ]; then
    echo "✅ Markdown file naming conventions have been standardized!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review the renamed files"
    echo "2. Update any internal links or references"
    echo "3. Commit the changes"
    echo "4. Update documentation that references old file names"
else
    echo "ℹ️  No files needed renaming - conventions already followed!"
fi
