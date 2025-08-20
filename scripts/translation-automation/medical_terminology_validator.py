#!/usr/bin/env python3
"""
Medical Terminology Validator for AMRnet Professional Translations
Ensures accuracy and consistency of antimicrobial resistance terminology
"""

import json
import re
import logging
import argparse
import requests
from pathlib import Path
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ValidationIssue:
    """Represents a medical terminology validation issue."""
    severity: str  # 'critical', 'high', 'medium', 'low'
    category: str  # 'medical_terminology', 'clinical_accuracy', 'format_preservation'
    term: str
    expected: str
    actual: str
    context: str
    file_path: str
    line_number: int
    recommendation: str
    source_authority: str  # 'WHO', 'EUCAST', 'CLSI', 'AMRnet'

class MedicalTerminologyValidator:
    """Comprehensive medical terminology validator for AMR content."""

    def __init__(self, glossary_path: str = "docs/medical-glossary.json"):
        self.medical_glossary = self._load_medical_glossary(glossary_path)
        self.who_terminology = self._load_who_terminology()
        self.clinical_patterns = self._load_clinical_patterns()
        self.validation_rules = self._load_validation_rules()

    def _load_medical_glossary(self, path: str) -> Dict[str, Any]:
        """Load AMRnet medical glossary."""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Medical glossary not found at {path}")
            return {}

    def _load_who_terminology(self) -> Dict[str, Any]:
        """Load WHO AMR terminology database."""
        # In production, this would connect to WHO terminology API
        # For now, using curated subset
        return {
            "antimicrobial_resistance": {
                "definition": "Resistance of microorganisms to antimicrobial agents",
                "standardized_translations": {
                    "es": "resistencia antimicrobiana",
                    "fr": "résistance antimicrobienne",
                    "pt": "resistência antimicrobiana"
                },
                "avoid_terms": {
                    "es": ["resistencia antibiótica", "resistencia antimicrobial"],
                    "fr": ["résistance antibiotique", "résistance antimicrobial"],
                    "pt": ["resistência antibiótica", "resistência antimicrobial"]
                }
            },
            "minimum_inhibitory_concentration": {
                "definition": "Lowest concentration inhibiting visible growth",
                "standardized_translations": {
                    "es": "concentración inhibitoria mínima",
                    "fr": "concentration minimale inhibitrice",
                    "pt": "concentração inibitória mínima"
                },
                "abbreviation": "MIC",
                "preserve_abbreviation": True
            }
        }

    def _load_clinical_patterns(self) -> Dict[str, Any]:
        """Load clinical terminology patterns for validation."""
        return {
            "susceptibility_categories": {
                "pattern": r"\b(susceptible|intermediate|resistant)\b",
                "translations": {
                    "susceptible": {"es": "sensible", "fr": "sensible", "pt": "sensível"},
                    "intermediate": {"es": "intermedio", "fr": "intermédiaire", "pt": "intermediário"},
                    "resistant": {"es": "resistente", "fr": "résistant", "pt": "resistente"}
                }
            },
            "concentration_units": {
                "pattern": r"\d+\.?\d*\s*(mg/L|μg/mL|mcg/mL)",
                "preserve_exact": True,
                "note": "Concentration units must be preserved exactly"
            },
            "organism_names": {
                "pattern": r"\b[A-Z][a-z]+\s+[a-z]+\b",
                "preserve_italics": True,
                "note": "Scientific names should remain in Latin"
            },
            "clinical_breakpoints": {
                "pattern": r"breakpoint|cut-?off|threshold",
                "translations": {
                    "breakpoint": {"es": "punto de corte", "fr": "seuil", "pt": "ponto de corte"}
                }
            }
        }

    def _load_validation_rules(self) -> Dict[str, Any]:
        """Load comprehensive validation rules."""
        return {
            "critical_terms": [
                "antimicrobial resistance", "minimum inhibitory concentration",
                "susceptible", "intermediate", "resistant", "breakpoint"
            ],
            "preserve_exact": [
                "MIC", "EUCAST", "CLSI", "WHO", "CDC", "GLASS"
            ],
            "medical_abbreviations": {
                "MIC": "minimum inhibitory concentration",
                "EUCAST": "European Committee on Antimicrobial Susceptibility Testing",
                "CLSI": "Clinical and Laboratory Standards Institute",
                "AMR": "antimicrobial resistance",
                "MDR": "multidrug-resistant",
                "XDR": "extensively drug-resistant",
                "PDR": "pandrug-resistant"
            },
            "clinical_contexts": [
                "diagnosis", "treatment", "therapy", "clinical interpretation",
                "laboratory testing", "susceptibility testing", "antibiogram"
            ]
        }

    def validate_po_file(self, po_file_path: str, target_language: str) -> List[ValidationIssue]:
        """Validate a PO file for medical terminology accuracy."""
        issues = []

        try:
            import polib
            po_file = polib.pofile(po_file_path)

            for entry in po_file:
                if entry.msgstr and not entry.obsolete:
                    entry_issues = self.validate_entry(
                        entry.msgid,
                        entry.msgstr,
                        target_language,
                        po_file_path,
                        entry.linenum
                    )
                    issues.extend(entry_issues)

        except ImportError:
            logger.error("polib not installed. Run: pip install polib")
        except Exception as e:
            logger.error(f"Error validating {po_file_path}: {e}")

        return issues

    def validate_entry(self, source: str, translation: str, language: str,
                      file_path: str, line_number: int) -> List[ValidationIssue]:
        """Validate a single translation entry."""
        issues = []

        # Validate medical terminology
        issues.extend(self._validate_medical_terms(
            source, translation, language, file_path, line_number
        ))

        # Validate clinical patterns
        issues.extend(self._validate_clinical_patterns(
            source, translation, language, file_path, line_number
        ))

        # Validate format preservation
        issues.extend(self._validate_format_preservation(
            source, translation, file_path, line_number
        ))

        # Validate abbreviations
        issues.extend(self._validate_abbreviations(
            source, translation, file_path, line_number
        ))

        return issues

    def _validate_medical_terms(self, source: str, translation: str, language: str,
                               file_path: str, line_number: int) -> List[ValidationIssue]:
        """Validate medical terminology accuracy."""
        issues = []

        # Check against WHO terminology
        for term_key, term_data in self.who_terminology.items():
            term_pattern = term_key.replace("_", r"\s+")

            if re.search(term_pattern, source, re.IGNORECASE):
                expected = term_data.get("standardized_translations", {}).get(language)
                avoid_terms = term_data.get("avoid_terms", {}).get(language, [])

                if expected and expected.lower() not in translation.lower():
                    issues.append(ValidationIssue(
                        severity="critical",
                        category="medical_terminology",
                        term=term_key.replace("_", " "),
                        expected=expected,
                        actual=translation,
                        context=source,
                        file_path=file_path,
                        line_number=line_number,
                        recommendation=f"Use WHO standardized term: '{expected}'",
                        source_authority="WHO"
                    ))

                # Check for terms to avoid
                for avoid_term in avoid_terms:
                    if avoid_term.lower() in translation.lower():
                        issues.append(ValidationIssue(
                            severity="high",
                            category="medical_terminology",
                            term=avoid_term,
                            expected=expected,
                            actual=translation,
                            context=source,
                            file_path=file_path,
                            line_number=line_number,
                            recommendation=f"Avoid non-standard term. Use: '{expected}'",
                            source_authority="WHO"
                        ))

        return issues

    def _validate_clinical_patterns(self, source: str, translation: str, language: str,
                                   file_path: str, line_number: int) -> List[ValidationIssue]:
        """Validate clinical terminology patterns."""
        issues = []

        for pattern_name, pattern_data in self.clinical_patterns.items():
            pattern = pattern_data["pattern"]
            matches = re.finditer(pattern, source, re.IGNORECASE)

            for match in matches:
                term = match.group().lower()

                if "translations" in pattern_data:
                    expected_translations = pattern_data["translations"]

                    for english_term, translations in expected_translations.items():
                        if english_term.lower() == term:
                            expected = translations.get(language)
                            if expected and expected.lower() not in translation.lower():
                                issues.append(ValidationIssue(
                                    severity="high",
                                    category="clinical_accuracy",
                                    term=english_term,
                                    expected=expected,
                                    actual=translation,
                                    context=source,
                                    file_path=file_path,
                                    line_number=line_number,
                                    recommendation=f"Use clinical standard: '{expected}'",
                                    source_authority="Clinical Standards"
                                ))

        return issues

    def _validate_format_preservation(self, source: str, translation: str,
                                     file_path: str, line_number: int) -> List[ValidationIssue]:
        """Validate that critical formatting is preserved."""
        issues = []

        # Check concentration units
        concentration_pattern = r"\d+\.?\d*\s*(mg/L|μg/mL|mcg/mL|%)"
        source_concentrations = re.findall(concentration_pattern, source)
        target_concentrations = re.findall(concentration_pattern, translation)

        if len(source_concentrations) != len(target_concentrations):
            issues.append(ValidationIssue(
                severity="critical",
                category="format_preservation",
                term="concentration_units",
                expected=str(source_concentrations),
                actual=str(target_concentrations),
                context=source,
                file_path=file_path,
                line_number=line_number,
                recommendation="Preserve all concentration values and units exactly",
                source_authority="Technical Standards"
            ))

        # Check percentage values
        percentage_pattern = r"\d+\.?\d*%"
        source_percentages = re.findall(percentage_pattern, source)
        target_percentages = re.findall(percentage_pattern, translation)

        if source_percentages != target_percentages:
            issues.append(ValidationIssue(
                severity="high",
                category="format_preservation",
                term="percentage_values",
                expected=str(source_percentages),
                actual=str(target_percentages),
                context=source,
                file_path=file_path,
                line_number=line_number,
                recommendation="Preserve all percentage values exactly",
                source_authority="Technical Standards"
            ))

        return issues

    def _validate_abbreviations(self, source: str, translation: str,
                               file_path: str, line_number: int) -> List[ValidationIssue]:
        """Validate that medical abbreviations are preserved correctly."""
        issues = []

        for abbrev, full_form in self.validation_rules["medical_abbreviations"].items():
            if abbrev in source and abbrev not in translation:
                issues.append(ValidationIssue(
                    severity="medium",
                    category="medical_terminology",
                    term=abbrev,
                    expected=f"Preserve abbreviation: {abbrev}",
                    actual=translation,
                    context=source,
                    file_path=file_path,
                    line_number=line_number,
                    recommendation=f"Medical abbreviations should be preserved: {abbrev} ({full_form})",
                    source_authority="Medical Standards"
                ))

        return issues

    def generate_validation_report(self, issues: List[ValidationIssue]) -> Dict[str, Any]:
        """Generate comprehensive validation report."""
        report = {
            "summary": {
                "total_issues": len(issues),
                "critical": len([i for i in issues if i.severity == "critical"]),
                "high": len([i for i in issues if i.severity == "high"]),
                "medium": len([i for i in issues if i.severity == "medium"]),
                "low": len([i for i in issues if i.severity == "low"])
            },
            "categories": {},
            "files": {},
            "issues": []
        }

        # Group by category
        for issue in issues:
            if issue.category not in report["categories"]:
                report["categories"][issue.category] = 0
            report["categories"][issue.category] += 1

            # Group by file
            if issue.file_path not in report["files"]:
                report["files"][issue.file_path] = 0
            report["files"][issue.file_path] += 1

            # Add to issues list
            report["issues"].append({
                "severity": issue.severity,
                "category": issue.category,
                "term": issue.term,
                "expected": issue.expected,
                "actual": issue.actual,
                "context": issue.context,
                "file": issue.file_path,
                "line": issue.line_number,
                "recommendation": issue.recommendation,
                "authority": issue.source_authority
            })

        return report

def main():
    """Main entry point for medical terminology validation."""
    parser = argparse.ArgumentParser(
        description="Validate medical terminology in AMRnet translations"
    )
    parser.add_argument(
        "--input-dir",
        default="docs/locale",
        help="Directory containing translation files"
    )
    parser.add_argument(
        "--glossary",
        default="docs/medical-glossary.json",
        help="Path to medical glossary file"
    )
    parser.add_argument(
        "--output",
        default="medical-validation-report.json",
        help="Output file for validation report"
    )
    parser.add_argument(
        "--language",
        choices=["es", "fr", "pt"],
        help="Specific language to validate (default: all)"
    )

    args = parser.parse_args()

    validator = MedicalTerminologyValidator(args.glossary)
    all_issues = []

    input_dir = Path(args.input_dir)
    languages = [args.language] if args.language else ["es", "fr", "pt"]

    for language in languages:
        lang_dir = input_dir / language / "LC_MESSAGES"
        if lang_dir.exists():
            po_files = list(lang_dir.glob("*.po"))

            for po_file in po_files:
                logger.info(f"Validating {po_file} for {language}")
                issues = validator.validate_po_file(str(po_file), language)
                all_issues.extend(issues)

                if issues:
                    logger.warning(f"Found {len(issues)} issues in {po_file}")
        else:
            logger.warning(f"Language directory not found: {lang_dir}")

    # Generate report
    report = validator.generate_validation_report(all_issues)

    # Save report
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    # Print summary
    print(f"\nMedical Terminology Validation Complete")
    print(f"Total Issues: {report['summary']['total_issues']}")
    print(f"Critical: {report['summary']['critical']}")
    print(f"High: {report['summary']['high']}")
    print(f"Medium: {report['summary']['medium']}")
    print(f"Low: {report['summary']['low']}")
    print(f"\nDetailed report saved to: {args.output}")

    # Exit with appropriate code
    if report['summary']['critical'] > 0:
        print("❌ Critical medical terminology issues found!")
        exit(1)
    elif report['summary']['high'] > 0:
        print("⚠️  High priority medical issues found")
        exit(1)
    else:
        print("✅ Medical terminology validation passed")
        exit(0)

if __name__ == "__main__":
    main()
