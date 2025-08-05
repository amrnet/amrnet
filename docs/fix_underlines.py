#!/usr/bin/env python3
"""
Script to fix RST title underline length warnings.
This script will automatically adjust underlines to match their titles.
"""

import re
import os
import glob

def fix_underlines_in_file(filepath):
    """Fix underline length issues in a single RST file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    modified = False

    i = 0
    while i < len(lines) - 1:
        current_line = lines[i]
        next_line = lines[i + 1] if i + 1 < len(lines) else ""

        # Check if next line is an underline (all same characters)
        if (current_line.strip() and next_line.strip() and
            len(set(next_line.strip())) == 1 and
            next_line.strip()[0] in '=-~^"\'`#*+_'):

            title_length = len(current_line.strip())
            underline_length = len(next_line.strip())
            underline_char = next_line.strip()[0]

            # Fix if lengths don't match
            if title_length != underline_length:
                lines[i + 1] = underline_char * title_length
                modified = True
                print(f"Fixed underline in {filepath}: '{current_line.strip()}'")

        i += 1

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"Updated: {filepath}")

    return modified

def main():
    """Main function to process all RST files."""
    docs_dir = "/Users/lshlt19/GitHub/230625_amrnet/amrnet/docs"
    rst_files = glob.glob(os.path.join(docs_dir, "*.rst"))

    total_fixed = 0
    for rst_file in rst_files:
        if fix_underlines_in_file(rst_file):
            total_fixed += 1

    print(f"\nFixed underlines in {total_fixed} files.")

if __name__ == "__main__":
    main()
