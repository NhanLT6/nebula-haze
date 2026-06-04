# Nebula Haze - Codebase Guide for Claude

## Color work

**Read `PALETTE.md` first** - it contains the full swatch book, token mappings, and governance rules.

When changing a color:
1. Identify the palette slot (family + level) in `PALETTE.md`
2. Update `shared/palette.ts` (the machine-readable source of truth)
3. Update the token in `rider/nebula-haze.xml`
4. Run `npm run build` in `vscode/` to regenerate `vscode/themes/nebula-haze-color-theme.json`
5. Update the `Used for` column in `PALETTE.md` if the token mapping changes

The full design rationale lives at `docs/superpowers/specs/2026-05-07-palette-system-design.md`.

## Theme files

- `rider/nebula-haze.xml` - JetBrains/Rider color scheme
- `rider/preview.html` - Rider visual preview
- `vscode/themes/nebula-haze-color-theme.json` - VSCode theme (GENERATED - run `npm run build` in `vscode/`)
- `vscode/src/vscode-mappings.ts` - VSCode token assignments (edit this, not the JSON)
- `shared/palette.ts` - machine-readable palette (mirrors `PALETTE.md`)
- `tools/audit-contrast.py` - contrast audit utility
