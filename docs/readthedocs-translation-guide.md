# Read the Docs Translation Guide for AMRnet

## Overview

This guide explains how to set up and manage translations for AMRnet's Read the Docs documentation in Spanish, French, and Portuguese to match your React application's internationalization.

## Table of Contents

1. [Translation Approaches](#translation-approaches)
2. [Setup Instructions](#setup-instructions)
3. [Translation Workflow](#translation-workflow)
4. [Read the Docs Configuration](#read-the-docs-configuration)
5. [Maintenance](#maintenance)
6. [Best Practices](#best-practices)

## Translation Approaches

### Option 1: Sphinx i18n (Recommended)

**Pros**:
- Single repository management
- Automatic extraction of translatable strings
- Industry standard for Sphinx documentation
- Easy to maintain and sync translations
- Integrates well with translation tools

**Cons**:
- Requires setup of translation infrastructure
- Need to manage .po files

### Option 2: Read the Docs Subprojects

**Pros**:
- Simple Read the Docs configuration
- Each language has its own subdomain
- Easy to set up different teams per language

**Cons**:
- Content can get out of sync
- More complex maintenance
- Requires multiple projects in RTD

### Option 3: Separate Repositories

**Pros**:
- Complete independence per language
- Different teams can manage each repo

**Cons**:
- Very difficult to keep in sync
- Multiple repositories to maintain
- Not recommended for documentation

## Setup Instructions

### Step 1: Run the Setup Script

```bash
cd docs/
./setup_translations.sh
```

This will:
- Install required packages (`sphinx-intl`)
- Create locale directory structure
- Generate translation templates (.pot files)
- Initialize .po files for Spanish, French, and Portuguese
- Create helper scripts and configuration

### Step 2: Extract Translatable Content

```bash
# Extract all translatable strings
./translate.sh extract

# Or manually:
make gettext
```

### Step 3: Translate Content

#### Option A: Manual Translation (Text Editor)

Edit the `.po` files in `locale/[lang]/LC_MESSAGES/`:

```bash
# Example: Translate Spanish content
nano locale/es/LC_MESSAGES/index.po
```

Example `.po` file entry:
```po
#: ../../index.rst:7
msgid "Welcome to AMRnet"
msgstr "Bienvenido a AMRnet"

#: ../../index.rst:9
msgid "AMRnet aims to make high-quality, robust and reliable genome-derived AMR surveillance data accessible to a wide audience."
msgstr "AMRnet tiene como objetivo hacer que los datos de vigilancia de RAM derivados del genoma de alta calidad, robustos y confiables sean accesibles a una amplia audiencia."
```

#### Option B: Translation Tools

**Poedit** (Desktop application):
```bash
# Install Poedit and open .po files
sudo apt install poedit  # Linux
brew install poedit       # macOS
```

**Online platforms**:
- **Weblate**: Self-hosted or SaaS translation platform
- **Crowdin**: Professional translation management
- **Lokalise**: Team-based translation tool

#### Option C: Professional Translation Services

For medical/scientific content, consider:
- **Gengo**: Professional human translation
- **Rev**: Medical document translation
- **Stepes**: Healthcare translation specialists

### Step 4: Build Translated Documentation

```bash
# Build all languages
./translate.sh build

# Build specific language
./translate.sh build es

# Check translation status
./translate.sh status
```

### Step 5: Test Locally

```bash
# Serve Spanish documentation
cd _build/es
python -m http.server 8000

# Open http://localhost:8000 in browser
```

## Read the Docs Configuration

### Approach 1: Single Project with Language Detection

Update your `.readthedocs.yaml`:

```yaml
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
      - UV_PROJECT_ENVIRONMENT=$READTHEDOCS_VIRTUALENV_PATH uv sync --all-extras --group docs
      - pip install sphinx-intl
    install:
      - "true"

sphinx:
  configuration: docs/conf.py
  fail_on_warning: false

# Build all languages
formats: all
```

Add language switcher to `conf.py`:

```python
html_theme_options = {
    # ... existing options
    "navbar_end": ["theme-switcher", "language-switcher", "navbar-icon-links"],
}

# Language configuration
languages = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'pt': 'Português'
}

html_context = {
    'languages': languages,
    'current_language': language,
}
```

### Approach 2: Subprojects (Recommended)

1. **Main Project** (English): `amrnet`
2. **Spanish Subproject**: `amrnet-es`
3. **French Subproject**: `amrnet-fr`
4. **Portuguese Subproject**: `amrnet-pt`

#### Setting up Subprojects:

1. Go to your RTD project dashboard
2. Click "Admin" → "Subprojects"
3. Add subprojects for each language
4. Configure each subproject:

**Spanish Subproject**:
```yaml
# .readthedocs.yaml for Spanish
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
      - UV_PROJECT_ENVIRONMENT=$READTHEDOCS_VIRTUALENV_PATH uv sync --all-extras --group docs
      - pip install sphinx-intl
    install:
      - "true"

sphinx:
  configuration: docs/conf.py
  fail_on_warning: false

# Set language environment variable
build:
  environment:
    READTHEDOCS_LANGUAGE: "es"
```

#### Language Switcher Template

Create `_templates/language_switcher.html`:

```html
<div class="language-switcher">
  <select onchange="switchLanguage(this.value)">
    <option value="en" {% if current_language == 'en' %}selected{% endif %}>🇺🇸 English</option>
    <option value="es" {% if current_language == 'es' %}selected{% endif %}>🇪🇸 Español</option>
    <option value="fr" {% if current_language == 'fr' %}selected{% endif %}>🇫🇷 Français</option>
    <option value="pt" {% if current_language == 'pt' %}selected{% endif %}>🇵🇹 Português</option>
  </select>
</div>

<script>
function switchLanguage(lang) {
  var currentUrl = window.location.href;
  var baseUrl = currentUrl.split('/')[0] + '//' + currentUrl.split('/')[2];

  // Map language codes to subproject URLs
  var langUrls = {
    'en': baseUrl + '/amrnet/',
    'es': baseUrl + '/amrnet-es/',
    'fr': baseUrl + '/amrnet-fr/',
    'pt': baseUrl + '/amrnet-pt/'
  };

  if (langUrls[lang]) {
    window.location.href = langUrls[lang];
  }
}
</script>
```

## Translation Workflow

### Daily Workflow

1. **Update source content** (English RST files)
2. **Extract new strings**:
   ```bash
   ./translate.sh extract
   ```
3. **Update translation files**:
   ```bash
   ./translate.sh update
   ```
4. **Translate new/modified strings** in .po files
5. **Build and test**:
   ```bash
   ./translate.sh build
   ```
6. **Commit and push** changes

### Automated Workflow (CI/CD)

Create `.github/workflows/translations.yml`:

```yaml
name: Update Translations

on:
  push:
    branches: [main, devrev-final]
    paths: ['docs/**/*.rst']

jobs:
  update-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install sphinx sphinx-intl

      - name: Extract translatable strings
        run: |
          cd docs
          make gettext

      - name: Update translation files
        run: |
          cd docs
          sphinx-intl update -p _build/gettext

      - name: Commit updated translations
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'chore: update translation templates'
          file_pattern: docs/locale/**/*.po docs/_build/gettext/**/*.pot
```

## Maintenance

### Regular Tasks

#### Weekly
- [ ] Check translation status: `./translate.sh status`
- [ ] Review and approve new translations
- [ ] Test translated documentation builds

#### Monthly
- [ ] Update translation templates: `./translate.sh extract && ./translate.sh update`
- [ ] Coordinate with translators for new content
- [ ] Review translation quality with native speakers

#### Quarterly
- [ ] Audit translation completeness
- [ ] Update translation guidelines
- [ ] Review and update terminology glossaries

### Managing Translators

#### Contributor Guide for Translators

Create `docs/TRANSLATION_GUIDE.md`:

```markdown
# Translation Guide for AMRnet Contributors

## Getting Started

1. Fork the repository
2. Set up translation environment:
   ```bash
   cd docs
   ./setup_translations.sh
   ```
3. Choose your language and start translating!

## What to Translate

Focus on high-priority files:
1. `tutorial.rst` - User tutorial (highest priority)
2. `userguide.rst` - User guide
3. `index.rst` - Main page
4. `installation.rst` - Installation instructions

## Translation Guidelines

### Medical/Scientific Terms
- Keep technical terms consistent
- Use established medical translations
- When in doubt, include English term in parentheses

### Cultural Adaptation
- Adapt examples to local context
- Consider regional differences in healthcare systems
- Use appropriate formal/informal language for your region

### Technical Guidelines
- Preserve RST formatting
- Don't translate code blocks or URLs
- Keep cross-references intact
- Test links work in your language

## Style Guide

### Spanish
- Use formal "usted" form
- Follow RAE guidelines
- Medical terms: use established translations from WHO Spanish glossaries

### French
- Use formal language
- Follow standard medical French from INSERM/WHO
- Preserve scientific precision

### Portuguese
- Use Brazilian Portuguese standards
- Follow ANVISA medical terminology
- Include both PT-BR and PT-PT when significantly different
```

## Best Practices

### Translation Quality

1. **Consistency**
   - Use translation memory tools
   - Maintain terminology glossaries
   - Create style guides per language

2. **Cultural Sensitivity**
   - Adapt examples to local contexts
   - Consider regional healthcare systems
   - Use appropriate formality levels

3. **Technical Accuracy**
   - Don't translate medical/scientific terms arbitrarily
   - Use established terminology from WHO, medical societies
   - Include English terms in parentheses when needed

4. **Testing**
   - Build and review translated docs regularly
   - Test all links and cross-references
   - Verify formatting is preserved

### SEO and Discoverability

1. **Meta Tags**
   ```python
   # In conf.py for each language
   html_meta = {
       'description': {
           'en': 'AMRnet: Global antimicrobial resistance surveillance',
           'es': 'AMRnet: Vigilancia global de resistencia antimicrobiana',
           'fr': 'AMRnet: Surveillance mondiale de la résistance antimicrobienne',
           'pt': 'AMRnet: Vigilância global de resistência antimicrobiana'
       }
   }
   ```

2. **Language-Specific URLs**
   - English: `amrnet.readthedocs.io`
   - Spanish: `amrnet-es.readthedocs.io`
   - French: `amrnet-fr.readthedocs.io`
   - Portuguese: `amrnet-pt.readthedocs.io`

### Performance Optimization

1. **Lazy Loading**
   - Only build changed languages
   - Use translation caching
   - Optimize image assets per region

2. **CDN Configuration**
   - Serve from appropriate geographic regions
   - Use language-specific CDN endpoints

## Troubleshooting

### Common Issues

**Problem**: Translations not showing up
```bash
# Solution: Rebuild translation catalogs
./translate.sh extract
./translate.sh update
./translate.sh build
```

**Problem**: RTD build failing
```bash
# Check for syntax errors in .po files
find locale/ -name "*.po" -exec msgfmt -c {} \;
```

**Problem**: Missing translations showing English
```bash
# Check fuzzy/untranslated entries
./translate.sh status
```

### Getting Help

- **Documentation**: [Sphinx i18n docs](https://www.sphinx-doc.org/en/master/usage/advanced/intl.html)
- **Community**: Sphinx Users mailing list
- **Translation Tools**: Poedit documentation, Weblate docs
- **Professional Help**: Contact medical translation services

## Monitoring and Analytics

### Translation Metrics

Track translation progress with:

```python
# translation_metrics.py
import os
import polib

def get_translation_stats():
    stats = {}
    for lang in ['es', 'fr', 'pt']:
        po_files = []
        locale_dir = f'locale/{lang}/LC_MESSAGES'

        if os.path.exists(locale_dir):
            for file in os.listdir(locale_dir):
                if file.endswith('.po'):
                    po_files.append(os.path.join(locale_dir, file))

        total_entries = 0
        translated_entries = 0

        for po_file in po_files:
            po = polib.pofile(po_file)
            total_entries += len(po)
            translated_entries += len(po.translated_entries())

        stats[lang] = {
            'total': total_entries,
            'translated': translated_entries,
            'percentage': (translated_entries / total_entries * 100) if total_entries > 0 else 0
        }

    return stats

if __name__ == '__main__':
    stats = get_translation_stats()
    for lang, data in stats.items():
        print(f"{lang}: {data['translated']}/{data['total']} ({data['percentage']:.1f}%)")
```

### User Analytics

Monitor which language versions are most used:
- Set up Google Analytics for each language subdomain
- Track user behavior per language
- Monitor bounce rates and engagement

This comprehensive setup will give you professional-grade multilingual documentation that matches your React application's internationalization approach!
