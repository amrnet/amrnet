#!/bin/bash

# Translation helper script for AMRnet docs

case "$1" in
    "extract")
        echo "Extracting translatable strings..."
        make gettext
        ;;
    "update")
        echo "Updating translation files..."
        make update-locale
        ;;
    "build")
        if [ -z "$2" ]; then
            echo "Building all languages..."
            make build-locale
        else
            echo "Building $2 documentation..."
            sphinx-build -b html -D language=$2 . _build/$2
        fi
        ;;
    "status")
        echo "Translation status:"
        for lang in es fr pt; do
            total=$(find locale/$lang -name "*.po" -exec msgfmt --statistics {} \; 2>&1 | grep -o '[0-9]* translated' | cut -d' ' -f1 | paste -sd+ | bc 2>/dev/null || echo "0")
            echo "$lang: $total translated strings"
        done
        ;;
    *)
        echo "Usage: $0 {extract|update|build [lang]|status}"
        echo ""
        echo "Commands:"
        echo "  extract  - Extract translatable strings to POT files"
        echo "  update   - Update PO files with new strings"
        echo "  build    - Build translated documentation"
        echo "  status   - Show translation progress"
        ;;
esac
