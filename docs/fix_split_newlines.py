#!/usr/bin/env python3
"""
Fix .po file formatting issues specifically for split newline characters.
"""

import os
import re
import glob

def fix_po_file_split_newlines(filepath):
    """Fix .po files where newline characters are split across lines."""
    print(f"Fixing split newlines in {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the specific pattern where newlines are split
    # Pattern: "Some text\n" followed by "\n" on next line
    fixed_content = re.sub(r'"([^"]*)\n\\n"\n', r'"\1\\n"\n', content)

    # Also fix cases where the closing quote is on a separate line
    fixed_content = re.sub(r'"([^"]*)\n"\n', r'"\1\\n"\n', fixed_content)

    # Write the fixed content back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    return True

def main():
    """Fix all .po files with split newline issues."""
    # Use relative path from script location to work across different systems
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = script_dir  # This script is in the docs directory
    locale_dir = os.path.join(base_dir, 'locale')

    # Find all .po files
    po_files = glob.glob(os.path.join(locale_dir, '**', '*.po'), recursive=True)

    print(f"Found {len(po_files)} .po files to fix")

    fixed_count = 0
    for po_file in po_files:
        try:
            fix_po_file_split_newlines(po_file)
            fixed_count += 1
        except Exception as e:
            print(f"Error fixing {po_file}: {e}")

    print(f"\nFixed {fixed_count}/{len(po_files)} .po files")

if __name__ == '__main__':
    main()
