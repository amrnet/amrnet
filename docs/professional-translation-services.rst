=====================================
Professional Translation Services
=====================================

.. container:: justify-text

   This guide covers integration with professional translation platforms and medical translation services for AMRnet documentation and interface translations.

Overview
========

AMRnet supports integration with professional translation services to ensure high-quality, medically accurate translations. This is especially important for antimicrobial resistance terminology and clinical interpretations.

.. note::
   Medical translation requires specialized expertise in microbiology, infectious diseases, and clinical laboratory terminology.

Supported Translation Platforms
===============================

Weblate Integration
-------------------

**Weblate** is an open-source, web-based translation platform ideal for collaborative translation projects.

Setup Configuration
~~~~~~~~~~~~~~~~~~~~

1. **Create Weblate Project**

.. code-block:: yaml

   # weblate.yml
   project:
     name: "AMRnet"
     slug: "amrnet"
     web: "https://amrnet.org"
     instructions: |
       AMRnet is a surveillance platform for antimicrobial resistance.
       Please ensure medical accuracy when translating clinical terms.

   components:
     - name: "Documentation"
       filemask: "docs/locale/*/LC_MESSAGES/*.po"
       template: "docs/locale/en/LC_MESSAGES/template.pot"
       file_format: "po"
       source_language: "en"

     - name: "React Interface"
       filemask: "client/locales/*.json"
       template: "client/locales/en.json"
       file_format: "json"
       source_language: "en"

2. **Webhook Integration**

.. code-block:: python

   # scripts/weblate_webhook.py
   import requests
   import subprocess
   import os

   def handle_weblate_webhook(payload):
       """Handle incoming Weblate webhook for translation updates."""
       if payload.get('event') == 'translation_update':
           component = payload['component']['slug']
           language = payload['translation']['language']['code']

           # Pull latest translations
           subprocess.run([
               'git', 'pull', 'origin',
               f'weblate-{component}-{language}'
           ])

           # Rebuild documentation if needed
           if component == 'documentation':
               subprocess.run(['make', 'html'], cwd='docs/')

           # Update React translations
           if component == 'react-interface':
               subprocess.run(['npm', 'run', 'build'], cwd='client/')

3. **Medical Terminology Glossary**

.. code-block:: yaml

   # weblate-glossary.yml
   glossary:
     - source: "antimicrobial resistance"
       translations:
         es: "resistencia antimicrobiana"
         fr: "résistance antimicrobienne"
         pt: "resistência antimicrobiana"
       note: "Primary term for AMR"

     - source: "minimum inhibitory concentration"
       translations:
         es: "concentración inhibitoria mínima"
         fr: "concentration minimale inhibitrice"
         pt: "concentração inibitória mínima"
       note: "MIC - standardized laboratory measurement"

Crowdin Integration
-------------------

**Crowdin** provides professional translation management with advanced workflows and quality assurance.

Project Setup
~~~~~~~~~~~~~

.. code-block:: yaml

   # crowdin.yml
   project_id: "amrnet"
   api_token_env: "CROWDIN_API_TOKEN"
   base_path: "."
   base_url: "https://api.crowdin.com"

   preserve_hierarchy: true

   files:
     - source: "/docs/locale/en/LC_MESSAGES/*.pot"
       translation: "/docs/locale/%two_letters_code%/LC_MESSAGES/%original_file_name%.po"
       type: "po"

     - source: "/client/locales/en.json"
       translation: "/client/locales/%two_letters_code%.json"
       type: "json"

Quality Assurance Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # crowdin-qa.yml
   quality_assurance:
     checks:
       - "empty_translations"
       - "inconsistent_translations"
       - "missing_translations"
       - "medical_terminology"

   custom_checks:
     medical_terminology:
       pattern: "resistance|susceptible|intermediate|MIC|breakpoint"
       message: "Medical term requires specialist review"

   workflows:
     - name: "Medical Review"
       steps:
         - type: "translation"
           assignees: ["medical_translators"]
         - type: "proofreading"
           assignees: ["clinical_reviewers"]
         - type: "approval"
           assignees: ["project_managers"]

Automated Workflow Integration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # scripts/crowdin_automation.py
   import crowdin_api
   import subprocess
   import json

   class CrowdinAutomation:
       def __init__(self, api_token, project_id):
           self.client = crowdin_api.Client(api_token)
           self.project_id = project_id

       def upload_source_files(self):
           """Upload source files for translation."""
           # Upload POT files
           pot_files = subprocess.check_output([
               'find', 'docs/locale/en/LC_MESSAGES', '-name', '*.pot'
           ]).decode().strip().split('\n')

           for pot_file in pot_files:
               if pot_file:
                   self.client.source_files.upload_file(
                       self.project_id,
                       pot_file,
                       type='po'
                   )

       def download_translations(self):
           """Download completed translations."""
           build = self.client.translations.build_project_translation(
               self.project_id
           )

           # Wait for build completion
           while build['data']['status'] != 'finished':
               time.sleep(30)
               build = self.client.translations.check_project_build_status(
                   self.project_id, build['data']['id']
               )

           # Download and extract
           self.client.translations.download_project_translations(
               self.project_id, build['data']['id'], 'docs/locale/'
           )

Lokalise Integration
--------------------

**Lokalise** offers advanced automation and enterprise-grade translation management.

Configuration Setup
~~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # lokalise.yml
   project_id: "your_project_id"
   api_token: "${LOKALISE_API_TOKEN}"

   file_mapping:
     documentation:
       file_format: "po"
       original_filenames: true
       directory_prefix: "docs/locale/%LANG_ISO%/LC_MESSAGES/"

     interface:
       file_format: "json"
       json_unescaped_slashes: true
       directory_prefix: "client/locales/"
       filename: "%LANG_ISO%.json"

Automated CI/CD Integration
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: yaml

   # .github/workflows/lokalise-sync.yml
   name: Lokalise Translation Sync

   on:
     schedule:
       - cron: '0 2 * * *'  # Daily at 2 AM
     workflow_dispatch:

   jobs:
     sync-translations:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - name: Install Lokalise CLI
           run: |
             curl -sfL https://raw.githubusercontent.com/lokalise/lokalise-cli-2-go/master/install.sh | sh
             sudo mv ./bin/lokalise2 /usr/local/bin/

         - name: Upload source files
           run: |
             lokalise2 file upload \
               --project-id ${{ secrets.LOKALISE_PROJECT_ID }} \
               --token ${{ secrets.LOKALISE_API_TOKEN }} \
               --file "docs/locale/en/LC_MESSAGES/*.pot" \
               --lang-iso "en"

         - name: Download translations
           run: |
             lokalise2 file download \
               --project-id ${{ secrets.LOKALISE_PROJECT_ID }} \
               --token ${{ secrets.LOKALISE_API_TOKEN }} \
               --format po \
               --unzip-to docs/locale/

         - name: Create Pull Request
           uses: peter-evans/create-pull-request@v4
           with:
             title: "Update translations from Lokalise"
             commit-message: "chore: update translations"
             branch: "translations/update"

Medical Translation Services
============================

Specialized Medical Translation
-------------------------------

For clinical and regulatory content, consider specialized medical translation services:

.. code-block:: yaml

   # medical-translation-workflow.yml
   medical_content:
     priority_files:
       - "tutorial.rst"        # Clinical guidance
       - "interpretation.rst"  # Result interpretation
       - "organisms/*.rst"     # Pathogen information

   requirements:
     qualifications:
       - "Medical translation certification"
       - "Microbiology/infectious disease background"
       - "ISO 17100 compliance"

     review_process:
       - "Translation by certified medical translator"
       - "Review by clinical microbiologist"
       - "Final approval by AMR specialist"

Terminology Management
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # scripts/medical_terminology.py
   import json
   import requests

   class MedicalTerminologyManager:
       def __init__(self):
           self.terminology_db = self.load_who_terminology()
           self.custom_terms = self.load_custom_glossary()

       def load_who_terminology(self):
           """Load WHO AMR terminology database."""
           # Integration with WHO terminology services
           response = requests.get(
               "https://www.who.int/antimicrobial-resistance/terminology.json"
           )
           return response.json()

       def validate_translation(self, source_term, target_term, language):
           """Validate medical term translation accuracy."""
           if source_term in self.terminology_db:
               official_translation = self.terminology_db[source_term].get(language)
               if official_translation and official_translation != target_term:
                   return {
                       "valid": False,
                       "suggestion": official_translation,
                       "source": "WHO terminology"
                   }
           return {"valid": True}

       def get_term_context(self, term):
           """Provide context for medical terms."""
           contexts = {
               "MIC": "Minimum Inhibitory Concentration - lowest concentration of antimicrobial that inhibits visible growth",
               "EUCAST": "European Committee on Antimicrobial Susceptibility Testing",
               "CLSI": "Clinical and Laboratory Standards Institute"
           }
           return contexts.get(term, "Standard medical term")

Quality Assurance Workflows
============================

Automated Quality Checks
-------------------------

.. code-block:: python

   # scripts/translation_qa.py
   import re
   import polib
   import json

   class TranslationQA:
       def __init__(self):
           self.medical_terms = self.load_medical_glossary()
           self.format_patterns = {
               'percentage': r'\d+\.?\d*%',
               'concentration': r'\d+\.?\d*\s*(mg/L|μg/mL)',
               'year_range': r'\d{4}-\d{4}'
           }

       def check_po_file(self, po_file_path):
           """Comprehensive QA check for PO files."""
           po_file = polib.pofile(po_file_path)
           issues = []

           for entry in po_file:
               if entry.msgstr:
                   issues.extend(self.check_entry(entry))

           return issues

       def check_entry(self, entry):
           """Check individual translation entry."""
           issues = []

           # Check medical terminology consistency
           issues.extend(self.check_medical_terms(entry))

           # Check format preservation
           issues.extend(self.check_format_preservation(entry))

           # Check placeholder preservation
           issues.extend(self.check_placeholders(entry))

           return issues

       def check_medical_terms(self, entry):
           """Verify medical terminology accuracy."""
           issues = []
           source_terms = self.extract_medical_terms(entry.msgid)
           target_terms = self.extract_medical_terms(entry.msgstr)

           for term in source_terms:
               if term in self.medical_terms:
                   expected = self.medical_terms[term].get('target_language')
                   if expected and expected not in entry.msgstr:
                       issues.append({
                           'type': 'medical_terminology',
                           'term': term,
                           'expected': expected,
                           'location': entry.linenum
                       })

           return issues

Integration Scripts
===================

Unified Translation Pipeline
----------------------------

.. code-block:: python

   # scripts/translation_pipeline.py
   import asyncio
   import aiohttp
   import subprocess
   from pathlib import Path

   class TranslationPipeline:
       def __init__(self, config):
           self.config = config
           self.platforms = {
               'weblate': WeblateClient(config['weblate']),
               'crowdin': CrowdinClient(config['crowdin']),
               'lokalise': LokaliseClient(config['lokalise'])
           }

       async def sync_all_platforms(self):
           """Synchronize translations across all platforms."""
           tasks = []

           for platform_name, client in self.platforms.items():
               if self.config.get(platform_name, {}).get('enabled'):
                   tasks.append(self.sync_platform(platform_name, client))

           results = await asyncio.gather(*tasks, return_exceptions=True)
           return dict(zip(self.platforms.keys(), results))

       async def sync_platform(self, platform_name, client):
           """Sync individual platform."""
           try:
               # Upload source files
               await client.upload_sources()

               # Download completed translations
               translations = await client.download_translations()

               # Run quality checks
               qa_results = self.run_quality_checks(translations)

               return {
                   'status': 'success',
                   'translations': len(translations),
                   'qa_issues': len(qa_results)
               }

           except Exception as e:
               return {
                   'status': 'error',
                   'error': str(e)
               }

Monitoring and Reporting
========================

Translation Progress Dashboard
------------------------------

.. code-block:: python

   # scripts/translation_dashboard.py
   import json
   import matplotlib.pyplot as plt
   from datetime import datetime

   class TranslationDashboard:
       def __init__(self):
           self.platforms = ['weblate', 'crowdin', 'lokalise']
           self.languages = ['es', 'fr', 'pt']

       def generate_progress_report(self):
           """Generate comprehensive translation progress report."""
           report = {
               'generated_at': datetime.now().isoformat(),
               'overall_progress': {},
               'platform_details': {},
               'quality_metrics': {}
           }

           for platform in self.platforms:
               platform_data = self.get_platform_data(platform)
               report['platform_details'][platform] = platform_data

           # Calculate overall progress
           for lang in self.languages:
               progress = self.calculate_language_progress(lang)
               report['overall_progress'][lang] = progress

           # Generate visualizations
           self.create_progress_charts(report)

           return report

       def create_progress_charts(self, report):
           """Create visual progress charts."""
           # Progress by language
           languages = list(report['overall_progress'].keys())
           progress_values = [
               report['overall_progress'][lang]['percentage']
               for lang in languages
           ]

           plt.figure(figsize=(10, 6))
           plt.bar(languages, progress_values)
           plt.title('Translation Progress by Language')
           plt.ylabel('Completion Percentage')
           plt.savefig('docs/_static/translation-progress.png')
           plt.close()

Deployment Integration
======================

Read the Docs Configuration
----------------------------

.. code-block:: yaml

   # .readthedocs.yml - Enhanced for professional translations
   version: 2

   build:
     os: ubuntu-22.04
     tools:
       python: "3.11"

   sphinx:
     configuration: docs/conf.py
     fail_on_warning: false

   formats:
     - pdf
     - epub

   python:
     install:
       - requirements: docs/requirements.txt
       - requirements: requirements.txt
       - method: pip
         path: .

   # Translation-specific configuration
   search:
     ranking:
       api/v2: 2
       tutorial: 10
       guide: 5

   # Professional translation webhook
   webhooks:
     - url: https://your-domain.com/webhooks/translation-update
       events: [build_success]

Best Practices
==============

Translation Workflow Guidelines
-------------------------------

1. **Source Content Preparation**

   - Use clear, concise language
   - Avoid idioms and colloquialisms
   - Include context for technical terms
   - Provide glossaries for medical terminology

2. **Translation Quality Standards**

   - Medical accuracy verification
   - Cultural appropriateness review
   - Technical terminology consistency
   - User interface coherence

3. **Review Process**

   - Initial translation by certified translators
   - Medical review by subject matter experts
   - Linguistic review for style and clarity
   - Final approval by project stakeholders

4. **Maintenance and Updates**

   - Regular terminology database updates
   - Continuous quality monitoring
   - User feedback integration
   - Version control for translations

.. note::
   **Security Consideration**: Ensure all translation platforms comply with healthcare data privacy regulations (HIPAA, GDPR) when handling medical content.

Conclusion
==========

Professional translation services integration ensures that AMRnet's critical antimicrobial resistance information is accurately communicated across language barriers. The combination of automated workflows and specialized medical translation expertise provides the quality assurance necessary for clinical decision-making tools.

For implementation support, consult with medical translation specialists familiar with antimicrobial resistance terminology and clinical microbiology practices.
