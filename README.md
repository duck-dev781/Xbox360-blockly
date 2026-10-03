# Xbox 360 Blockly

A lightweight graphical block editor for building Xbox 360 homebrew projects.

## Current design

- Blockly-based graphical editor with PenguinMod-style extension/category organization.
- Xbox 360 blocks for events, control, logic, math, controller input, vibration, timing, graphics placeholders, and console diagnostics.
- Console Info deliberately excludes CPU and DVD keys.
- Generates C source for a libXenon-based Xbox 360 project.
- Build button bridges into a local libXenon/elf2xex toolchain and outputs an XEX.
- Linux AppImage packaging through GitHub Actions.
- Built-in release/update checker.

## Backend

The Xbox 360 backend targets Free60Project/libxenon. LibXenon is a bare-metal Xbox 360 homebrew library. Its documented build system uses the `DEVKITXENON` environment and its example projects use Makefiles based on the libXenon rules.

The XEX conversion step expects `elf2xex` to be available locally (or supplied through `ELF2XEX`).

## Sources

- Blockly: https://developers.google.com/blockly
- PenguinMod extension model: https://docs.penguinmod.com/development/extensions/
- Free60 libXenon: https://github.com/Free60Project/libxenon
- Free60 Xenon examples: https://github.com/Free60Project/xenon-examples
- AppImage/Tauri packaging: https://v1.tauri.app/v1/guides/building/linux/
