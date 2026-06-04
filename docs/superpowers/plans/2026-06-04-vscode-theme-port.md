# VSCode Theme Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Nebula Haze JetBrains theme to a VSCode extension using a palette-driven generator seeded from Tokyo Night Storm.

**Architecture:** A shared `palette.ts` holds all hex values; `vscode/src/vscode-mappings.ts` maps those slots to VSCode token names; `vscode/src/build.ts` generates the final `themes/nebula-haze-color-theme.json`. Rider files move to `rider/`, shared utilities to `tools/`.

**Tech Stack:** TypeScript, ts-node, pnpm (vscode/), archiver + node (rider/), Python (contrast audit)

---

## File Map

| Action | Path |
|---|---|
| Create | `shared/palette.ts` |
| Create | `vscode/package.json` |
| Create | `vscode/tsconfig.json` |
| Create | `vscode/.vscodeignore` |
| Create | `vscode/themes/` (directory) |
| Create | `vscode/src/build.ts` |
| Create | `vscode/src/vscode-mappings.ts` |
| Create (generated) | `vscode/themes/nebula-haze-color-theme.json` |
| Move | `nebula-haze.xml` → `rider/nebula-haze.xml` |
| Move | `nebula-haze.theme.json` → `rider/nebula-haze.theme.json` |
| Move | `META-INF/` → `rider/META-INF/` |
| Move | `preview.html` → `rider/preview.html` |
| Move | `swatch.html` → `rider/swatch.html` |
| Move | `build.js` → `rider/build.js` |
| Move | `release.sh` → `rider/release.sh` |
| Move | `releases/` → `rider/releases/` |
| Move | `package.json` → `rider/package.json` |
| Move | `pnpm-lock.yaml` → `rider/pnpm-lock.yaml` |
| Move | `package-lock.json` → `rider/package-lock.json` |
| Move | `audit-contrast.py` → `tools/audit-contrast.py` |
| Delete | `node_modules/` at root (reinstall in `rider/`) |
| Delete | `nebula-approaches.html` (brainstorm artifact) |

---

## Task 1: Restructure repo into platform folders

**Files:** All moves listed in the file map above.

- [ ] **Step 1: Create new directories**

```powershell
New-Item -ItemType Directory -Path "E:\repos\nebula-haze\rider" -Force
New-Item -ItemType Directory -Path "E:\repos\nebula-haze\shared" -Force
New-Item -ItemType Directory -Path "E:\repos\nebula-haze\tools" -Force
```

- [ ] **Step 2: Move Rider files (preserves git history)**

```powershell
cd E:\repos\nebula-haze
git mv nebula-haze.xml rider/nebula-haze.xml
git mv "nebula-haze.theme.json" "rider/nebula-haze.theme.json"
git mv META-INF rider/META-INF
git mv preview.html rider/preview.html
git mv swatch.html rider/swatch.html
git mv build.js rider/build.js
git mv release.sh rider/release.sh
git mv releases rider/releases
git mv package.json rider/package.json
git mv audit-contrast.py tools/audit-contrast.py
```

- [ ] **Step 3: Move lock files (untracked — plain move)**

```powershell
Move-Item pnpm-lock.yaml rider/pnpm-lock.yaml -ErrorAction SilentlyContinue
Move-Item package-lock.json rider/package-lock.json -ErrorAction SilentlyContinue
```

- [ ] **Step 4: Delete root node_modules and brainstorm artifact**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item nebula-approaches.html -ErrorAction SilentlyContinue
```

- [ ] **Step 5: Reinstall Rider dependencies**

```powershell
cd rider
pnpm install
cd ..
```

- [ ] **Step 6: Verify Rider build still works**

```powershell
cd rider
pnpm build
```

Expected: produces a `.jar` in `rider/releases/` with no errors.

- [ ] **Step 7: Commit restructure**

```powershell
cd E:\repos\nebula-haze
git add -A
git commit -m "refactor: restructure repo into platform folders (rider/, tools/, shared/)"
```

---

## Task 2: Create `shared/palette.ts`

**Files:**
- Create: `shared/palette.ts`

- [ ] **Step 1: Write palette module**

Create `shared/palette.ts`:

```typescript
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
} as const

export type Palette = typeof palette
```

- [ ] **Step 2: Commit**

```powershell
git add shared/palette.ts
git commit -m "feat(shared): add palette.ts — machine-readable source of truth"
```

---

## Task 3: Scaffold VSCode extension

**Files:**
- Create: `vscode/package.json`
- Create: `vscode/tsconfig.json`
- Create: `vscode/.vscodeignore`
- Create: `vscode/src/` (directory)
- Create: `vscode/themes/` (directory)

- [ ] **Step 1: Create directories**

```powershell
New-Item -ItemType Directory -Path "E:\repos\nebula-haze\vscode\src" -Force
New-Item -ItemType Directory -Path "E:\repos\nebula-haze\vscode\themes" -Force
```

- [ ] **Step 2: Create `vscode/package.json`**

```json
{
  "name": "nebula-haze",
  "displayName": "Nebula Haze",
  "description": "A cool-toned dark theme with violet, teal, and blue — ported from JetBrains Rider",
  "version": "0.1.0",
  "publisher": "nebula-haze",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Themes"],
  "contributes": {
    "themes": [
      {
        "label": "Nebula Haze",
        "uiTheme": "vs-dark",
        "path": "./themes/nebula-haze-color-theme.json"
      }
    ]
  },
  "scripts": {
    "build": "ts-node src/build.ts"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 3: Create `vscode/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "rootDir": "."
  },
  "include": ["src/**/*", "../shared/**/*"]
}
```

- [ ] **Step 4: Create `vscode/.vscodeignore`**

```
src/
tsconfig.json
.vscodeignore
node_modules/
```

- [ ] **Step 5: Install dependencies**

```powershell
cd E:\repos\nebula-haze\vscode
pnpm install
```

- [ ] **Step 6: Commit scaffold**

```powershell
cd E:\repos\nebula-haze
git add vscode/
git commit -m "feat(vscode): scaffold extension structure with package.json and tsconfig"
```

---

## Task 4: Create build script

**Files:**
- Create: `vscode/src/build.ts`

- [ ] **Step 1: Create `vscode/src/build.ts`**

```typescript
import { workbench, semanticTokenColors, tokenColors } from './vscode-mappings'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const theme = {
  name: 'Nebula Haze',
  type: 'dark' as const,
  semanticHighlighting: true,
  colors: workbench,
  semanticTokenColors,
  tokenColors,
}

const outDir  = join(__dirname, '..', 'themes')
const outPath = join(outDir, 'nebula-haze-color-theme.json')
mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, JSON.stringify(theme, null, 2))
console.log(`Generated ${outPath}`)
```

- [ ] **Step 2: Verify TypeScript compiles (no vscode-mappings yet — expect an error about missing module, that's fine)**

```powershell
cd E:\repos\nebula-haze\vscode
npx tsc --noEmit 2>&1 | Select-String "error"
```

Expected: one error about `./vscode-mappings` not found. No other errors.

- [ ] **Step 3: Commit**

```powershell
cd E:\repos\nebula-haze
git add vscode/src/build.ts
git commit -m "feat(vscode): add build script — generates theme JSON from mappings"
```

---

## Task 5: Create workbench color mappings

**Files:**
- Create: `vscode/src/vscode-mappings.ts` (workbench section)

This is the largest task. Create the file with the full `workbench` export covering all UI chrome colors.

- [ ] **Step 1: Create `vscode/src/vscode-mappings.ts` with the workbench section**

```typescript
import { palette as p } from '../../shared/palette'

// ── Workbench UI colors ───────────────────────────────────────────────
export const workbench: Record<string, string> = {

  // ── Core editor ──────────────────────────────────────────────────────
  'editor.background':                        p.vscode.bg,
  'editor.foreground':                        p.base.text,
  'editor.lineHighlightBackground':           p.vscode.caretRow,
  'editor.lineHighlightBorder':               '#00000000',
  'editor.selectionBackground':               p.ui.selection,
  'editor.inactiveSelectionBackground':       p.ui.selection + '80',
  'editor.selectionHighlightBackground':      p.ui.selection + '50',
  'editor.wordHighlightBackground':           p.blue.mid + '20',
  'editor.wordHighlightStrongBackground':     p.blue.mid + '40',
  'editor.findMatchBackground':               p.violet.mid + '40',
  'editor.findMatchHighlightBackground':      p.sand.mid + '30',
  'editor.findMatchBorder':                   p.violet.mid,
  'editor.findRangeHighlightBackground':      p.ui.selection + '40',
  'editor.rangeHighlightBackground':          p.blue.mid + '10',
  'editor.symbolHighlightBackground':         p.blue.mid + '20',

  // ── Cursor & line numbers ─────────────────────────────────────────────
  'editorCursor.foreground':                  p.base.text,
  'editorCursor.background':                  p.vscode.bg,
  'editorLineNumber.foreground':              p.base.inlayHint,
  'editorLineNumber.activeForeground':        p.base.chromeMid,

  // ── Whitespace & indent guides ────────────────────────────────────────
  'editorWhitespace.foreground':              p.base.inlayHint,
  'editorIndentGuide.background1':            p.base.chromeDim,
  'editorIndentGuide.activeBackground1':      p.blue.bright,
  'editorRuler.foreground':                   p.base.chromeDim,

  // ── Bracket pair colorization (mid slots) ─────────────────────────────
  'editorBracketHighlight.foreground1':       p.blue.mid,
  'editorBracketHighlight.foreground2':       p.violet.mid,
  'editorBracketHighlight.foreground3':       p.teal.mid,
  'editorBracketHighlight.foreground4':       p.green.mid,
  'editorBracketHighlight.foreground5':       p.sand.mid,
  'editorBracketHighlight.foreground6':       p.orange,
  'editorBracketHighlight.unexpectedBracket.foreground': p.diag.error,
  // Bracket pair guides — dim slots, 22% opacity inactive (38), 60% active (99)
  'editorBracketPairGuide.background1':       p.blue.dim   + '38',
  'editorBracketPairGuide.background2':       p.violet.dim + '38',
  'editorBracketPairGuide.background3':       p.teal.mid   + '38',
  'editorBracketPairGuide.background4':       p.green.dim  + '38',
  'editorBracketPairGuide.background5':       p.sand.dim   + '38',
  'editorBracketPairGuide.background6':       p.orange     + '38',
  'editorBracketPairGuide.activeBackground1': p.blue.dim   + '99',
  'editorBracketPairGuide.activeBackground2': p.violet.dim + '99',
  'editorBracketPairGuide.activeBackground3': p.teal.mid   + '99',
  'editorBracketPairGuide.activeBackground4': p.green.dim  + '99',
  'editorBracketPairGuide.activeBackground5': p.sand.dim   + '99',
  'editorBracketPairGuide.activeBackground6': p.orange     + '99',
  'editorBracketMatch.background':            p.ui.selection + '40',
  'editorBracketMatch.border':                p.violet.mid,

  // ── Diagnostics ────────────────────────────────────────────────────────
  'editorError.foreground':                   p.diag.error,
  'editorError.border':                       '#00000000',
  'editorWarning.foreground':                 p.diag.warning,
  'editorWarning.border':                     '#00000000',
  'editorInfo.foreground':                    p.blue.mid,
  'editorHint.foreground':                    p.teal.mid,
  'editorUnnecessaryCode.opacity':            '#000000aa',

  // ── Gutter (VCS change indicators) ────────────────────────────────────
  'editorGutter.background':                  p.vscode.bg,
  'editorGutter.addedBackground':             p.vcs.added,
  'editorGutter.modifiedBackground':          p.vcs.modified,
  'editorGutter.deletedBackground':           p.vcs.deleted,
  'editorGutter.commentRangeForeground':      p.base.chromeMid,

  // ── Inlay hints ─────────────────────────────────────────────────────────
  'editorInlayHint.foreground':               p.base.inlayHint,
  'editorInlayHint.background':               '#00000000',
  'editorInlayHint.typeForeground':           p.base.inlayHint,
  'editorInlayHint.parameterForeground':      p.base.inlayHint,

  // ── Code lens ──────────────────────────────────────────────────────────
  'editorCodeLens.foreground':                p.base.inlayHint,

  // ── Sticky scroll ─────────────────────────────────────────────────────
  'editorStickyScroll.background':            p.vscode.titleBar,
  'editorStickyScrollHover.background':       '#1a1d30',

  // ── Overview ruler ────────────────────────────────────────────────────
  'editorOverviewRuler.border':               p.base.chromeDim,
  'editorOverviewRuler.addedForeground':      p.vcs.added,
  'editorOverviewRuler.modifiedForeground':   p.vcs.modified,
  'editorOverviewRuler.deletedForeground':    p.vcs.deleted,
  'editorOverviewRuler.errorForeground':      p.diag.error,
  'editorOverviewRuler.warningForeground':    p.diag.warning,
  'editorOverviewRuler.infoForeground':       p.blue.mid,
  'editorOverviewRuler.findMatchForeground':        p.violet.mid + '80',
  'editorOverviewRuler.selectionHighlightForeground': p.ui.selection,
  'editorOverviewRuler.wordHighlightForeground':    p.blue.mid + '80',
  'editorOverviewRuler.bracketMatchForeground':     p.violet.mid,

  // ── Widgets (hover, suggest, peek) ────────────────────────────────────
  'editorWidget.background':                  p.ui.popupBg,
  'editorWidget.foreground':                  p.base.text,
  'editorWidget.border':                      p.base.chromeMid,
  'editorWidget.resizeBorder':                p.violet.mid,
  'editorSuggestWidget.background':           p.ui.popupBg,
  'editorSuggestWidget.foreground':           p.base.text,
  'editorSuggestWidget.border':               p.base.chromeMid,
  'editorSuggestWidget.highlightForeground':        p.violet.mid,
  'editorSuggestWidget.focusHighlightForeground':   p.violet.bright,
  'editorSuggestWidget.selectedBackground':         p.ui.selection,
  'editorSuggestWidget.selectedForeground':         p.base.text,
  'editorSuggestWidgetStatus.foreground':           p.base.inlayHint,
  'editorHoverWidget.background':             p.ui.popupBg,
  'editorHoverWidget.foreground':             p.base.text,
  'editorHoverWidget.border':                 p.base.chromeMid,
  'editorHoverWidget.statusBarBackground':    p.vscode.titleBar,
  'peekView.border':                          p.violet.mid,
  'peekViewEditor.background':               p.ui.popupBg,
  'peekViewEditor.matchHighlightBackground': p.violet.mid + '40',
  'peekViewEditorGutter.background':         p.ui.popupBg,
  'peekViewResult.background':               p.vscode.tabBar,
  'peekViewResult.fileForeground':           p.base.text,
  'peekViewResult.lineForeground':           p.blue.mid,
  'peekViewResult.matchHighlightBackground': p.violet.mid + '40',
  'peekViewResult.selectionBackground':      p.ui.selection,
  'peekViewResult.selectionForeground':      p.base.text,
  'peekViewTitle.background':                p.ui.popupBg,
  'peekViewTitleDescription.foreground':     p.base.inlayHint,
  'peekViewTitleLabel.foreground':           p.base.text,

  // ── Editor groups (split panes) ───────────────────────────────────────
  'editorGroup.border':                       p.base.chromeDim,
  'editorGroup.focusedEmptyBorder':           p.violet.mid,
  'editorGroup.dropBackground':               p.ui.selection + '40',
  'editorGroupHeader.tabsBackground':         p.vscode.tabBar,
  'editorGroupHeader.tabsBorder':             p.base.chromeDim,
  'editorGroupHeader.noTabsBackground':       p.vscode.bg,

  // ── Tabs ──────────────────────────────────────────────────────────────
  'tab.activeBackground':                     p.vscode.bg,
  'tab.activeForeground':                     p.base.text,
  'tab.activeBorder':                         '#00000000',
  'tab.activeBorderTop':                      p.violet.mid,
  'tab.inactiveBackground':                   p.vscode.tabBar,
  'tab.inactiveForeground':                   p.base.inlayHint,
  'tab.border':                               p.base.chromeDim,
  'tab.hoverBackground':                      p.vscode.bg,
  'tab.hoverForeground':                      p.base.text,
  'tab.unfocusedActiveBackground':            p.vscode.bg,
  'tab.unfocusedActiveForeground':            '#8f96b3',
  'tab.unfocusedActiveBorderTop':             p.base.chromeMid,
  'tab.unfocusedInactiveBackground':          p.vscode.tabBar,
  'tab.unfocusedInactiveForeground':          p.base.chromeMid,
  'tab.lastPinnedBorder':                     p.base.chromeMid,

  // ── Activity bar (left icon rail) ─────────────────────────────────────
  'activityBar.background':                   p.vscode.titleBar,
  'activityBar.foreground':                   p.base.text,
  'activityBar.inactiveForeground':           p.base.chromeMid,
  'activityBar.border':                       p.base.chromeDim,
  'activityBar.activeBorder':                 p.violet.mid,
  'activityBar.activeBackground':             p.ui.selection + '40',
  'activityBarBadge.background':              p.violet.mid,
  'activityBarBadge.foreground':              p.vscode.bg,

  // ── Sidebar ────────────────────────────────────────────────────────────
  'sideBar.background':                       '#1a1d2e',
  'sideBar.foreground':                       p.base.text,
  'sideBar.border':                           p.base.chromeDim,
  'sideBarTitle.foreground':                  p.base.inlayHint,
  'sideBarSectionHeader.background':          '#1a1d2e',
  'sideBarSectionHeader.foreground':          p.base.text,
  'sideBarSectionHeader.border':              p.base.chromeDim,

  // ── Lists ──────────────────────────────────────────────────────────────
  'list.activeSelectionBackground':           p.ui.selection,
  'list.activeSelectionForeground':           p.base.text,
  'list.inactiveSelectionBackground':         p.base.chromeDim,
  'list.inactiveSelectionForeground':         p.base.text,
  'list.hoverBackground':                     p.base.chromeDim + '60',
  'list.hoverForeground':                     p.base.text,
  'list.focusBackground':                     p.ui.selection,
  'list.focusForeground':                     p.base.text,
  'list.focusOutline':                        p.violet.mid,
  'list.highlightForeground':                 p.violet.mid,
  'list.dropBackground':                      p.ui.selection + '40',
  'list.errorForeground':                     p.diag.error,
  'list.warningForeground':                   p.diag.warning,
  'list.deemphasizedForeground':              p.base.inlayHint,
  'listFilterWidget.background':              p.ui.popupBg,
  'listFilterWidget.outline':                 p.violet.mid,
  'listFilterWidget.noMatchesOutline':        p.diag.error,

  // ── Status bar ────────────────────────────────────────────────────────
  'statusBar.background':                     p.ui.selection,
  'statusBar.foreground':                     p.base.text,
  'statusBar.border':                         '#00000000',
  'statusBar.noFolderBackground':             p.base.chromeDim,
  'statusBar.noFolderForeground':             p.base.text,
  'statusBar.debuggingBackground':            p.orange,
  'statusBar.debuggingForeground':            p.vscode.bg,
  'statusBarItem.remoteBackground':           p.teal.mid,
  'statusBarItem.remoteForeground':           p.vscode.bg,
  'statusBarItem.hoverBackground':            '#ffffff20',
  'statusBarItem.activeBackground':           '#ffffff30',

  // ── Title bar ─────────────────────────────────────────────────────────
  'titleBar.activeBackground':                p.vscode.titleBar,
  'titleBar.activeForeground':                p.base.text,
  'titleBar.inactiveBackground':              p.vscode.titleBar,
  'titleBar.inactiveForeground':              p.base.inlayHint,
  'titleBar.border':                          p.base.chromeDim,

  // ── Input ─────────────────────────────────────────────────────────────
  'input.background':                         p.base.chromeDim,
  'input.foreground':                         p.base.text,
  'input.border':                             p.base.chromeMid,
  'input.placeholderForeground':              p.base.inlayHint,
  'inputOption.activeBackground':             p.ui.selection,
  'inputOption.activeForeground':             p.base.text,
  'inputOption.activeBorder':                 p.violet.mid,
  'inputValidation.errorBackground':          p.diag.error + '40',
  'inputValidation.errorBorder':              p.diag.error,
  'inputValidation.warningBackground':        p.diag.warning + '40',
  'inputValidation.warningBorder':            p.diag.warning,
  'inputValidation.infoBackground':           p.blue.mid + '40',
  'inputValidation.infoBorder':               p.blue.mid,

  // ── Dropdown / button / checkbox ──────────────────────────────────────
  'dropdown.background':                      p.base.chromeDim,
  'dropdown.foreground':                      p.base.text,
  'dropdown.border':                          p.base.chromeMid,
  'dropdown.listBackground':                  p.ui.popupBg,
  'button.background':                        p.violet.mid,
  'button.foreground':                        p.vscode.bg,
  'button.hoverBackground':                   p.violet.bright,
  'button.secondaryBackground':               p.ui.selection,
  'button.secondaryForeground':               p.base.text,
  'button.secondaryHoverBackground':          p.base.chromeMid,
  'checkbox.background':                      p.base.chromeDim,
  'checkbox.foreground':                      p.base.text,
  'checkbox.border':                          p.base.chromeMid,

  // ── Scrollbar ─────────────────────────────────────────────────────────
  'scrollbar.shadow':                         '#00000040',
  'scrollbarSlider.background':               p.blue.dim + '40',
  'scrollbarSlider.hoverBackground':          p.blue.bright + '80',
  'scrollbarSlider.activeBackground':         p.blue.bright,

  // ── Notifications ─────────────────────────────────────────────────────
  'notifications.background':                 '#1e2138',
  'notifications.foreground':                 p.base.text,
  'notifications.border':                     p.base.chromeMid,
  'notificationsErrorIcon.foreground':        p.diag.error,
  'notificationsWarningIcon.foreground':      p.diag.warning,
  'notificationsInfoIcon.foreground':         p.blue.mid,

  // ── Panel (terminal/output/problems at bottom) ────────────────────────
  'panel.background':                         p.vscode.bg,
  'panel.border':                             p.base.chromeMid,
  'panelTitle.activeBorder':                  p.violet.mid,
  'panelTitle.activeForeground':              p.base.text,
  'panelTitle.inactiveForeground':            p.base.inlayHint,
  'panelSectionHeader.background':            p.vscode.tabBar,
  'panelSectionHeader.foreground':            p.base.text,

  // ── Terminal ──────────────────────────────────────────────────────────
  'terminal.background':                      p.vscode.bg,
  'terminal.foreground':                      p.base.text,
  'terminal.selectionBackground':             p.ui.selection,
  'terminal.inactiveSelectionBackground':     p.ui.selection + '80',
  'terminal.border':                          p.base.chromeMid,
  'terminal.tab.activeBorder':                p.violet.mid,
  'terminalCursor.foreground':                p.base.text,
  'terminalCursor.background':                p.vscode.bg,
  // ANSI colors (bright = dim family slot)
  'terminal.ansiBlack':                       p.base.chromeDim,
  'terminal.ansiBrightBlack':                 p.base.chromeMid,
  'terminal.ansiRed':                         p.diag.error,
  'terminal.ansiBrightRed':                   p.diag.error,
  'terminal.ansiGreen':                       p.green.mid,
  'terminal.ansiBrightGreen':                 p.green.bright,
  'terminal.ansiYellow':                      p.sand.mid,
  'terminal.ansiBrightYellow':                p.sand.bright,
  'terminal.ansiBlue':                        p.blue.mid,
  'terminal.ansiBrightBlue':                  p.blue.bright,
  'terminal.ansiMagenta':                     p.violet.mid,
  'terminal.ansiBrightMagenta':               p.violet.bright,
  'terminal.ansiCyan':                        p.teal.mid,
  'terminal.ansiBrightCyan':                  p.teal.bright,
  'terminal.ansiWhite':                       p.base.text,
  'terminal.ansiBrightWhite':                 '#ffffff',

  // ── Git decorations ────────────────────────────────────────────────────
  'gitDecoration.addedResourceForeground':        p.vcs.added,
  'gitDecoration.modifiedResourceForeground':     p.vcs.modified,
  'gitDecoration.deletedResourceForeground':      p.vcs.deleted,
  'gitDecoration.renamedResourceForeground':      p.teal.mid,
  'gitDecoration.untrackedResourceForeground':    p.green.bright,
  'gitDecoration.ignoredResourceForeground':      p.base.chromeMid,
  'gitDecoration.conflictingResourceForeground':  p.orange,
  'gitDecoration.stageModifiedResourceForeground': p.vcs.modified,
  'gitDecoration.stageDeletedResourceForeground':  p.vcs.deleted,
  'submoduleResourceForeground':                  p.blue.mid,

  // ── Minimap ────────────────────────────────────────────────────────────
  'minimap.findMatchHighlight':               p.violet.mid + '80',
  'minimap.selectionHighlight':               p.ui.selection,
  'minimap.errorHighlight':                   p.diag.error,
  'minimap.warningHighlight':                 p.diag.warning,
  'minimapGutter.addedBackground':            p.vcs.added,
  'minimapGutter.modifiedBackground':         p.vcs.modified,
  'minimapGutter.deletedBackground':          p.vcs.deleted,
  'minimapSlider.background':                 p.blue.dim + '20',
  'minimapSlider.hoverBackground':            p.blue.dim + '40',
  'minimapSlider.activeBackground':           p.blue.dim + '60',

  // ── Diff editor ────────────────────────────────────────────────────────
  'diffEditor.insertedTextBackground':        p.vcs.added + '20',
  'diffEditor.removedTextBackground':         p.vcs.deleted + '20',
  'diffEditor.insertedLineBackground':        p.vcs.added + '15',
  'diffEditor.removedLineBackground':         p.vcs.deleted + '15',
  'diffEditor.diagonalFill':                  p.base.chromeMid,
  'diffEditorGutter.insertedLineBackground':  p.vcs.added + '40',
  'diffEditorGutter.removedLineBackground':   p.vcs.deleted + '40',

  // ── Breadcrumbs ────────────────────────────────────────────────────────
  'breadcrumb.foreground':                    p.base.inlayHint,
  'breadcrumb.background':                    p.vscode.bg,
  'breadcrumb.focusForeground':               p.base.text,
  'breadcrumb.activeSelectionForeground':     p.base.text,
  'breadcrumbPicker.background':              p.ui.popupBg,

  // ── Quick input / command palette ─────────────────────────────────────
  'quickInput.background':                    p.ui.popupBg,
  'quickInput.foreground':                    p.base.text,
  'quickInputTitle.background':               p.vscode.tabBar,
  'quickInputList.focusBackground':           p.ui.selection,
  'quickInputList.focusForeground':           p.base.text,
  'quickInputList.focusIconForeground':       p.violet.mid,

  // ── Menu ──────────────────────────────────────────────────────────────
  'menu.background':                          p.ui.popupBg,
  'menu.foreground':                          p.base.text,
  'menu.selectionBackground':                 p.ui.selection,
  'menu.selectionForeground':                 p.base.text,
  'menu.separatorBackground':                 p.base.chromeMid,
  'menu.border':                              p.base.chromeMid,
  'menubar.selectionBackground':              p.ui.selection,
  'menubar.selectionForeground':              p.base.text,

  // ── Badge / progress ──────────────────────────────────────────────────
  'badge.background':                         p.violet.mid,
  'badge.foreground':                         p.vscode.bg,
  'progressBar.background':                   p.violet.mid,

  // ── Symbol icons ──────────────────────────────────────────────────────
  'symbolIcon.classForeground':               p.violet.bright,
  'symbolIcon.constantForeground':            p.teal.mid,
  'symbolIcon.constructorForeground':         p.blue.mid,
  'symbolIcon.enumeratorForeground':          p.teal.mid,
  'symbolIcon.enumeratorMemberForeground':    p.teal.mid,
  'symbolIcon.functionForeground':            p.blue.mid,
  'symbolIcon.interfaceForeground':           p.green.mid,
  'symbolIcon.keywordForeground':             p.violet.mid,
  'symbolIcon.methodForeground':              p.blue.mid,
  'symbolIcon.moduleForeground':              p.base.text,
  'symbolIcon.namespaceForeground':           p.violet.bright,
  'symbolIcon.numberForeground':              p.sand.mid,
  'symbolIcon.operatorForeground':            p.orange,
  'symbolIcon.propertyForeground':            p.teal.bright,
  'symbolIcon.stringForeground':              p.green.bright,
  'symbolIcon.structForeground':              p.teal.mid,
  'symbolIcon.typeParameterForeground':       p.violet.whisper,
  'symbolIcon.variableForeground':            p.base.text,

  // ── Miscellaneous ─────────────────────────────────────────────────────
  'tree.indentGuidesStroke':                  p.base.chromeDim,
  'focusBorder':                              p.violet.mid + '80',
  'widget.shadow':                            '#00000060',
  'selection.background':                     p.ui.selection,
  'descriptionForeground':                   p.base.inlayHint,
  'errorForeground':                          p.diag.error,
  'icon.foreground':                          p.base.text,
}

// Semantic and tokenColors will be added in Task 6
export const semanticTokenColors: Record<string, { foreground: string; fontStyle?: string }> = {}
export const tokenColors: object[] = []
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```powershell
cd E:\repos\nebula-haze\vscode
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
cd E:\repos\nebula-haze
git add vscode/src/vscode-mappings.ts
git commit -m "feat(vscode): add workbench color mappings (~170 UI color slots)"
```

---

## Task 6: Add semantic token and TextMate scope mappings

**Files:**
- Modify: `vscode/src/vscode-mappings.ts` — replace the empty `semanticTokenColors` and `tokenColors` exports

- [ ] **Step 1: Replace the empty exports at the bottom of `vscode/src/vscode-mappings.ts`**

Remove the two placeholder lines at the bottom and replace with:

```typescript
// ── Semantic token colors ─────────────────────────────────────────────
// Designed first (most accurate, like Rider's language server).
// TextMate scopes below are aligned to match — minimises load-time flash.
export const semanticTokenColors: Record<string, { foreground: string; fontStyle?: string }> = {
  'variable':                   { foreground: p.base.text },
  'variable.readonly':          { foreground: p.teal.mid },
  'variable.readonly.global':   { foreground: p.teal.mid },
  'parameter':                  { foreground: p.teal.whisper },
  'property':                   { foreground: p.teal.bright },
  'property.readonly':          { foreground: p.teal.mid },
  'function':                   { foreground: p.blue.mid },
  'function.defaultLibrary':    { foreground: p.blue.mid },
  'method':                     { foreground: p.blue.mid },
  'method.defaultLibrary':      { foreground: p.blue.mid },
  'keyword':                    { foreground: p.violet.mid },
  'modifier':                   { foreground: p.violet.mid },
  'type':                       { foreground: p.violet.bright },
  'type.defaultLibrary':        { foreground: p.violet.bright },
  'class':                      { foreground: p.violet.bright },
  'class.defaultLibrary':       { foreground: p.violet.bright },
  'interface':                  { foreground: p.green.mid },
  'enum':                       { foreground: p.teal.mid },
  'enumMember':                 { foreground: p.teal.mid },
  'struct':                     { foreground: p.teal.mid },
  'typeParameter':              { foreground: p.violet.whisper },
  'namespace':                  { foreground: p.violet.bright },
  'decorator':                  { foreground: p.blue.bright },
  'annotation':                 { foreground: p.blue.bright },
  'string':                     { foreground: p.green.bright },
  'number':                     { foreground: p.sand.mid },
  'regexp':                     { foreground: p.green.bright },
  'operator':                   { foreground: p.orange },
  'comment':                    { foreground: p.base.comment, fontStyle: 'italic' },
  'comment.documentation':      { foreground: p.base.comment, fontStyle: 'italic' },
  'macro':                      { foreground: p.violet.mid },
  'label':                      { foreground: p.blue.mid },
  'boolean':                    { foreground: p.sand.mid },
  'builtinType':                { foreground: p.violet.bright },
  'escapeSequence':             { foreground: p.teal.bright },
  'formatSpecifier':            { foreground: p.teal.bright },
  'selfKeyword':                { foreground: p.violet.mid },
  'lifetime':                   { foreground: p.violet.mid },
}

// ── TextMate token colors ────────────────────────────────────────────
// Matched to semantic output above — same colour = invisible transition on load.
export const tokenColors = [
  // Comments
  { scope: ['comment', 'punctuation.definition.comment', 'comment.block.documentation'],
    settings: { foreground: '#606480', fontStyle: 'italic' } },

  // Keywords, storage
  { scope: ['keyword', 'keyword.control', 'keyword.other', 'storage.type', 'storage.modifier',
            'keyword.operator.new', 'keyword.operator.delete', 'keyword.other.unit'],
    settings: { foreground: '#c498ff' } },

  // Types and classes
  { scope: ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class',
            'support.class', 'support.type', 'entity.name.type.class', 'entity.name.namespace'],
    settings: { foreground: '#dbbeff' } },

  // Interfaces
  { scope: 'entity.name.type.interface',
    settings: { foreground: '#96cc9e' } },

  // Functions and methods
  { scope: ['entity.name.function', 'support.function', 'entity.name.method',
            'meta.function-call entity.name.function'],
    settings: { foreground: '#8aabe6' } },

  // Parameters
  { scope: ['variable.parameter', 'meta.function.parameters variable'],
    settings: { foreground: '#bdd8e8' } },

  // Variables (plain)
  { scope: ['variable', 'variable.other', 'variable.other.readwrite'],
    settings: { foreground: '#c0caf5' } },

  // Constants and enum members
  { scope: ['variable.other.constant', 'variable.other.enummember'],
    settings: { foreground: '#6ec4b6' } },

  // Properties / object members
  { scope: ['variable.other.property', 'support.variable.property', 'meta.property.object'],
    settings: { foreground: '#8fd4c8' } },

  // Strings
  { scope: ['string', 'string.quoted', 'string.template', 'string.unquoted'],
    settings: { foreground: '#88dda0' } },
  { scope: ['punctuation.definition.string.begin', 'punctuation.definition.string.end'],
    settings: { foreground: '#88dda0' } },
  { scope: ['string.regexp', 'constant.regexp'],
    settings: { foreground: '#88dda0' } },
  { scope: ['constant.character.escape', 'constant.other.placeholder'],
    settings: { foreground: '#8fd4c8' } },

  // Template literal expressions
  { scope: ['punctuation.definition.template-expression', 'punctuation.section.embedded'],
    settings: { foreground: '#8fd4c8' } },

  // Numbers, booleans, null, undefined
  { scope: ['constant.numeric', 'constant.language.boolean', 'constant.language.null',
            'constant.language.undefined', 'constant.language', 'constant.other'],
    settings: { foreground: '#c5c28a' } },

  // Operators and punctuation
  { scope: ['keyword.operator', 'punctuation.accessor', 'punctuation.separator',
            'punctuation.terminator', 'punctuation.definition.block', 'meta.brace'],
    settings: { foreground: '#e09a68' } },

  // Type parameters / generics
  { scope: ['variable.type.parameter', 'entity.name.type.parameter'],
    settings: { foreground: '#c2c0e8' } },

  // Decorators / annotations
  { scope: ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator',
            'meta.annotation', 'storage.type.annotation'],
    settings: { foreground: '#a5bcf0' } },

  // ── CSS ────────────────────────────────────────────────────────────────
  { scope: 'support.type.property-name.css',
    settings: { foreground: '#8aabe6' } },
  { scope: ['meta.property-value.css', 'support.constant.property-value.css'],
    settings: { foreground: '#88dda0' } },
  { scope: 'entity.other.attribute-name.class.css',
    settings: { foreground: '#8fd4c8' } },
  { scope: 'entity.other.attribute-name.id.css',
    settings: { foreground: '#a5bcf0' } },
  { scope: 'entity.name.tag.css',
    settings: { foreground: '#dbbeff' } },

  // ── HTML / JSX / Vue ──────────────────────────────────────────────────
  { scope: ['entity.name.tag', 'meta.tag.sgml'],
    settings: { foreground: '#dbbeff' } },
  { scope: ['entity.other.attribute-name', 'meta.tag.attributes'],
    settings: { foreground: '#8fd4c8' } },
  { scope: ['punctuation.definition.tag', 'punctuation.definition.tag.begin',
            'punctuation.definition.tag.end'],
    settings: { foreground: '#e09a68' } },

  // ── JSON ──────────────────────────────────────────────────────────────
  { scope: 'support.type.property-name.json',
    settings: { foreground: '#8aabe6' } },

  // ── YAML ──────────────────────────────────────────────────────────────
  { scope: 'entity.name.tag.yaml',
    settings: { foreground: '#8aabe6' } },
  { scope: 'string.unquoted.plain.in.yaml',
    settings: { foreground: '#88dda0' } },

  // ── Markdown ──────────────────────────────────────────────────────────
  { scope: ['markup.heading', 'entity.name.section.markdown', 'punctuation.definition.heading'],
    settings: { foreground: '#c498ff', fontStyle: 'bold' } },
  { scope: 'markup.bold',
    settings: { foreground: '#c0caf5', fontStyle: 'bold' } },
  { scope: 'markup.italic',
    settings: { foreground: '#c0caf5', fontStyle: 'italic' } },
  { scope: ['markup.inline.raw', 'markup.fenced_code.block'],
    settings: { foreground: '#8fd4c8' } },
  { scope: 'punctuation.definition.list.begin.markdown',
    settings: { foreground: '#e09a68' } },
  { scope: 'markup.quote',
    settings: { foreground: '#606480', fontStyle: 'italic' } },
  { scope: ['markup.underline.link', 'meta.link.inline markup.underline.link'],
    settings: { foreground: '#a5bcf0' } },

  // ── Dart ──────────────────────────────────────────────────────────────
  { scope: 'keyword.declaration.dart',
    settings: { foreground: '#c498ff' } },
  { scope: ['entity.name.type.dart', 'support.class.dart'],
    settings: { foreground: '#dbbeff' } },

  // ── C# ────────────────────────────────────────────────────────────────
  { scope: ['keyword.other.using.cs', 'keyword.other.namespace.cs'],
    settings: { foreground: '#c498ff' } },
  { scope: 'entity.name.type.cs',
    settings: { foreground: '#dbbeff' } },

  // ── Vue ───────────────────────────────────────────────────────────────
  { scope: 'entity.other.attribute-name.vue',
    settings: { foreground: '#8fd4c8' } },

  // ── Invalid ───────────────────────────────────────────────────────────
  { scope: 'invalid',
    settings: { foreground: '#e07891', fontStyle: 'underline' } },
  { scope: 'invalid.deprecated',
    settings: { foreground: '#c9a55a', fontStyle: 'underline' } },
]
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```powershell
cd E:\repos\nebula-haze\vscode
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
cd E:\repos\nebula-haze
git add vscode/src/vscode-mappings.ts
git commit -m "feat(vscode): add semantic token and TextMate scope mappings"
```

---

## Task 7: Generate theme JSON and run contrast audit

**Files:**
- Create (generated): `vscode/themes/nebula-haze-color-theme.json`

- [ ] **Step 1: Run the build**

```powershell
cd E:\repos\nebula-haze\vscode
pnpm build
```

Expected output:
```
Generated E:\repos\nebula-haze\vscode\themes\nebula-haze-color-theme.json
```

- [ ] **Step 2: Validate the JSON is well-formed**

```powershell
Get-Content "E:\repos\nebula-haze\vscode\themes\nebula-haze-color-theme.json" | ConvertFrom-Json | Select-Object name, type, semanticHighlighting
```

Expected:
```
name              type  semanticHighlighting
----              ----  --------------------
Nebula Haze       dark                 True
```

- [ ] **Step 3: Run contrast audit on the VSCode background and foreground**

```powershell
cd E:\repos\nebula-haze
python tools/audit-contrast.py
```

Look for any failures — tokens marked as failing contrast against `#1f2235` (VSCode background). Fix any that fail by nudging to a brighter palette slot.

- [ ] **Step 4: Commit generated theme**

```powershell
cd E:\repos\nebula-haze
git add vscode/themes/nebula-haze-color-theme.json
git commit -m "feat(vscode): generate initial theme JSON from palette mappings"
```

---

## Task 8: Install locally and verify in VSCode

- [ ] **Step 1: Create symlink so VSCode loads the extension**

Run this once in an elevated PowerShell (right-click → Run as Administrator):

```powershell
New-Item -ItemType SymbolicLink `
  -Path "$env:USERPROFILE\.vscode\extensions\nebula-haze" `
  -Target "E:\repos\nebula-haze\vscode"
```

- [ ] **Step 2: Restart VSCode and activate theme**

Open VSCode → `Ctrl+K Ctrl+T` → select **Nebula Haze**.

- [ ] **Step 3: Visual verification checklist**

Open a TypeScript file and verify:

| Element | Expected color |
|---|---|
| Editor background | `#1f2235` (dark blue-grey, calmer than Rider) |
| Keywords (`const`, `return`, `import`) | Violet `#c498ff` |
| Function names | Blue `#8aabe6` |
| Type names / class names | Violet-bright `#dbbeff` |
| String literals | Green `#88dda0` |
| Comments | Muted grey `#606480` italic |
| Parameters | Teal-whisper `#bdd8e8` |
| Active tab border (top) | Violet `#c498ff` |
| Status bar background | Purple `#3c3465` |
| Activity bar background | Dark `#13152a` |

- [ ] **Step 4: Verify Flutter bracket pair guides**

Open a Dart file with nested widgets. Confirm:
- Bracket characters `(`, `)`, `[`, `]` use vivid mid-slot colors cycling blue→violet→teal→green→sand
- Guide lines are dim vertical bars
- The pair your cursor is inside shows a denser guide line

- [ ] **Step 5: Verify semantic highlighting**

Open a TypeScript file and check that local variables (`#c0caf5`) are visually distinct from parameters (`#bdd8e8`) and properties (`#8fd4c8`). If they all look the same, semantic highlighting may not have loaded yet — wait 2–3 seconds after opening.

- [ ] **Step 6: Commit any contrast fixes from visual review**

If you adjusted any colors during visual review:
1. Edit the relevant slot in `vscode/src/vscode-mappings.ts`
2. Run `pnpm build` in `vscode/`
3. Commit:

```powershell
cd E:\repos\nebula-haze
git add vscode/src/vscode-mappings.ts vscode/themes/nebula-haze-color-theme.json
git commit -m "fix(vscode): adjust contrast issues found during visual review"
```

---

## Task 9: Update CLAUDE.md and PALETTE.md references

**Files:**
- Modify: `CLAUDE.md` — update file paths to reflect new folder structure

- [ ] **Step 1: Update `CLAUDE.md`**

Change the existing references from root paths to platform-folder paths:

```markdown
## Color work

**Read `PALETTE.md` first** — it contains the full swatch book, token mappings, and governance rules.

When changing a color:
1. Identify the palette slot (family + level) in `PALETTE.md`
2. Update `shared/palette.ts` (the machine-readable source of truth)
3. Update the token in `rider/nebula-haze.xml`
4. Run `pnpm build` in `vscode/` to regenerate `vscode/themes/nebula-haze-color-theme.json`
5. Update the `Used for` column in `PALETTE.md` if the token mapping changes

## Theme files

- `rider/nebula-haze.xml` — JetBrains/Rider color scheme
- `rider/preview.html` — Rider visual preview
- `vscode/themes/nebula-haze-color-theme.json` — VSCode theme (GENERATED — run `pnpm build` in `vscode/`)
- `vscode/src/vscode-mappings.ts` — VSCode token assignments (edit this, not the JSON)
- `shared/palette.ts` — machine-readable palette (mirrors `PALETTE.md`)
- `tools/audit-contrast.py` — contrast audit utility
```

- [ ] **Step 2: Commit**

```powershell
cd E:\repos\nebula-haze
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for new platform folder structure"
```
