#!/usr/bin/env bash
# Re-run the SXSW 2026 schedule scraper
# Output goes to scraper/output/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting SXSW 2026 schedule scrape..."
echo "Output directory: $SCRIPT_DIR/output/"
echo ""

node scrape.ts

echo ""
echo "Done. Files written:"
ls -lh output/*.json 2>/dev/null || echo "  (no output files found — check errors above)"
