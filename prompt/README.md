# Nebula Haze — oh-my-posh Prompt

Modern two-line terminal prompt built on the Nebula Haze palette. Designed for narrow/vertical terminals with p10k-style git status and optional runtime context.

## Requirements

- [oh-my-posh](https://ohmyposh.dev/docs/installation/windows) v3+
- A Nerd Font — [JetBrains Mono NF](https://www.nerdfonts.com/font-downloads) recommended (required for rounded pill caps)

## Install

### Windows — PowerShell

1. Install oh-my-posh:
   ```powershell
   winget install JanDeDobbeleer.OhMyPosh
   ```

2. Set your terminal font to **JetBrains Mono NF** in Windows Terminal settings.

3. Add to your PowerShell profile (`$PROFILE`):
   ```powershell
   oh-my-posh init pwsh --config "C:\path\to\prompt\nebula-haze.omp.json" | Invoke-Expression
   ```
   Replace `C:\path\to` with the actual path to this repo.

### Linux / Fedora — Bash

1. Install oh-my-posh:
   ```bash
   curl -s https://ohmyposh.dev/install.sh | bash -s
   ```

2. Add to `~/.bashrc`:
   ```bash
   eval "$(oh-my-posh init bash --config ~/path/to/prompt/nebula-haze.omp.json)"
   ```

## IDE terminals

Git line is automatically hidden inside **Rider** and **VS Code** terminals — detected via `TERMINAL_EMULATOR=JetBrains-JediTerm` and `TERM_PROGRAM=vscode`. This collapses the prompt to just the path pill and cursor, keeping it minimal where the IDE already shows git context.

## Layout

```
 󰘬 feat/dark-mode ↑1 ↓2 ✱3 ✚2 ?1        ← git line (hidden in IDEs)
 nebula-haze/src/styles  ·  ⬡ 20.11  ·  ● 8.0   ← path pill
❯                                                  ← cursor
```

### Git status indicators

| Symbol | Meaning |
|--------|---------|
| `↑N` | N commits ahead of upstream |
| `↓N` | N commits behind upstream |
| `✱N` | N unstaged changes |
| `✚N` | N staged changes |
| `?N` | N untracked files |

Only non-zero values are shown. Requires `fetch_status: true` — adds a small delay (~100–300 ms) per prompt on large repos.

### Path pill

Teal `` left cap, purple `` right cap. Dark fill (`#1c1d36`). Full-path from git root, truncated when deep (`max_depth: 4`). Branch name truncated to 20 chars.

### Runtime versions

Shown inline after the path, only when inside a relevant project:

- `⬡ N.N` — Node.js (detected by `package.json`)
- `● N.N` — .NET SDK (detected by `*.csproj`, `*.fsproj`, `global.json`)

### Cursor

`❯` turns red with exit code on failure. Previous prompts collapse to a muted `❯` in scrollback (transient prompt).
