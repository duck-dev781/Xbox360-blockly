#!/usr/bin/env bash
set -euo pipefail
PROJECT_NAME="$PROJECT_NAME"
echo "[Xbox Blockly] Checking LibXenon toolchain..."
if [ -z "${DEVKITXENON:-}" ]; then echo "DEVKITXENON is not set." >&2; exit 9; fi
command -v make >/dev/null 2>&1 || { echo "make was not found." >&2; exit 10; }
command -v xenon-gcc >/dev/null 2>&1 || { echo "xenon-gcc was not found in PATH." >&2; exit 11; }
make clean >/dev/null 2>&1 || true
make
ELF="./xboxblocks_game.elf32"
XEX="./$PROJECT_NAME.xex"
if command -v elf2xex >/dev/null 2>&1; then
  elf2xex "$ELF" "$XEX"
else
  echo "elf2xex was not found." >&2
  exit 12
fi
test -s "$XEX"
echo "[Xbox Blockly] XEX ready: $XEX"
