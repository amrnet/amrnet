#!/bin/bash
# Compile all .po files to .mo files in docs/locale/*/LC_MESSAGES

find docs/locale -type d -name LC_MESSAGES | while read dir; do
  echo "Compiling in $dir"
  for po in "$dir"/*.po; do
    [ -f "$po" ] || continue
    msgfmt "$po" -o "${po%.po}.mo"
  done
done
echo "All .po files compiled to .mo files."
