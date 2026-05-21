#!/usr/bin/env bash
# End-to-end test: convert every HTML slide in test/ to a single PPTX and
# verify the output is structurally valid (zip with the expected number of
# slideN.xml entries).
#
# Dependencies (`playwright` + Chromium, `pptxgenjs`) must be resolvable when
# the conversion script runs. Either rely on a global install or invoke via:
#   npx --package=playwright --package=pptxgenjs -c '<script-command>'
# The skill does not ship a package.json on purpose.
#
# Usage: test/test-e2e.sh [--via-npx]
#   --via-npx    Wrap the conversion in `npx --package=playwright --package=pptxgenjs -c`

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_DIR="$SCRIPT_DIR"
OUTPUT="$TEST_DIR/output.pptx"

VIA_NPX=0
for arg in "$@"; do
  case "$arg" in
    --via-npx) VIA_NPX=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

cd "$REPO_ROOT"

mapfile -t SLIDES < <(ls "$TEST_DIR"/*.html | sort)
if [ "${#SLIDES[@]}" -eq 0 ]; then
  echo "ERROR: No HTML test slides found in $TEST_DIR" >&2
  exit 1
fi
EXPECTED_SLIDES="${#SLIDES[@]}"

echo "==> Converting $EXPECTED_SLIDES slide(s)$([ "$VIA_NPX" = 1 ] && echo " via npx")"
rm -f "$OUTPUT"

if [ "$VIA_NPX" = 1 ]; then
  # `npx` puts the cached packages in a private node_modules, but Node ESM
  # resolves modules from the importing file's directory and ignores NODE_PATH.
  # Workaround: symlink the npx node_modules next to the script for the run.
  # The playwright version pin matches agent-browser's so that cached browsers
  # under ~/.cache/ms-playwright are reused.
  printf -v SLIDE_ARGS '%q ' "${SLIDES[@]}"
  ABS_SCRIPT="$REPO_ROOT/scripts/html-to-pptx.js"
  SCRIPTS_DIR="$REPO_ROOT/scripts"
  npx --yes --package=playwright@1.59.1 --package=pptxgenjs -c \
    "ln -snf \"\$(dirname \$(dirname \$(command -v playwright)))\" $(printf %q "$SCRIPTS_DIR/node_modules") && node $(printf %q "$ABS_SCRIPT") --output $(printf %q "$OUTPUT") $SLIDE_ARGS; rc=\$?; rm -f $(printf %q "$SCRIPTS_DIR/node_modules"); exit \$rc"
else
  node scripts/html-to-pptx.js --output "$OUTPUT" "${SLIDES[@]}"
fi

echo
echo "==> Verifying $OUTPUT"

if [ ! -f "$OUTPUT" ]; then
  echo "FAIL: output.pptx was not created" >&2
  exit 1
fi

SIZE=$(wc -c < "$OUTPUT")
if [ "$SIZE" -lt 10000 ]; then
  echo "FAIL: output.pptx is suspiciously small ($SIZE bytes)" >&2
  exit 1
fi
echo "  ✓ file exists ($SIZE bytes)"

# PPTX files are zip archives. The Office Open XML spec puts each slide at
# ppt/slides/slideN.xml, so counting those entries tells us conversion ran
# end-to-end for every input slide.
if ! command -v unzip >/dev/null 2>&1; then
  echo "  ⚠ unzip not available, skipping structural check"
  exit 0
fi

if ! unzip -t "$OUTPUT" >/dev/null 2>&1; then
  echo "FAIL: output.pptx is not a valid zip archive" >&2
  exit 1
fi
echo "  ✓ valid zip archive"

SLIDE_COUNT=$(unzip -l "$OUTPUT" | grep -E 'ppt/slides/slide[0-9]+\.xml$' | wc -l)
if [ "$SLIDE_COUNT" -ne "$EXPECTED_SLIDES" ]; then
  echo "FAIL: expected $EXPECTED_SLIDES slide(s) in PPTX, found $SLIDE_COUNT" >&2
  exit 1
fi
echo "  ✓ contains $SLIDE_COUNT slide(s)"

# Confirm at least one slide carries the screenshot background.
MEDIA_COUNT=$(unzip -l "$OUTPUT" | grep -E 'ppt/media/' | wc -l)
if [ "$MEDIA_COUNT" -lt 1 ]; then
  echo "FAIL: no embedded media found in PPTX (background screenshots missing)" >&2
  exit 1
fi
echo "  ✓ embeds $MEDIA_COUNT media file(s)"

echo
echo "✓ End-to-end test passed"
