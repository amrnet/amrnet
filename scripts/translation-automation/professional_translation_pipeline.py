#!/usr/bin/env python3
"""
Professional Translation Pipeline for AMRnet
Integrates with Weblate, Crowdin, and Lokalise for medical translation workflows
"""

import asyncio
import aiohttp
import subprocess
import json
import yaml
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MedicalTerminologyValidator:
    """Validates medical terminology in translations."""

    def __init__(self):
        self.medical_terms = self._load_medical_glossary()
        self.who_terminology = self._load_who_terms()

    def _load_medical_glossary(self) -> Dict[str, Dict]:
        """Load AMRnet-specific medical glossary."""
        glossary_path = Path("docs/medical-glossary.json")
        if glossary_path.exists():
            with open(glossary_path) as f:
                return json.load(f)
        return {}

    def _load_who_terms(self) -> Dict[str, Dict]:
        """Load WHO AMR terminology database."""
        # In production, this would connect to WHO terminology API
        return {
            "antimicrobial_resistance": {
                "es": "resistencia antimicrobiana",
                "fr": "résistance antimicrobienne",
                "pt": "resistência antimicrobiana"
            },
            "minimum_inhibitory_concentration": {
                "es": "concentración inhibitoria mínima",
                "fr": "concentration minimale inhibitrice",
                "pt": "concentração inibitória mínima"
            }
        }

    def validate_translation(self, source_term: str, target_term: str, language: str) -> Dict[str, Any]:
        """Validate medical term translation accuracy."""
        source_key = source_term.lower().replace(" ", "_")

        if source_key in self.who_terminology:
            expected = self.who_terminology[source_key].get(language)
            if expected and expected.lower() != target_term.lower():
                return {
                    "valid": False,
                    "expected": expected,
                    "actual": target_term,
                    "source": "WHO terminology",
                    "severity": "high"
                }

        if source_key in self.medical_terms:
            expected = self.medical_terms[source_key].get(language)
            if expected and expected.lower() != target_term.lower():
                return {
                    "valid": False,
                    "expected": expected,
                    "actual": target_term,
                    "source": "AMRnet glossary",
                    "severity": "medium"
                }

        return {"valid": True}

class WeblateClient:
    """Client for Weblate professional translation platform."""

    def __init__(self, config: Dict):
        self.config = config
        self.base_url = config.get('base_url', 'https://hosted.weblate.org')
        self.api_token = os.getenv('WEBLATE_API_TOKEN')

    async def upload_sources(self) -> bool:
        """Upload source files to Weblate."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {'Authorization': f'Token {self.api_token}'}

                # Upload POT files
                pot_files = Path("docs/locale/en/LC_MESSAGES").glob("*.pot")
                for pot_file in pot_files:
                    with open(pot_file, 'rb') as f:
                        data = aiohttp.FormData()
                        data.add_field('file', f, filename=pot_file.name)

                        url = f"{self.base_url}/api/projects/{self.config['project']}/components/documentation/translations/"
                        async with session.post(url, headers=headers, data=data) as resp:
                            if resp.status != 200:
                                logger.error(f"Failed to upload {pot_file.name}: {await resp.text()}")
                                return False

            logger.info("Successfully uploaded source files to Weblate")
            return True

        except Exception as e:
            logger.error(f"Error uploading to Weblate: {e}")
            return False

    async def download_translations(self) -> List[str]:
        """Download completed translations from Weblate."""
        downloaded_files = []

        try:
            async with aiohttp.ClientSession() as session:
                headers = {'Authorization': f'Token {self.api_token}'}

                for language in ['es', 'fr', 'pt']:
                    url = f"{self.base_url}/api/projects/{self.config['project']}/components/documentation/translations/{language}/file/"

                    async with session.get(url, headers=headers) as resp:
                        if resp.status == 200:
                            content = await resp.read()
                            output_file = f"docs/locale/{language}/LC_MESSAGES/messages.po"

                            Path(output_file).parent.mkdir(parents=True, exist_ok=True)
                            with open(output_file, 'wb') as f:
                                f.write(content)

                            downloaded_files.append(output_file)
                            logger.info(f"Downloaded translation for {language}")
                        else:
                            logger.warning(f"No translation available for {language}")

            return downloaded_files

        except Exception as e:
            logger.error(f"Error downloading from Weblate: {e}")
            return []

class CrowdinClient:
    """Client for Crowdin professional translation platform."""

    def __init__(self, config: Dict):
        self.config = config
        self.api_token = os.getenv('CROWDIN_API_TOKEN')
        self.project_id = config['project_id']

    async def upload_sources(self) -> bool:
        """Upload source files to Crowdin."""
        try:
            # Use Crowdin CLI for reliable uploads
            cmd = [
                'crowdin', 'upload', 'sources',
                '--token', self.api_token,
                '--project-id', self.project_id
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("Successfully uploaded sources to Crowdin")
                return True
            else:
                logger.error(f"Crowdin upload failed: {result.stderr}")
                return False

        except Exception as e:
            logger.error(f"Error uploading to Crowdin: {e}")
            return False

    async def download_translations(self) -> List[str]:
        """Download completed translations from Crowdin."""
        try:
            cmd = [
                'crowdin', 'download',
                '--token', self.api_token,
                '--project-id', self.project_id
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("Successfully downloaded translations from Crowdin")

                # Return list of downloaded files
                downloaded_files = []
                for language in ['es', 'fr', 'pt']:
                    po_file = f"docs/locale/{language}/LC_MESSAGES/messages.po"
                    if Path(po_file).exists():
                        downloaded_files.append(po_file)

                return downloaded_files
            else:
                logger.error(f"Crowdin download failed: {result.stderr}")
                return []

        except Exception as e:
            logger.error(f"Error downloading from Crowdin: {e}")
            return []

class LokaliseClient:
    """Client for Lokalise professional translation platform."""

    def __init__(self, config: Dict):
        self.config = config
        self.api_token = os.getenv('LOKALISE_API_TOKEN')
        self.project_id = config['project_id']

    async def upload_sources(self) -> bool:
        """Upload source files to Lokalise."""
        try:
            cmd = [
                'lokalise2', 'file', 'upload',
                '--project-id', self.project_id,
                '--token', self.api_token,
                '--file', 'docs/locale/en/LC_MESSAGES/*.pot',
                '--lang-iso', 'en'
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("Successfully uploaded sources to Lokalise")
                return True
            else:
                logger.error(f"Lokalise upload failed: {result.stderr}")
                return False

        except Exception as e:
            logger.error(f"Error uploading to Lokalise: {e}")
            return False

    async def download_translations(self) -> List[str]:
        """Download completed translations from Lokalise."""
        try:
            cmd = [
                'lokalise2', 'file', 'download',
                '--project-id', self.project_id,
                '--token', self.api_token,
                '--format', 'po',
                '--unzip-to', 'docs/locale/'
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("Successfully downloaded translations from Lokalise")

                # Return list of downloaded files
                downloaded_files = []
                for language in ['es', 'fr', 'pt']:
                    po_file = f"docs/locale/{language}/LC_MESSAGES/messages.po"
                    if Path(po_file).exists():
                        downloaded_files.append(po_file)

                return downloaded_files
            else:
                logger.error(f"Lokalise download failed: {result.stderr}")
                return []

        except Exception as e:
            logger.error(f"Error downloading from Lokalise: {e}")
            return []

class TranslationPipeline:
    """Main translation pipeline coordinator."""

    def __init__(self, config_path: str = "docs/translation-config.yml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        self.validator = MedicalTerminologyValidator()
        self.platforms = {}

        # Initialize platform clients
        if self.config.get('weblate', {}).get('enabled'):
            self.platforms['weblate'] = WeblateClient(self.config['weblate'])

        if self.config.get('crowdin', {}).get('enabled'):
            self.platforms['crowdin'] = CrowdinClient(self.config['crowdin'])

        if self.config.get('lokalise', {}).get('enabled'):
            self.platforms['lokalise'] = LokaliseClient(self.config['lokalise'])

    async def sync_all_platforms(self) -> Dict[str, Any]:
        """Synchronize translations across all enabled platforms."""
        results = {}

        for platform_name, client in self.platforms.items():
            try:
                logger.info(f"Syncing {platform_name}...")

                # Upload source files
                upload_success = await client.upload_sources()
                if not upload_success:
                    results[platform_name] = {"status": "upload_failed"}
                    continue

                # Download completed translations
                downloaded_files = await client.download_translations()

                # Run quality checks
                qa_results = await self.run_quality_checks(downloaded_files)

                results[platform_name] = {
                    "status": "success",
                    "files_downloaded": len(downloaded_files),
                    "qa_issues": len(qa_results)
                }

            except Exception as e:
                logger.error(f"Error syncing {platform_name}: {e}")
                results[platform_name] = {
                    "status": "error",
                    "error": str(e)
                }

        return results

    async def run_quality_checks(self, po_files: List[str]) -> List[Dict[str, Any]]:
        """Run comprehensive quality checks on translation files."""
        all_issues = []

        for po_file in po_files:
            try:
                import polib
                po = polib.pofile(po_file)

                for entry in po:
                    if entry.msgstr:
                        # Check medical terminology
                        issues = self.check_medical_terms(entry)
                        all_issues.extend(issues)

                        # Check format preservation
                        format_issues = self.check_format_preservation(entry)
                        all_issues.extend(format_issues)

            except Exception as e:
                logger.error(f"Error checking {po_file}: {e}")

        return all_issues

    def check_medical_terms(self, entry) -> List[Dict[str, Any]]:
        """Check medical terminology in translation entry."""
        issues = []

        # Extract potential medical terms (simple heuristic)
        import re
        medical_patterns = [
            r'antimicrobial\s+resistance',
            r'minimum\s+inhibitory\s+concentration',
            r'susceptible|intermediate|resistant',
            r'MIC|EUCAST|CLSI'
        ]

        for pattern in medical_patterns:
            matches = re.finditer(pattern, entry.msgid, re.IGNORECASE)
            for match in matches:
                term = match.group()
                validation = self.validator.validate_translation(
                    term, entry.msgstr, 'es'  # Language detection would be more sophisticated
                )

                if not validation['valid']:
                    issues.append({
                        'type': 'medical_terminology',
                        'term': term,
                        'file': entry.linenum,
                        'severity': validation.get('severity', 'medium'),
                        'details': validation
                    })

        return issues

    def check_format_preservation(self, entry) -> List[Dict[str, Any]]:
        """Check that formatting elements are preserved."""
        issues = []

        # Check for percentage, concentration, and other scientific formats
        import re
        format_patterns = [
            r'\d+\.?\d*%',
            r'\d+\.?\d*\s*(mg/L|μg/mL)',
            r'\d{4}-\d{4}',  # Year ranges
        ]

        for pattern in format_patterns:
            source_matches = re.findall(pattern, entry.msgid)
            target_matches = re.findall(pattern, entry.msgstr)

            if len(source_matches) != len(target_matches):
                issues.append({
                    'type': 'format_preservation',
                    'expected': source_matches,
                    'found': target_matches,
                    'file': entry.linenum,
                    'severity': 'high'
                })

        return issues

async def main():
    """Main entry point for translation pipeline."""
    pipeline = TranslationPipeline()

    logger.info("Starting professional translation sync...")
    results = await pipeline.sync_all_platforms()

    # Generate report
    report = {
        'timestamp': datetime.now().isoformat(),
        'platforms': results,
        'summary': {
            'total_platforms': len(results),
            'successful': len([r for r in results.values() if r.get('status') == 'success']),
            'failed': len([r for r in results.values() if r.get('status') != 'success'])
        }
    }

    # Save report
    with open('translation-sync-report.json', 'w') as f:
        json.dump(report, f, indent=2)

    logger.info(f"Translation sync completed. Report saved to translation-sync-report.json")
    logger.info(f"Summary: {report['summary']}")

if __name__ == "__main__":
    asyncio.run(main())
