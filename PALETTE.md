# Nebula Haze — Color Palette Reference

> Single source of truth for all syntax and UI colors.
> Read this instead of scanning `nebula-haze.xml` when doing color work.
> Keep this in sync with the XML after every color change.

---

## Base

| Role                            | Hex      | Notes                                                                                      | 
|---------------------------------|----------|--------------------------------------------------------------------------------------------|
| Background                      | `21243a` | Editor, gutter, console                                                                    |
| Plain text / default identifier | `c0caf5` | HSL 229°, 73%, 86% — the whisper anchor; also used for local variables (no semantic color) |
| Comments                        | `606480` | Intentionally muted                                                                        |
| Inlay hints                     | `565f89` | Dimmer than comments                                                                       |
| Chrome (borders, guides)        | `2a2e48` | Indent guides, margins                                                                     |
| Chrome (mid)                    | `414868` | Gutter annotations, diagram borders                                                        |

---

## Palette — Hue Families × 4 Levels

### Blue (~222°)

| Level  | Hex      | HSL (approx)   | Used for                                                                                                               |
|--------|----------|----------------|------------------------------------------------------------------------------------------------------------------------|
| dim    | `7494c8` | 222°, 44%, 62% | Scrollbar thumb (rest), code vision dim, string escape, YAML list scalar                                               |
| mid    | `8aabe6` | 222°, 62%, 72% | Function declaration/call, instance method, static method, extension method, CSS property name, JSON/YAML property key |
| bright | `a5bcf0` | 222°, 72%, 79% | Annotation, metadata, hyperlink, bookmark, scrollbar hover, code vision hovered                                        |

### Violet (~257°)

| Level   | Hex      | HSL (approx)    | Used for                                                                                                                                                                 |
|---------|----------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| whisper | `c2c0e8` | 245°, 45%, 83%  | TS type parameter, annotation attribute name                                                                                                                             |
| dim     | `9480c8` | 257°, 40%, 65%  | Template variable; Markdown header marker (`#`)                                                                                                                          |
| mid     | `c498ff` | 257°, 100%, 80% | Keyword, predefined symbol, delegate, JS if/else/try/yield/module keyword                                                                                                |
| bright  | `dbbeff` | 263°, 100%, 87% | Class name, abstract class, class reference, typedef, static class, namespace, type parameter, Scala predefined, Razor/ASP directive; also HTML/XML/CSS/JSX/Vue tag name |

### Teal (~170°, ~208° for whisper)

| Level   | Hex      | HSL (approx)   | Used for                                                                                                                        |
|---------|----------|----------------|---------------------------------------------------------------------------------------------------------------------------------|
| whisper | `bdd8e8` | 208°, 47%, 82% | Parameter, reassigned parameter, JS/HTTP parameter, anonymous class parameter                                                   |
| dim     | `5a9e94` | 174°, 28%, 48% | Reserved                                                                                                                        |
| mid     | `6ec4b6` | 173°, 42%, 60% | Constant, enum identifier, enum member, struct identifier (+ underline)                                                         |
| bright  | `8fd4c8` | 173°, 48%, 69% | Protocol reference, list/map conversion, CSS class name, HTML/XML/JSX/Vue attribute names, event identifier, format string item |

### Green (~138°)

| Level  | Hex      | HSL (approx)   | Used for                                                                                |
|--------|----------|----------------|-----------------------------------------------------------------------------------------|
| dim    | `6a9e78` | 138°, 20%, 52% | Reserved                                                                                |
| mid    | `96cc9e` | 138°, 34%, 70% | Interface declaration                                                                   |
| bright | `88dda0` | 142°, 53%, 70% | String literal, CSS property value, JS regexp/module name, HTTP input, git-added gutter |

### Pink (~338°)

| Level  | Hex      | HSL (approx)   | Used for                                                                                                            |
|--------|----------|----------------|---------------------------------------------------------------------------------------------------------------------|
| dim    | `b07888` | 342°, 22%, 58% | Reserved                                                                                                            |
| mid    | `e888c0` | 318°, 76%, 73% | Deferred — no current syntax assignment (was HTML/XML tag name; moved to violet-bright for unified JSX/class color) |
| bright | `e0aabf` | 338°, 52%, 77% | Git-deleted gutter                                                                                                  |

### Sand (~57°, cool — no warm/orange cast)

| Level  | Hex      | HSL (approx)  | Used for                                                                                 |
|--------|----------|---------------|------------------------------------------------------------------------------------------|
| dim    | `a8a578` | 57°, 17%, 56% | Reserved                                                                                 |
| mid    | `c5c28a` | 57°, 34%, 66% | Number literal, entity, JS null/undefined/this/super, HTML/XML entity, regexp char class |
| bright | `d4d07a` | 57°, 52%, 65% | Git-modified gutter                                                                      |

### Orange — exception

| Hex      | Used for                                                                                              |
|----------|-------------------------------------------------------------------------------------------------------|
| `e09a68` | Operation sign, punctuation (braces, brackets, parens, comma, dot, semicolon); TODO comment highlight |

---

## Diagnostic / VCS (exempt from palette rules)

| Hex                 | Used for                                     |
|---------------------|----------------------------------------------|
| `e07891`            | Error underline, bad character, error stripe |
| `c9a55a`            | Warning underline, typo, SonarLint major     |
| `79ad7b` → `9fd4ae` | Git-added (now green-bright)                 |
| `a89e5c` → `d4d07a` | Git-modified (now sand-bright)               |
| `c7778a` → `e0aabf` | Git-deleted (now pink-bright)                |
| `1e3835`            | VCS annotation stripe bg 4 (dark teal)       |
| `263d3a`            | VCS annotation stripe bg 5 (dark teal)       |

---

## Palette Governance Rules (summary)

1. **Swatch book first** — new colors must pick an existing family + level. No freeform hex.
2. **No new hue families** without updating the full spec at `docs/superpowers/specs/2026-05-07-palette-system-design.md`.
3. **Whisper derivation** — nudge `c0caf5` ±15–20° toward family hue, reduce saturation ~20%, keep lightness within 4–6% of `c0caf5`.
4. **Perceptual calibration** — compare new mid-level colors against `8aabe6` (blue-mid reference). Teal/green need lower HSL sat than blue/violet at equal perceptual vividness.
5. **Amber banned from syntax** — use sand (`c5c28a` / `d4d07a`) instead. Exception: `c9a55a` retained for warning diagnostics only.
6. **Orange is singleton** — `e09a68` is operators-only.

---

## Deferred

`9abccc` (CSS class name, event, format string item, JS console, log warning) — assign to teal-bright `8fd4c8` or blue-dim `7494c8` during implementation; evaluate visually.
