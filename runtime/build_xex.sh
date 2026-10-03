#!/usr/bin/env bash
set -e
make clean >/dev/null 2>&1 || true
make
if command -v elf2xex >/dev/null 2>&1;then elf2xex ./xboxblocks_game.elf32 "./${PROJECT_NAME:-xboxblocks_game}.xex";elif [ -n "${ELF2XEX:-}" ]&&[ -x "$ELF2XEX" ];then "$ELF2XEX" ./xboxblocks_game.elf32 "./${PROJECT_NAME:-xboxblocks_game}.xex";else echo "elf2xex not found" >&2;exit 2;fi