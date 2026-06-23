#!/bin/bash
# FounderOS — macOS install helper
# Run after dragging FounderOS.app to /Applications

APP="/Applications/FounderOS.app"

if [ ! -d "$APP" ]; then
  echo "FounderOS.app not found in /Applications"
  echo "Drag FounderOS.app to Applications first, then re-run this script."
  exit 1
fi

echo "Clearing quarantine..."
find "$APP" -exec xattr -c {} \; 2>/dev/null

echo "Signing..."
codesign --force --deep --sign - "$APP" 2>/dev/null

echo "Done. Launching FounderOS..."
open "$APP"
