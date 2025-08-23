#!/usr/bin/env python3
"""
Fix .po file formatting issues for ReadTheDocs translation compilation.

This script fixes common formatting issues in .po files that prevent
msgfmt compilation, particularly missing newline characters and
improper string termination.
"""

import os
import re
import glob

def fix_po_file(filepath):
    """Fix formatting issues in a single .po file."""
    print(f"Fixing {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix header fields missing \n" termination
    patterns = [
        (r'"PO-Revision-Date: ([^"]+)"\n', r'"PO-Revision-Date: \1\\n"\n'),
        (r'"Last-Translator: ([^"]+)"\n', r'"Last-Translator: \1\\n"\n'),
        (r'"Language-Team: ([^"]+)"\n', r'"Language-Team: \1\\n"\n'),
    ]

    fixed_content = content
    for pattern, replacement in patterns:
        fixed_content = re.sub(pattern, replacement, fixed_content)

    # Fix any remaining header field issues
    # Look for lines that should end with \n" but don't
    lines = fixed_content.split('\n')
    fixed_lines = []

    in_header = True
    for line in lines:
        if in_header and line.startswith('"') and not line.endswith('\\n"') and line.endswith('"'):
            # This is a header field that should end with \n"
            if not line.endswith('\\n"'):
                line = line[:-1] + '\\n"'

        # End of header when we hit an empty line
        if line.strip() == '':
            in_header = False

        fixed_lines.append(line)

    fixed_content = '\n'.join(fixed_lines)

    # Write the fixed content back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    return True

def main():
    """Fix all .po files in the documentation locale directory."""
    base_dir = '/Users/lshlt19/GitHub/louise-aug2025/amrnet-devrevfianl/amrnet/docs'
    locale_dir = os.path.join(base_dir, 'locale')

    # Find all .po files
    po_files = glob.glob(os.path.join(locale_dir, '**', '*.po'), recursive=True)

    print(f"Found {len(po_files)} .po files to fix")

    fixed_count = 0
    for po_file in po_files:
        try:
            fix_po_file(po_file)
            fixed_count += 1
        except Exception as e:
            print(f"Error fixing {po_file}: {e}")

    print(f"\nFixed {fixed_count}/{len(po_files)} .po files")

    # Test compilation after fixing
    print("\nTesting compilation of fixed files...")
    for po_file in po_files:
        try:
            mo_file = po_file.replace('.po', '.mo')
            os.system(f'msgfmt "{po_file}" -o "{mo_file}"')
            print(f"✓ {os.path.basename(po_file)} compiled successfully")
        except Exception as e:
            print(f"✗ {os.path.basename(po_file)} compilation failed: {e}")

if __name__ == '__main__':
    main()
