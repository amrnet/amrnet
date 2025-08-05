# 🌍 AMRnet Translation Platform Configuration Guide

## Quick Setup for Spanish, French, and Portuguese

This guide helps you configure professional medical translation services for AMRnet in **Spanish (es)**, **French (fr)**, and **Portuguese (pt)**.

## 🚀 One-Command Setup

```bash
# From the docs directory
cd docs
../scripts/setup-translation-platforms.sh
```

## 🎯 Platform-Specific Configurations

### Option 1: Weblate (Open Source Collaborative)

**Best for**: Community-driven translation with medical expert oversight

**Configuration**: `docs/weblate.yml`

**Setup Steps**:
1. Go to [hosted.weblate.org](https://hosted.weblate.org)
2. Create project **"amrnet"**
3. Upload configuration from `docs/weblate.yml`
4. Import medical glossary from `docs/medical-glossary.json`
5. Invite certified medical translators for es/fr/pt

**Medical Requirements**:
- ✅ ISO 17100 medical translation certification
- ✅ Clinical microbiology background
- ✅ 5+ years healthcare translation experience
- ✅ Antimicrobial resistance terminology expertise

### Option 2: Crowdin (Professional Translation Management)

**Best for**: Professional medical translation workflows with expert review

**Configuration**: `docs/crowdin.yml`

**Setup Steps**:
1. Go to [crowdin.com](https://crowdin.com)
2. Create project **"amrnet-medical"**
3. Upload configuration from `docs/crowdin.yml`
4. Set up 4-stage medical workflow:
   - Medical Translation (Certified translators)
   - Clinical Expert Review (Microbiologists)
   - Linguistic Proofreading (Medical editors)
   - Final Medical Validation (Senior clinicians)

**Quality Assurance**:
- ✅ 98% medical accuracy threshold
- ✅ WHO terminology compliance
- ✅ EUCAST/CLSI standardization
- ✅ Automated terminology validation

### Option 3: Lokalise (Enterprise Translation Automation)

**Best for**: Large-scale medical translation with enterprise features

**Configuration**: `docs/lokalise.yml`

**Setup Steps**:
1. Go to [lokalise.com](https://lokalise.com)
2. Create project **"amrnet-medical-translation"**
3. Upload configuration from `docs/lokalise.yml`
4. Configure medical certification tracking
5. Set up enterprise workflow automation

**Enterprise Features**:
- ✅ Advanced medical workflows
- ✅ Certification tracking for translators
- ✅ Quality analytics and reporting
- ✅ Regulatory compliance monitoring

## 📋 Language-Specific Requirements

### Spanish (es) - Global Spanish-speaking regions
- **Certification**: ISO 17100 Medical Translation
- **Expertise**: Clinical microbiology, AMR terminology
- **Standards**: WHO terminology, EUCAST guidelines
- **Experience**: 5+ years medical translation

### French (fr) - France, Francophone Africa, Canada
- **Certification**: Medical Translation Professional
- **Expertise**: Pharmaceutical terminology, clinical laboratory
- **Standards**: EUCAST guidelines, medical device regulations
- **Experience**: 5+ years pharmaceutical/medical translation

### Portuguese (pt) - Brazil, Portugal, Lusophone Africa
- **Certification**: Certified Medical Translator
- **Expertise**: Healthcare terminology, laboratory standards
- **Standards**: Regional medical practices, surveillance systems
- **Experience**: 5+ years healthcare translation

## 🔧 Files and Structure

```
docs/
├── conf.py                              # Sphinx config with i18n support
├── .readthedocs.yml                     # Read the Docs multi-language config
├── weblate.yml                          # Weblate platform configuration
├── crowdin.yml                          # Crowdin workflow configuration
├── lokalise.yml                         # Lokalise enterprise configuration
├── medical-glossary.json                # Medical terminology database
├── translation-config.yml               # Master configuration file
└── locale/
    ├── en/LC_MESSAGES/                  # English templates (.pot files)
    ├── es/LC_MESSAGES/                  # Spanish translations (.po files)
    ├── fr/LC_MESSAGES/                  # French translations (.po files)
    └── pt/LC_MESSAGES/                  # Portuguese translations (.po files)

client/
└── locales/
    ├── en.json                          # English interface
    ├── es.json                          # Spanish interface
    ├── fr.json                          # French interface
    └── pt.json                          # Portuguese interface
```

## 📊 Quality Standards

All platforms enforce the same medical translation standards:

| Requirement | Target | Validation |
|-------------|--------|------------|
| Medical Accuracy | 98% | Clinical expert review |
| Terminology Consistency | 100% | WHO/EUCAST compliance |
| Format Preservation | 100% | Automated QA checks |
| Translator Certification | ISO 17100 | Platform verification |

## 🎯 Recommended Approach

### For Maximum Coverage: **Use All Three Platforms**

1. **Weblate**: Community contributions and collaborative editing
2. **Crowdin**: Professional workflow with clinical expert review
3. **Lokalise**: Enterprise automation and quality analytics

### For Budget-Conscious: **Start with Weblate**
- Open source and free
- Strong community support
- Medical expert oversight available

### For Professional Medical: **Use Crowdin**
- 4-stage medical validation workflow
- Certified medical translator pool
- Clinical expert review process

### For Enterprise Scale: **Use Lokalise**
- Advanced automation features
- Comprehensive quality analytics
- Enterprise compliance tracking

## 🚀 Quick Start Commands

```bash
# Initialize translation infrastructure
cd docs
../scripts/setup-translation-platforms.sh

# Update translation templates
sphinx-build -b gettext . locale/gettext

# Generate Spanish translations
sphinx-intl update -p locale/gettext -l es

# Build Spanish documentation
make -e SPHINXOPTS="-D language='es'" html

# Test translation coverage
sphinx-intl stat
```

## 🔍 Validation

Verify your setup:

```bash
# Check locale structure
ls -la locale/*/LC_MESSAGES/

# Validate medical glossary
python3 -m json.tool docs/medical-glossary.json

# Test Sphinx multi-language build
SPHINXOPTS="-D language='es'" make html
SPHINXOPTS="-D language='fr'" make html
SPHINXOPTS="-D language='pt'" make html
```

## 📞 Professional Support

For enterprise medical translation needs:

- **Weblate**: Community support + medical expert consultancy
- **Crowdin**: Professional medical translation team available
- **Lokalise**: Enterprise medical translation partnerships

---

## ✅ Next Steps

1. **Choose your platform** (or use multiple)
2. **Run setup script** from docs directory
3. **Upload configurations** to chosen platform(s)
4. **Import medical glossary** for terminology consistency
5. **Recruit certified medical translators**
6. **Begin professional translation workflow**

Your AMRnet documentation will soon be available in professional medical-grade Spanish, French, and Portuguese! 🌍
