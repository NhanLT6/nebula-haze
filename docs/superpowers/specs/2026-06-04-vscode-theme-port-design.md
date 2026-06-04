# VSCode Theme Port — Design Spec

**Date:** 2026-06-04
**Status:** Approved

---

## Overview

Port the Nebula Haze color theme from JetBrains/Rider to VSCode as a proper extension, using a hybrid approach: Tokyo Night Storm's JSON as the structural seed for comprehensive token coverage, with all color values replaced by Nebula Haze palette slots driven by a TypeScript generator. The VSCode and Rider themes share a common palette module but maintain independent mapping files.

---

## Decisions

| Topic | Decision |
|---|---|
| Languages targeted | TypeScript, React, Vue, C#, Dart/Flutter |
| Semantic highlighting | Enabled (`semanticHighlighting: true`) |
| Flash mitigation | TextMate scopes aligned to semantic output — same color = invisible transition |
| Chrome | Full Nebula Haze palette (sidebar, tabs, titlebar, statusbar all use theme colors) |
| VSCode background | `#1f2235` (midpoint between current `#21243a` and calmer `#1d2030`) |
| Rider background | `#21243a` unchanged |
| Syntax colors | Rider palette carried over as-is |
| Distribution | Local install now; structured for Marketplace publish (`vsce package`) when ready |
| Approach | Hybrid B+C: Tokyo Night Storm seeds the mapping layer; palette generator produces the JSON |

---

## Repo Restructure

The repo is reorganised into per-platform folders. All platforms share a common palette module.

```
nebula-haze/
  README.md
  CLAUDE.md
  PALETTE.md                        ← human-readable reference (root, stays)
  shared/
    palette.ts                      ← machine-readable source of truth (new)
  tools/
    audit-contrast.py               ← shared contrast utility (moved from root)
  rider/
    nebula-haze.xml                 ← moved from root
    META-INF/plugin.xml             ← moved from root
    preview.html                    ← moved from root
    swatch.html                     ← moved from root
    build.js                        ← moved from root
    release.sh                      ← moved from root
    releases/                       ← moved from root
    package.json                    ← moved from root
  vscode/
    package.json                    ← VSCode extension manifest
    .vscodeignore                   ← excludes src/ from .vsix
    themes/
      nebula-haze-color-theme.json  ← GENERATED — do not edit by hand
    src/
      vscode-mappings.ts            ← slot → VSCode token assignments
      build.ts                      ← generator: reads mappings, emits JSON
  prompt/
    nebula-haze.omp.json            ← existing
    README.md                       ← existing
  docs/
```

**Notes:**
- `nebula-haze.theme.json` at root is an earlier incomplete VSCode attempt — review during implementation and delete or migrate to `vscode/themes/`.
- `themes/nebula-haze-color-theme.json` is committed to git (VSCode needs to load it without running the build) but is a build artifact — never edited directly.

---

## Palette Module (`shared/palette.ts`)

Machine-readable mirror of `PALETTE.md`. `as const` gives literal types for autocomplete and typo-safety.

```ts
export const palette = {
  base: {
    bg:        '#21243a',
    text:      '#c0caf5',
    comment:   '#606480',
    inlayHint: '#565f89',
    chromeDim: '#2a2e48',
    chromeMid: '#414868',
  },
  blue:   { dim: '#7494c8', mid: '#8aabe6', bright: '#a5bcf0' },
  violet: { whisper: '#c2c0e8', dim: '#9480c8', mid: '#c498ff', bright: '#dbbeff' },
  teal:   { whisper: '#bdd8e8', dim: '#5a9e94', mid: '#6ec4b6', bright: '#8fd4c8' },
  green:  { dim: '#6a9e78', mid: '#96cc9e', bright: '#88dda0' },
  pink:   { dim: '#b07888', mid: '#e888c0', bright: '#e0aabf' },
  sand:   { dim: '#a8a578', mid: '#c5c28a', bright: '#d4d07a' },
  orange: '#e09a68',
  diag:   { error: '#e07891', warning: '#c9a55a' },
  vcs:    { added: '#9fd4ae', modified: '#d4d07a', deleted: '#e0aabf' },
  ui:     { selection: '#3c3465', caretRow: '#181a2c', popupBg: '#13152a' },
  vscode: {
    bg:       '#1f2235',
    caretRow: '#171929',
    tabBar:   '#171929',
    titleBar: '#13152a',
  },
} as const;

export type Palette = typeof palette;
```

When a hex value changes in `PALETTE.md`, update the matching line here. One extra edit — propagation is automatic.

---

## Mapping Strategy

### Seeding from Tokyo Night Storm

1. Download Tokyo Night Storm's MIT-licensed JSON
2. Extract all token scope rules and workbench color keys into `vscode-mappings.ts`
3. Replace every color value with the nearest `palette.*` slot reference
4. Where no clear palette match exists, make an explicit decision and log it with a comment

This gives comprehensive coverage (~700+ slots) without inheriting Tokyo Night's color choices.

### `vscode/src/vscode-mappings.ts` structure

```ts
import { palette as p } from '../../shared/palette'

export const workbench = {
  'editor.background':              p.vscode.bg,
  'editor.foreground':              p.base.text,
  'editor.lineHighlightBackground': p.vscode.caretRow,
  'editorLineNumber.foreground':    p.base.inlayHint,
  'editorCursor.foreground':        p.base.text,
  'editor.selectionBackground':     p.ui.selection,
  'sideBar.background':             p.vscode.titleBar,
  'activityBar.background':         p.vscode.titleBar,
  'statusBar.background':           p.ui.selection,
  // ~200 more workbench keys
}

export const semanticTokens = {
  'keyword':    { foreground: p.violet.mid },
  'function':   { foreground: p.blue.mid },
  'class':      { foreground: p.violet.bright },
  'type':       { foreground: p.violet.bright },
  'interface':  { foreground: p.green.mid },
  'parameter':  { foreground: p.teal.whisper },
  'variable':   { foreground: p.base.text },
  'property':   { foreground: p.teal.bright },
  'enumMember': { foreground: p.teal.mid },
  'string':     { foreground: p.green.bright },
  'number':     { foreground: p.sand.mid },
  'comment':    { foreground: p.base.comment },
  // ~100 more semantic token types
}

export const tokenColors = [
  // TextMate scopes — intentionally matched to semantic output to minimise flash
  { scope: 'keyword.control',      settings: { foreground: p.violet.mid } },
  { scope: 'entity.name.function', settings: { foreground: p.blue.mid } },
  { scope: 'entity.name.type',     settings: { foreground: p.violet.bright } },
  { scope: 'string',               settings: { foreground: p.green.bright } },
  // ~150 more TextMate scopes
]
```

### Flash mitigation

Semantic tokens are designed first (they're more accurate, like Rider's language-aware coloring). TextMate scopes are then set to match what semantic will resolve to for the common case. When the two layers agree, the transition on load is invisible.

---

## Build Pipeline

**`vscode/src/build.ts`:**
```ts
import { workbench, semanticTokens, tokenColors } from './vscode-mappings'
import { writeFileSync } from 'fs'

const theme = {
  name: 'Nebula Haze',
  type: 'dark',
  semanticHighlighting: true,
  colors: workbench,
  semanticTokenColors: semanticTokens,
  tokenColors,
}

writeFileSync(
  '../themes/nebula-haze-color-theme.json',
  JSON.stringify(theme, null, 2)
)
```

**`vscode/package.json` scripts:**
```json
{
  "scripts": {
    "build:vscode": "ts-node src/build.ts"
  }
}
```

Run `pnpm build:vscode` after any palette or mapping change to regenerate the theme JSON.

---

## Extension Manifest (`vscode/package.json`)

```json
{
  "name": "nebula-haze",
  "displayName": "Nebula Haze",
  "description": "A cool-toned dark theme with violet, teal, and blue — ported from JetBrains Rider",
  "version": "0.1.0",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Themes"],
  "contributes": {
    "themes": [{
      "label": "Nebula Haze",
      "uiTheme": "vs-dark",
      "path": "./themes/nebula-haze-color-theme.json"
    }]
  }
}
```

Publisher ID and marketplace metadata added when ready to publish.

---

## Local Install

```powershell
# One-time symlink — VSCode always loads from the working directory
New-Item -ItemType SymbolicLink `
  -Path "$env:USERPROFILE\.vscode\extensions\nebula-haze" `
  -Target "E:\repos\nebula-haze\vscode"
```

Restart VSCode → theme appears in the colour theme picker immediately.

---

## Publish Workflow (when ready)

```powershell
cd vscode
pnpm build:vscode          # regenerate JSON
vsce package               # → nebula-haze-0.x.x.vsix
vsce publish               # push to Marketplace
```

---

## Token Color Role Mapping (Rider → VSCode)

| Semantic role | Palette slot | Rider attribute | VSCode semantic token |
|---|---|---|---|
| Keyword | `violet.mid` `#c498ff` | `KEYWORD` | `keyword` |
| Function / method | `blue.mid` `#8aabe6` | `DEFAULT_FUNCTION_CALL` | `function`, `method` |
| Class / type ref | `violet.bright` `#dbbeff` | `CLASS_NAME` | `class`, `type` |
| Interface | `green.mid` `#96cc9e` | `INTERFACE_NAME` | `interface` |
| Parameter | `teal.whisper` `#bdd8e8` | `PARAMETER` | `parameter` |
| Constant / enum | `teal.mid` `#6ec4b6` | `CONSTANT` | `enumMember` |
| Property / attribute | `teal.bright` `#8fd4c8` | `INSTANCE_FIELD` | `property` |
| String | `green.bright` `#88dda0` | `STRING` | `string` |
| Number | `sand.mid` `#c5c28a` | `NUMBER` | `number` |
| Operator / punctuation | `orange` `#e09a68` | `OPERATION_SIGN` | `operator` |
| Comment | `base.comment` `#606480` | `LINE_COMMENT` | `comment` |
| Plain text / variable | `base.text` `#c0caf5` | `TEXT` | `variable` |

---

## Terminal ANSI Colors

VSCode integrated terminal colors are part of the workbench `colors` section (keys like `terminal.ansiGreen`, `terminal.ansiBlue`, etc.) and will be mapped to palette slots during the Tokyo Night seeding pass. Mapping intent:

| ANSI role | Palette slot |
|---|---|
| Black / BrightBlack | `base.chromeDim` / `base.chromeMid` |
| Red / BrightRed | `diag.error` |
| Green / BrightGreen | `green.mid` / `green.bright` |
| Yellow / BrightYellow | `sand.mid` / `sand.bright` |
| Blue / BrightBlue | `blue.mid` / `blue.bright` |
| Magenta / BrightMagenta | `violet.mid` / `violet.bright` |
| Cyan / BrightCyan | `teal.mid` / `teal.bright` |
| White / BrightWhite | `base.text` |

---

## Out of Scope

- Rider theme changes (background stays `#21243a`, no Rider color changes)
- Icon theme
- Keybindings
- Settings sync / profiles
