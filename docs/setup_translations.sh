#!/bin/bash

# AMRnet Documentation Translation Setup Script
# This script sets up the translation infrastructure for Read the Docs

set -e

echo "🌍 Setting up AMRnet Documentation Translations"
echo "=============================================="

# Check if we're in the docs directory
if [ ! -f "conf.py" ]; then
    echo "❌ Error: Please run this script from the docs/ directory"
    exit 1
fi

# Define languages to support (matching your React app)
LANGUAGES=("es" "fr" "pt")

echo "📚 Languages to set up: ${LANGUAGES[*]}"

# Install required packages
echo "📦 Installing translation dependencies..."
pip install sphinx-intl

# Create locale directory structure
echo "📁 Creating locale directory structure..."
mkdir -p locale

# Generate POT files (translation templates)
echo "🔧 Generating translation templates..."
make gettext

# Initialize translation files for each language
echo "🌐 Initializing translation files..."
for lang in "${LANGUAGES[@]}"; do
    echo "  Setting up $lang..."
    mkdir -p "locale/$lang/LC_MESSAGES"
    sphinx-intl update -p _build/gettext -l "$lang"
done

# Create language-specific configuration files
echo "⚙️  Creating language-specific configurations..."

for lang in "${LANGUAGES[@]}"; do
    cat > "conf_$lang.py" << EOF
# Configuration for $lang documentation
from conf import *

language = '$lang'
locale_dirs = ['locale/']

# Language-specific settings
if language == 'es':
    html_title = 'AMRnet - Documentación en Español'
elif language == 'fr':
    html_title = 'AMRnet - Documentation en Français'
elif language == 'pt':
    html_title = 'AMRnet - Documentação em Português'

# Override any language-specific theme options
html_theme_options.update({
    'source_repository': 'https://github.com/amrnet/amrnet',
    'source_branch': 'devrev-final',
    'source_directory': f'docs/',
})
EOF
done

# Create a translation status tracking file
echo "📊 Creating translation status tracker..."
cat > "translation_status.md" << EOF
# AMRnet Documentation Translation Status

This file tracks the translation progress for AMRnet documentation.

## Supported Languages

- 🇪🇸 **Spanish (es)**: 0% complete
- 🇫🇷 **French (fr)**: 0% complete
- 🇵🇹 **Portuguese (pt)**: 0% complete

## Files to Translate

- [ ] index.rst
- [ ] tutorial.rst
- [ ] userguide.rst
- [ ] installation.rst
- [ ] feature.rst
- [ ] performance.rst
- [ ] deployment.rst
- [ ] security.rst
- [ ] internationalization.rst
- [ ] troubleshooting.rst
- [ ] api.rst
- [ ] usage.rst
- [ ] data.rst
- [ ] contributing.rst

## Translation Workflow

1. **Extract messages**: \`make gettext\`
2. **Update translations**: \`make update-locale\`
3. **Edit PO files**: Translate strings in \`locale/[lang]/LC_MESSAGES/\`
4. **Build translated docs**: \`make build-locale\`
5. **Test locally**: Check \`_build/[lang]/\` directories

## Translation Guidelines

- Keep technical terms consistent across languages
- Maintain the same structure and formatting
- Test all links work in translated versions
- Consider cultural context for examples

## Getting Help

- Use professional translation services for medical/scientific terms
- Coordinate with native speakers from target regions
- Review translations with domain experts
EOF

# Create a simple translation helper script
echo "🔧 Creating translation helper script..."
cat > "translate.sh" << 'EOF'
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
EOF

chmod +x translate.sh

# Create Read the Docs configuration for translations
echo "📝 Creating Read the Docs translation configuration..."
cat > "../.readthedocs.translations.yaml" << EOF
# Read the Docs configuration for translations
# Copy this content to your main .readthedocs.yaml for each language

version: 2

build:
  os: "ubuntu-24.04"
  tools:
    python: "3.12"
  jobs:
    create_environment:
      - asdf plugin add uv
      - asdf install uv latest
      - asdf global uv latest
      - UV_PROJECT_ENVIRONMENT=\$READTHEDOCS_VIRTUALENV_PATH uv sync --all-extras --group docs
      - pip install sphinx-intl
    install:
      - "true"

sphinx:
  configuration: docs/conf.py
  fail_on_warning: false

# Language-specific environment variables
# Set READTHEDOCS_LANGUAGE in your RTD project settings:
# - For Spanish: READTHEDOCS_LANGUAGE=es
# - For French: READTHEDOCS_LANGUAGE=fr
# - For Portuguese: READTHEDOCS_LANGUAGE=pt
EOF

echo ""
echo "✅ Translation setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🔧 **Extract translatable content**:"
echo "   ./translate.sh extract"
echo ""
echo "2. 🌐 **Translate content**:"
echo "   Edit files in locale/[lang]/LC_MESSAGES/*.po"
echo "   You can use tools like Poedit, Weblate, or Crowdin"
echo ""
echo "3. 🏗️  **Build translated docs**:"
echo "   ./translate.sh build [lang]"
echo ""
echo "4. 📊 **Check progress**:"
echo "   ./translate.sh status"
echo ""
echo "5. 🚀 **Set up Read the Docs**:"
echo "   - Create subprojects for each language"
echo "   - Set READTHEDOCS_LANGUAGE environment variable"
echo "   - Use the configuration in .readthedocs.translations.yaml"
echo ""
echo "📚 For detailed instructions, see the translation guide."
