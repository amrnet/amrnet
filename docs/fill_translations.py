#!/usr/bin/env python3
"""
Script to fill basic translations for AMRnet documentation.
This provides essential translations to make ReadTheDocs multi-language builds work.

Uses polib for robust .po file handling instead of regex-based replacement.
This approach correctly handles:
- Multiline msgid/msgstr blocks
- Proper escaping of special characters
- Fuzzy flags and metadata
- Complex .po file structures
"""

import os
import re
import subprocess
from pathlib import Path
import polib

# Basic translations for key terms
TRANSLATIONS = {
    'es': {
        # Navigation and main sections
        'User Tutorial': 'Tutorial de Usuario',
        'User guide': 'Guía de Usuario',
        'Dashboard usage': 'Uso del Panel',
        'Data access': 'Acceso a Datos',
        'Data rights': 'Derechos de Datos',
        'User Resources': 'Recursos de Usuario',
        'API Reference': 'Referencia de API',
        'FARM Stack GUI': 'Interfaz FARM Stack',
        'Data Dictionary': 'Diccionario de Datos',
        'API & Integration': 'API e Integración',
        'Installation': 'Instalación',
        'Features': 'Características',
        'Performance Optimization': 'Optimización de Rendimiento',
        'Deployment Guide': 'Guía de Despliegue',
        'Security Guide': 'Guía de Seguridad',
        'Contributing': 'Contribuir',
        'License': 'Licencia',
        'Code of Conduct': 'Código de Conducta',
        'Troubleshooting': 'Resolución de Problemas',

        # Common technical terms
        'Dashboard': 'Panel de Control',
        'Database': 'Base de Datos',
        'Documentation': 'Documentación',
        'Configuration': 'Configuración',
        'Overview': 'Resumen General',
        'Introduction': 'Introducción',
        'Getting Started': 'Primeros Pasos',
        'Quick Start': 'Inicio Rápido',
        'Tutorial': 'Tutorial',
        'Guide': 'Guía',
        'Reference': 'Referencia',
        'Examples': 'Ejemplos',
        'Usage': 'Uso',
        'Settings': 'Configuraciones',
        'Options': 'Opciones',
        'Parameters': 'Parámetros',
        'Variables': 'Variables',
        'Functions': 'Funciones',
        'Methods': 'Métodos',
        'Classes': 'Clases',
        'Modules': 'Módulos',
    },
    'fr': {
        # Navigation and main sections
        'User Tutorial': 'Tutoriel Utilisateur',
        'User guide': 'Guide Utilisateur',
        'Dashboard usage': 'Utilisation du Tableau de Bord',
        'Data access': 'Accès aux Données',
        'Data rights': 'Droits des Données',
        'User Resources': 'Ressources Utilisateur',
        'API Reference': 'Référence API',
        'FARM Stack GUI': 'Interface FARM Stack',
        'Data Dictionary': 'Dictionnaire de Données',
        'API & Integration': 'API et Intégration',
        'Installation': 'Installation',
        'Features': 'Fonctionnalités',
        'Performance Optimization': 'Optimisation des Performances',
        'Deployment Guide': 'Guide de Déploiement',
        'Security Guide': 'Guide de Sécurité',
        'Contributing': 'Contribuer',
        'License': 'Licence',
        'Code of Conduct': 'Code de Conduite',
        'Troubleshooting': 'Dépannage',

        # Common technical terms
        'Dashboard': 'Tableau de Bord',
        'Database': 'Base de Données',
        'Documentation': 'Documentation',
        'Configuration': 'Configuration',
        'Overview': 'Aperçu Général',
        'Introduction': 'Introduction',
        'Getting Started': 'Premiers Pas',
        'Quick Start': 'Démarrage Rapide',
        'Tutorial': 'Tutoriel',
        'Guide': 'Guide',
        'Reference': 'Référence',
        'Examples': 'Exemples',
        'Usage': 'Utilisation',
        'Settings': 'Paramètres',
        'Options': 'Options',
        'Parameters': 'Paramètres',
        'Variables': 'Variables',
        'Functions': 'Fonctions',
        'Methods': 'Méthodes',
        'Classes': 'Classes',
        'Modules': 'Modules',
    },
    'pt': {
        # Navigation and main sections
        'User Tutorial': 'Tutorial do Usuário',
        'User guide': 'Guia do Usuário',
        'Dashboard usage': 'Uso do Painel',
        'Data access': 'Acesso aos Dados',
        'Data rights': 'Direitos dos Dados',
        'User Resources': 'Recursos do Usuário',
        'API Reference': 'Referência da API',
        'FARM Stack GUI': 'Interface FARM Stack',
        'Data Dictionary': 'Dicionário de Dados',
        'API & Integration': 'API e Integração',
        'Installation': 'Instalação',
        'Features': 'Recursos',
        'Performance Optimization': 'Otimização de Performance',
        'Deployment Guide': 'Guia de Implantação',
        'Security Guide': 'Guia de Segurança',
        'Contributing': 'Contribuindo',
        'License': 'Licença',
        'Code of Conduct': 'Código de Conduta',
        'Troubleshooting': 'Solução de Problemas',

        # Common technical terms
        'Dashboard': 'Painel de Controle',
        'Database': 'Base de Dados',
        'Documentation': 'Documentação',
        'Configuration': 'Configuração',
        'Overview': 'Visão Geral',
        'Introduction': 'Introdução',
        'Getting Started': 'Primeiros Passos',
        'Quick Start': 'Início Rápido',
        'Tutorial': 'Tutorial',
        'Guide': 'Guia',
        'Reference': 'Referência',
        'Examples': 'Exemplos',
        'Usage': 'Uso',
        'Settings': 'Configurações',
        'Options': 'Opções',
        'Parameters': 'Parâmetros',
        'Variables': 'Variáveis',
        'Functions': 'Funções',
        'Methods': 'Métodos',
        'Classes': 'Classes',
        'Modules': 'Módulos',
    }
}

def update_po_file(po_file_path, language):
    """Update a .po file with translations for the specified language using polib."""
    if not os.path.exists(po_file_path):
        print(f"Warning: {po_file_path} does not exist")
        return 0

    translations = TRANSLATIONS.get(language, {})
    if not translations:
        print(f"Warning: No translations defined for language '{language}'")
        return 0

    try:
        # Load the .po file using polib
        po = polib.pofile(po_file_path)
        translated_count = 0

        # Update header information
        po.metadata['PO-Revision-Date'] = '2025-08-21 12:00+0000'
        po.metadata['Last-Translator'] = 'AMRnet Team <amrnetdashboard@gmail.com>'

        # Apply translations using polib
        for entry in po:
            # Skip fuzzy entries and entries that already have translations
            if entry.msgid in translations and not entry.msgstr:
                entry.msgstr = translations[entry.msgid]
                # Remove fuzzy flag if present
                if 'fuzzy' in entry.flags:
                    entry.flags.remove('fuzzy')
                translated_count += 1

        # Save the updated .po file
        po.save(po_file_path)

        print(f"Updated {po_file_path}: {translated_count} translations added")
        return translated_count

    except Exception as e:
        print(f"Error updating {po_file_path}: {e}")
        return 0

def main():
    """Main function to update all translation files."""
    docs_dir = Path(__file__).parent
    locale_dir = docs_dir / 'locale'

    if not locale_dir.exists():
        print(f"Error: locale directory not found at {locale_dir}")
        return

    languages = ['es', 'fr', 'pt']
    total_translations = 0

    for language in languages:
        lang_dir = locale_dir / language / 'LC_MESSAGES'
        if not lang_dir.exists():
            print(f"Warning: {lang_dir} does not exist")
            continue

        print(f"\n=== Updating {language.upper()} translations ===")

        # Update all .po files in the language directory
        po_files = list(lang_dir.glob('*.po'))
        for po_file in po_files:
            count = update_po_file(po_file, language)
            total_translations += count

    print(f"\n=== Summary ===")
    print(f"Total translations added: {total_translations}")

    # Compile all translations
    print("\n=== Compiling translations ===")
    compilation_errors = 0
    for language in languages:
        lang_dir = locale_dir / language / 'LC_MESSAGES'
        if lang_dir.exists():
            po_files = list(lang_dir.glob('*.po'))
            for po_file in po_files:
                mo_file = po_file.with_suffix('.mo')
                try:
                    result = subprocess.run(
                        ['msgfmt', str(po_file), '-o', str(mo_file)],
                        capture_output=True,
                        text=True,
                        check=True
                    )
                    print(f"✓ Compiled {po_file.name}")
                except subprocess.CalledProcessError as e:
                    print(f"✗ Failed to compile {po_file.name}:")
                    print(f"  Error: {e.stderr.strip()}")
                    compilation_errors += 1
                except FileNotFoundError:
                    print(f"✗ msgfmt command not found. Please install gettext tools.")
                    compilation_errors += 1
                    break

    if compilation_errors > 0:
        print(f"\n⚠️  {compilation_errors} compilation error(s) occurred. Check the output above.")
    else:
        print(f"\n✅ All translations compiled successfully!")

if __name__ == '__main__':
    main()
