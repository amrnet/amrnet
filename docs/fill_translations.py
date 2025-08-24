#!/usr/bin/env python3
"""
Script to fill basic translations for AMRnet documentation.
This provides essential translations to make ReadTheDocs multi-language builds work.
"""

import os
import re
from pathlib import Path

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
    """Update a .po file with translations for the specified language."""
    if not os.path.exists(po_file_path):
        print(f"Warning: {po_file_path} does not exist")
        return 0

    translations = TRANSLATIONS.get(language, {})
    if not translations:
        print(f"Warning: No translations defined for language '{language}'")
        return 0

    try:
        with open(po_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove fuzzy marker from header
        content = re.sub(r'#, fuzzy\n', '', content)

        # Update header information
        content = re.sub(
            r'"PO-Revision-Date: YEAR-MO-DA HO:MI\+ZONE\\n"',
            '"PO-Revision-Date: 2025-08-21 12:00+0000\\n"',
            content
        )
        content = re.sub(
            r'"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"',
            '"Last-Translator: AMRnet Team <amrnetdashboard@gmail.com>\\n"',
            content
        )

        # Apply translations
        translated_count = 0
        for english_text, translated_text in translations.items():
            # Escape special characters for regex
            escaped_english = re.escape(english_text)

            # Pattern to match msgid followed by empty msgstr
            pattern = f'msgid "{escaped_english}"\nmsgstr ""'
            replacement = f'msgid "{english_text}"\nmsgstr "{translated_text}"'

            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                translated_count += 1

        # Write back the updated content
        with open(po_file_path, 'w', encoding='utf-8') as f:
            f.write(content)

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
    for language in languages:
        lang_dir = locale_dir / language / 'LC_MESSAGES'
        if lang_dir.exists():
            po_files = list(lang_dir.glob('*.po'))
            for po_file in po_files:
                mo_file = po_file.with_suffix('.mo')
                os.system(f'msgfmt "{po_file}" -o "{mo_file}"')
                print(f"Compiled {po_file.name}")

if __name__ == '__main__':
    main()
