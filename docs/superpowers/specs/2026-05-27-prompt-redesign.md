# Nebula Haze oh-my-posh Prompt — Redesign Spec

**Date:** 2026-05-27  
**Status:** Approved

## Context

The existing prompt (`prompt/nebula-haze.omp.json`) uses a three-line layout with a decorative star/cosmic divider on line 1, path + git branch on line 2, and a `╰❯` cursor on line 3. It provides no git status detail, no runtime context, and carries a "starry universe" aesthetic that the user wants to shift toward modern/futuristic + productivity.

The user primarily works in a **vertical (narrow) terminal** inside JetBrains Rider and VS Code, and develops full-stack web applications with a **C# backend and Node.js/TypeScript frontend**.

---

## Goals

1. Replace the cosmic aesthetic with a clean, modern/futuristic feel.
2. Add p10k-level git status detail without verbosity.
3. Surface Node.js and .NET runtime versions only when inside a relevant project.
4. Design for narrow/vertical terminals — no right-aligned blocks that can overflow or overlap.
5. Keep the prompt fast and uncluttered inside IDEs.

---

## Layout

### Three blocks, two lines in IDE / three lines outside IDE

```
[Block 1 — git]       󰘬 feat/dark-mode ↑1 ↓2 ✱3 ✚2 ?1     ← hidden in IDE
[Block 2 — path pill] nebula-haze/src/styles  ·  ⬡ 20.11 · ● 8.0
[Block 3 — cursor]    ❯
```

Inside Rider or VS Code, Block 1's git segment template returns an empty string. When all segments in a block return empty, oh-my-posh omits the block including its trailing position — so no blank line is produced. **If testing reveals a blank line does appear**, the fallback is to fold the git template into the path block as a leading text segment that emits `\n  󰘬 …\n` or empty string, letting the path block's own `newline: true` handle the sole line break.

Collapses to:

```
[Block 2 — path pill] nebula-haze/src/styles  ·  ● 8.0
[Block 3 — cursor]    ❯
```

---

## Block Specifications

### Block 1 — Git line

| Property | Value |
|----------|-------|
| Type | `prompt`, `alignment: left`, no `newline` |
| Background | transparent |
| Visibility | Hidden inside `JetBrains-JediTerm` and `vscode` terminals |

**Segments:**

- **git** segment, `style: plain`, `background: transparent`, `foreground: #8aabe6`
- Template wraps the entire content in the IDE-detection condition (existing pattern):
  ```
  {{ if and (ne .Env.TERMINAL_EMULATOR "JetBrains-JediTerm") (ne .Env.TERM_PROGRAM "vscode") }}
   󰘬 {{ .HEAD }} ...
  {{ end }}
  ```
- Git status detail (requires `fetch_status: true`):
  - `↑N` ahead — foreground `#7ec8a0`
  - `↓N` behind — foreground `#e07891`
  - `✱N` unstaged — foreground `#e0c97e`
  - `✚N` staged — foreground `#7ec8a0`
  - `?N` untracked — foreground `#606480`
  - Each counter is omitted when its value is 0
- Branch name truncated to 20 chars (existing behaviour, keep)

### Block 2 — Path pill

| Property | Value |
|----------|-------|
| Type | `prompt`, `alignment: left`, `newline: true` |

**Segment sequence:**

1. **Left cap** — text segment, `style: plain`, `background: transparent`  
   Template: `<#6ec4b6></>`  
   (Teal nerd-font rounded left cap, U+E0B6)

2. **Shell icon** — `shell` segment, `style: plain`, `background: #1c1d36`, `foreground: #6ec4b6`

3. **Path** — `path` segment, `style: plain`, `background: #1c1d36`, `foreground: #6ec4b6`  
   Options: `style: agnoster_short`, `folder_separator_icon: /`, `folder_icon: …`, `max_depth: 4`

4. **Node version** — `node` segment, `style: plain`, `background: #1c1d36`, `foreground: #7ec8a0`  
   Template: `  ·  <#606480>⬡</> {{ .Full }}`  
   Only renders when `package.json` is found in the directory tree. The leading `  ·  ` separator is self-contained — no coordination with the .NET segment needed.

5. **.NET version** — `dotnet` segment, `style: plain`, `background: #1c1d36`, `foreground: #8aabe6`  
   Template: `  ·  <#606480>●</> {{ .Full }}`  
   Only renders when a `.csproj`, `.fsproj`, or `global.json` is found. Uses the same self-contained `  ·  ` prefix. Result when both present: `path  ·  ⬡ 20.11  ·  ● 8.0`.

6. **Right cap** — text segment, `style: plain`, `background: transparent`  
   Template: `<#9480c8></>`  
   (Purple nerd-font rounded right cap, U+E0B4)

**Pill background colour:** `#1c1d36` — subtly lifted from the terminal background (`#0d0e1a` in Nebula Haze), enough to be readable as a block without being heavy.

**Asymmetric cap colours:**
- Left cap teal `#6ec4b6` — matches path text, feels like the bar "opens" from the path side
- Right cap purple `#9480c8` — matches the cursor `❯`, creates visual continuity downward

### Block 3 — Cursor

| Property | Value |
|----------|-------|
| Type | `prompt`, `alignment: left`, `newline: true` |

- **status** segment, `style: plain`, `background: transparent`
- Template: `{{ if gt .Code 0 }}<#e07891>❯ {{ .Code }}</>{{ else }}<#9480c8>❯</>{{ end }}`
- `always_enabled: true`

### Transient prompt

```json
{
  "background": "transparent",
  "foreground": "#414868",
  "template": "❯ "
}
```

Previous commands in scrollback collapse to a muted `❯ ` — no path, no git, no pill.

---

## What Is Removed

| Removed | Reason |
|---------|--------|
| Star/cosmic divider line (block 1) | Purely decorative, wrong aesthetic direction |
| `╰` connector in cursor | Replaced by plain `❯`; simpler |
| Clock / execution time | Not useful enough to justify the line |

---

## Nerd Font Requirement

The rounded pill caps use **Nerd Font private-use characters** (U+E0B6 `` and U+E0B4 ``). The theme already requires JetBrains Mono NF, so no new font dependency is introduced.

---

## Narrow-Terminal Compatibility

All segments are left-aligned and stacked vertically. There are no right-aligned blocks that could overlap in narrow terminals. Runtime versions are inline after the path inside the pill — if the path is long and terminal is very narrow, the runtime versions will wrap to the next visual line but will not overlap or be cut off silently.

---

## File to Modify

`prompt/nebula-haze.omp.json` — full replacement of the `blocks` array and `transient_prompt` object. Schema version and `final_space` remain unchanged.
