# AMRnet Read the Docs Translation - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Initialize Translation Infrastructure

```bash
cd docs/
./setup_translations.sh
```

### 2. Extract Translatable Content

```bash
./translate.sh extract
```

### 3. Start Translating

Edit translation files for your language:

```bash
# Spanish
nano locale/es/LC_MESSAGES/tutorial.po

# French
nano locale/fr/LC_MESSAGES/tutorial.po

# Portuguese
nano locale/pt/LC_MESSAGES/tutorial.po
```

### 4. Build and Test

```bash
# Build Spanish documentation
./translate.sh build es

# Test locally
cd _build/es && python -m http.server 8000
```

## 📋 Translation Priority Order

1. **High Priority** (User-facing):
   - `tutorial.rst` - New comprehensive user tutorial
   - `userguide.rst` - Basic user guide
   - `index.rst` - Main landing page

2. **Medium Priority** (Setup/Usage):
   - `installation.rst` - Installation guide
   - `usage.rst` - Dashboard usage
   - `troubleshooting.rst` - Problem solving

3. **Low Priority** (Technical):
   - `api.rst` - API documentation
   - `contributing.rst` - Developer guide
   - `deployment.rst` - Deployment guide

## 🌍 Translation Guidelines

### Medical/Scientific Terms

**Keep These in English** (with translation in parentheses):
- AMR (Resistencia Antimicrobiana / Résistance Antimicrobienne / Resistência Antimicrobiana)
- MLST (Tipificación Multilocus / Typage Multi-Locus / Tipagem Multilocus)
- XDR (Extremadamente Resistente / Extrêmement Résistant / Extremamente Resistente)

### Key Phrases

| English | Spanish | French | Portuguese |
|---------|---------|--------|------------|
| Antimicrobial Resistance | Resistencia Antimicrobiana | Résistance Antimicrobienne | Resistência Antimicrobiana |
| Dashboard | Panel de Control | Tableau de Bord | Painel |
| Surveillance | Vigilancia | Surveillance | Vigilância |
| Healthcare Professional | Profesional de Salud | Professionnel de Santé | Profissional de Saúde |
| Public Health | Salud Pública | Santé Publique | Saúde Pública |

## 🔧 Read the Docs Setup

### Option 1: Subprojects (Recommended)

1. **Main Project**: `amrnet` (English)
2. **Create Subprojects**:
   - `amrnet-es` (Spanish)
   - `amrnet-fr` (French)
   - `amrnet-pt` (Portuguese)

3. **Set Environment Variables** in each subproject:
   - Spanish: `READTHEDOCS_LANGUAGE=es`
   - French: `READTHEDOCS_LANGUAGE=fr`
   - Portuguese: `READTHEDOCS_LANGUAGE=pt`

### Option 2: Single Project with Language Detection

Update `.readthedocs.yaml`:

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
      - pip install sphinx-intl babel
    install:
      - "true"

sphinx:
  configuration: docs/conf.py
  fail_on_warning: false
```

## 🔄 Workflow Commands

```bash
# Extract new translatable strings
./translate.sh extract

# Update existing translation files
./translate.sh update

# Build specific language
./translate.sh build es

# Check translation progress
./translate.sh status

# Build all languages
./translate.sh build
```

## 📊 Translation Status Tracking

The script creates `translation_status.md` to track progress:

- 🇪🇸 **Spanish**: Edit `locale/es/LC_MESSAGES/*.po`
- 🇫🇷 **French**: Edit `locale/fr/LC_MESSAGES/*.po`
- 🇵🇹 **Portuguese**: Edit `locale/pt/LC_MESSAGES/*.po`

## 🆘 Common Issues

**Problem**: Translations not showing
```bash
# Rebuild translation catalogs
./translate.sh extract && ./translate.sh update && ./translate.sh build
```

**Problem**: Build errors
```bash
# Check .po file syntax
find locale/ -name "*.po" -exec msgfmt -c {} \;
```

## 📚 Tools for Translation

### Free Tools
- **Poedit**: Desktop .po file editor
- **VS Code**: With po file extensions
- **Online editors**: GitLocalize, Crowdin (free tier)

### Professional Tools
- **Weblate**: Self-hosted translation platform
- **Crowdin**: Team translation management
- **Lokalise**: Professional translation workflows

## 🎯 Integration with React App

Your React app already supports 4 languages. The documentation translations should match:

**React Locales**:
- `client/locales/en.json` → docs `locale/en/`
- `client/locales/es.json` → docs `locale/es/`
- `client/locales/fr.json` → docs `locale/fr/`
- `client/locales/pt.json` → docs `locale/pt/`

## 🌐 URL Structure

After setup, your documentation will be available at:

- **English**: `amrnet.readthedocs.io`
- **Spanish**: `amrnet-es.readthedocs.io`
- **French**: `amrnet-fr.readthedocs.io`
- **Portuguese**: `amrnet-pt.readthedocs.io`

## 📈 Next Steps

1. **Immediate**: Start with `tutorial.rst` translation (highest impact)
2. **Week 1**: Complete `userguide.rst` and `index.rst`
3. **Week 2**: Add `installation.rst` and `usage.rst`
4. **Month 1**: Complete all user-facing documentation
5. **Ongoing**: Set up automated translation updates

This approach ensures your comprehensive user tutorial and documentation are accessible to Spanish, French, and Portuguese-speaking healthcare professionals and researchers worldwide!
