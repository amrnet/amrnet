#!/bin/bash

# AMRnet Translation Platform Setup Script
# Configures professional translation services for Spanish, French, and Portuguese

set -e

echo "🌍 Setting up AMRnet translation infrastructure for es, fr, pt..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the docs directory
if [ ! -f "conf.py" ]; then
    echo -e "${RED}❌ Error: Must be run from the docs directory${NC}"
    exit 1
fi

# Target languages
LANGUAGES=("es" "fr" "pt")
LANGUAGE_NAMES=("Spanish" "French" "Portuguese")

echo -e "${BLUE}📋 Target languages: ${LANGUAGE_NAMES[*]}${NC}"

# Function to create locale directories
create_locale_structure() {
    local lang=$1
    local lang_name=$2

    echo -e "${YELLOW}📁 Creating locale structure for ${lang_name} (${lang})...${NC}"

    # Create directories
    mkdir -p "locale/${lang}/LC_MESSAGES"

    # Create language-specific requirements
    cat > "locale/${lang}/requirements.txt" << EOF
# Medical translation requirements for ${lang_name}
# Professional translators must meet these criteria:

medical_certification: ISO 17100
clinical_experience: 5+ years
specialty_knowledge:
  - Antimicrobial resistance terminology
  - Clinical microbiology
  - Laboratory medicine
  - Surveillance systems

quality_threshold: 98%
review_process:
  - Medical translation
  - Clinical expert review
  - Linguistic proofreading
  - Final medical validation
EOF

    echo -e "${GREEN}✅ Created locale structure for ${lang}${NC}"
}

# Function to update pot files for translation
update_translation_templates() {
    echo -e "${YELLOW}🔧 Updating translation templates...${NC}"

    # Generate POT files from RST sources
    sphinx-build -b gettext . locale/gettext

    # Copy POT files to English template directory
    mkdir -p locale/en/LC_MESSAGES
    cp locale/gettext/*.pot locale/en/LC_MESSAGES/

    echo -e "${GREEN}✅ Translation templates updated${NC}"
}

# Function to initialize PO files for each language
initialize_po_files() {
    local lang=$1
    local lang_name=$2

    echo -e "${YELLOW}🔧 Initializing PO files for ${lang_name}...${NC}"

    # For each POT file, create corresponding PO file
    for pot_file in locale/en/LC_MESSAGES/*.pot; do
        if [ -f "$pot_file" ]; then
            base_name=$(basename "$pot_file" .pot)
            po_file="locale/${lang}/LC_MESSAGES/${base_name}.po"

            if [ ! -f "$po_file" ]; then
                msginit --input="$pot_file" --output="$po_file" --locale="$lang" --no-translator
                echo -e "${GREEN}  ✅ Created ${po_file}${NC}"
            else
                msgmerge --update "$po_file" "$pot_file"
                echo -e "${BLUE}  🔄 Updated ${po_file}${NC}"
            fi
        fi
    done
}

# Function to create platform-specific setup
setup_translation_platforms() {
    echo -e "${YELLOW}🔧 Setting up translation platforms...${NC}"

    # Weblate setup commands
    echo -e "${BLUE}📝 Weblate setup instructions:${NC}"
    echo "1. Go to https://hosted.weblate.org"
    echo "2. Create project 'amrnet'"
    echo "3. Upload configuration from docs/weblate.yml"
    echo "4. Import medical glossary from docs/medical-glossary.json"
    echo ""

    # Crowdin setup commands
    echo -e "${BLUE}📝 Crowdin setup instructions:${NC}"
    echo "1. Go to https://crowdin.com"
    echo "2. Create project 'amrnet-medical'"
    echo "3. Upload configuration from docs/crowdin.yml"
    echo "4. Set up medical translation workflow"
    echo ""

    # Lokalise setup commands
    echo -e "${BLUE}📝 Lokalise setup instructions:${NC}"
    echo "1. Go to https://lokalise.com"
    echo "2. Create project 'amrnet-medical-translation'"
    echo "3. Upload configuration from docs/lokalise.yml"
    echo "4. Configure medical certification requirements"
    echo ""
}

# Function to validate medical glossary
validate_medical_glossary() {
    echo -e "${YELLOW}🔧 Validating medical glossary...${NC}"

    if [ -f "medical-glossary.json" ]; then
        # Check JSON syntax
        if python3 -m json.tool medical-glossary.json > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Medical glossary JSON is valid${NC}"

            # Count terms by language
            for lang in "${LANGUAGES[@]}"; do
                count=$(python3 -c "
import json
with open('medical-glossary.json') as f:
    data = json.load(f)
count = sum(1 for term in data['terms'] if '$lang' in term.get('translations', {}))
print(count)
" 2>/dev/null || echo "0")
                echo -e "${BLUE}  📊 ${lang}: ${count} medical terms${NC}"
            done
        else
            echo -e "${RED}❌ Medical glossary JSON is invalid${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Medical glossary not found - creating basic version${NC}"
        cat > medical-glossary.json << 'EOF'
{
  "name": "AMRnet Medical Terminology",
  "description": "Standardized medical terminology for antimicrobial resistance surveillance",
  "version": "1.0.0",
  "languages": ["en", "es", "fr", "pt"],
  "terms": [
    {
      "id": "amr_001",
      "source": "antimicrobial resistance",
      "translations": {
        "es": "resistencia antimicrobiana",
        "fr": "résistance antimicrobienne",
        "pt": "resistência antimicrobiana"
      },
      "context": "Primary term for AMR - standardized WHO terminology"
    }
  ]
}
EOF
        echo -e "${GREEN}✅ Created basic medical glossary${NC}"
    fi
}

# Main execution
main() {
    echo -e "${GREEN}🚀 Starting AMRnet translation setup...${NC}"
    echo ""

    # Step 1: Validate medical glossary
    validate_medical_glossary
    echo ""

    # Step 2: Update translation templates
    update_translation_templates
    echo ""

    # Step 3: Create locale structures
    for i in "${!LANGUAGES[@]}"; do
        create_locale_structure "${LANGUAGES[$i]}" "${LANGUAGE_NAMES[$i]}"
    done
    echo ""

    # Step 4: Initialize PO files
    for i in "${!LANGUAGES[@]}"; do
        initialize_po_files "${LANGUAGES[$i]}" "${LANGUAGE_NAMES[$i]}"
    done
    echo ""

    # Step 5: Setup platform instructions
    setup_translation_platforms
    echo ""

    echo -e "${GREEN}🎉 Translation infrastructure setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Choose your preferred translation platform (Weblate/Crowdin/Lokalise)"
    echo "2. Upload the configuration files to your chosen platform"
    echo "3. Import the medical glossary for terminology consistency"
    echo "4. Recruit certified medical translators for your target languages"
    echo "5. Begin professional medical translation workflow"
    echo ""
    echo -e "${YELLOW}💡 Pro tip: Use all three platforms for maximum translation coverage!${NC}"
}

# Check dependencies
check_dependencies() {
    local missing_deps=()

    if ! command -v sphinx-build &> /dev/null; then
        missing_deps+=("sphinx")
    fi

    if ! command -v msginit &> /dev/null; then
        missing_deps+=("gettext")
    fi

    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}💡 Install with: pip install sphinx && brew install gettext${NC}"
        exit 1
    fi
}

# Run dependency check and main function
check_dependencies
main
