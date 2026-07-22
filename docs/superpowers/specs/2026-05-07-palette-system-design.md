# Nebula Haze — Palette System Design

**Date:** 2026-05-07
**Scope:** Establish a structured color swatch book for the Nebula Haze theme, fix saturation inconsistencies, remove amber from syntax tokens, and define governance rules so future color changes stay coherent.

---

## Problem

Token colors have accumulated through ad-hoc edits — each change was locally reasonable but no overarching system governed relationships. The result:

- Saturation spread is wide and inconsistent (`7dcfff` at 100% HSL sat, `8fb99c` at 23%)
- Teal/cyan tokens (`73daca`) appear perceptually louder than blue tokens even at lower HSL saturation, because the eye is more sensitive to that hue range
- Related tokens (functions, local vars, scrollbar) use unrelated hex values instead of sharing a hue family
- Amber family (`d8c383`, `a89e5c`) conflicts with the theme's cool/nebula character
- No rules exist to evaluate future color additions

---

## Design

### Core principle

A swatch book defines all valid colors. Every syntax and UI color in the theme must be traceable to a slot in the swatch book. New colors require updating the swatch book first, not the other way around.

---

### Hue families

Six hue families, each with four shade levels. One exception (operators, outside the system).

| Family | Anchor hue | Notes |
|--------|-----------|-------|
| blue | ~222° | Functions, methods, annotations, UI accents |
| violet | ~257° | Keywords, types, class names, namespaces |
| teal | ~170° | Constants, enum values |
| green | ~138° | Strings, interfaces, git-added |
| pink | ~338° | HTML/XML/CSS tags, git-deleted |
| sand | ~57°, cool-toned | Numbers, entities, null/undefined, git-modified |
| coral | ~16°, warm | Added 2026-07-22 — parameters. First warm family; see amendment below |
| **orange** | **~25°** | **Exception — operators only, not in shade system** |

Amber is removed. Sand replaces it with no warm/orange cast.

---

### Four shade levels

| Level | Anchor | Rule | Used for |
|-------|--------|------|----------|
| **whisper** | plain text `c0caf5` | Nudge hue ±15–20° toward family anchor. Lightness within 4–6% of `c0caf5`. Saturation reduced ~20% from text. Reads as near-plain-text alone; distinction visible only when adjacent to plain text. | Local variables, parameters |
| **dim** | hue family | Hue family color, subdued lightness and saturation. Clearly has the hue but not dominant. | Scrollbar thumb, code lens, gutter dim accents |
| **mid** | hue family | Standard token presence. Calibrated for perceptual uniformity across families (teal/green get lower HSL sat than blue/violet at this level). | Functions, keywords, strings, types |
| **bright** | hue family | Elevated presence. Used for tokens that need to pop or for UI active states. | Constants, annotations, active tab underline, git gutter marks |

**Perceptual calibration rule:** Teal and green hues are perceived as more vivid than blue/violet at equal HSL saturation, because the human eye is more sensitive in the 490–570 nm range. Teal-mid targets ~42–45% HSL saturation while blue-mid targets ~62–65%, producing equivalent perceived vividness.

---

### Swatch book

Plain text (not a family slot): `c0caf5` — HSL(229°, 73%, 86%)
Background: `21243a`

#### Blue (~222°)

| Level | Hex | HSL (approx) | Primary uses |
|-------|-----|--------------|-------------|
| whisper | `bcc4e6` | 222°, 48%, 82% | Local variable, mutable local variable |
| dim | `7494c8` | 222°, 44%, 62% | Scrollbar thumb (rest), code vision dim |
| mid | `8aabe6` | 222°, 62%, 72% | Function declaration, function call, instance method, static method, extension method |
| bright | `a5bcf0` | 222°, 72%, 79% | Annotation, metadata, active hyperlink, tab underline, bookmark |

#### Violet (~257°)

| Level | Hex | HSL (approx) | Primary uses |
|-------|-----|--------------|-------------|
| whisper | `c2c0e8` | 245°, 45%, 83% | TS type parameter, annotation attribute name |
| dim | `9480c8` | 257°, 40%, 65% | Template variable (dim) |
| mid | `b09ce8` | 256°, 62%, 76% | Keyword, predefined symbol, delegate, JS module keyword, JS if/else/try/yield |
| bright | `c9b6ee` | 263°, 52%, 82% | Class name, abstract class, interface reference, typedef, static class, namespace, type parameter (bold), Razor/ASP directive |

Note: Namespace uses the same slot as class (violet-bright). Visual distinction between namespace qualifier and type name comes from syntactic position, not color.

#### Teal (~170°)

| Level | Hex | HSL (approx) | Primary uses |
|-------|-----|--------------|-------------|
| dim | `5a9e94` | 174°, 28%, 48% | Reserved for future dim teal accents |
| mid | `6ec4b6` | 173°, 42%, 60% | Constant, enum identifier, enum member, struct identifier (+ underline decoration) |
| bright | `8fd4c8` | 173°, 48%, 69% | Protocol reference, list/map conversion |

#### Green (~138°)

| Level | Hex | HSL (approx) | Primary uses |
|-------|-----|--------------|-------------|
| whisper | `c4e2db` | 167°, 34%, 83% | Parameter, reassigned parameter, JS parameter, HTTP request parameter, anonymous class parameter |
| dim | `6a9e78` | 138°, 20%, 52% | Reserved (dim green accents) |
| mid | `8ab896` | 138°, 26%, 63% | Interface declaration |
| bright | `9fd4ae` | 138°, 40%, 73% | String literal, CSS property value, JS regexp, JS module name, git-added gutter |

#### Pink (~338°)

| Level | Hex | HSL (approx) | Primary uses |
|-------|-----|--------------|-------------|
| dim | `b07888` | 342°, 22%, 58% | Reserved (dim pink accents) |
| mid | `cc8ea5` | 338°, 34%, 68% | HTML tag, XML tag, CSS tag, Razor tag, inline HTML |
| bright | `e0aabf` | 338°, 52%, 77% | Git-deleted gutter |

#### Sand (~57°, cool-toned — no warm/orange cast)

| Level | Hex | HSL (approx) | Primary uses |
|-------|-----|--------------|-------------|
| dim | `a8a578` | 57°, 17%, 56% | Reserved |
| mid | `c5c28a` | 57°, 34%, 66% | Number literal, entity, JS null/undefined, JS this/super, HTML/XML entity, regexp char class |
| bright | `d4d07a` | 57°, 52%, 65% | Git-modified gutter |

#### Orange (exception)

| Hex | Uses |
|-----|------|
| `e09a68` | Operation sign, braces, brackets, parentheses, comma, dot, semicolon — all punctuation/operators |

---

### Colors outside the palette (intentionally exempt)

These colors have strong semantic/conventional meaning and are not governed by the swatch book:

| Color | Hex | Reason |
|-------|-----|--------|
| Warning diagnostic | `c9a55a` | IDE warning convention (amber) |
| Error diagnostic | `e07891` | IDE error convention (red-pink) |
| Plain text | `c0caf5` | The baseline, not a token color |
| Comments | `7880a8` | Intentionally muted, structural |
| Inlay hints | `565f89` | Intentionally subdued, structural |
| Chrome/gutter | `414868`, `2a2e48`, `21243a`, etc. | Background structure |

---

## Token changes summary

### Removed: amber family

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `d8c383` | Number, entity, JS null/undefined, JS this/super, HTML entity, JSON keyword, regexp char class | `c5c28a` | sand-mid |
| `a89e5c` | Git-modified gutter, file status modified | `d4d07a` | sand-bright |

### Changed: oversaturated blues/cyans

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `7dcfff` | CSS property name, JSON property key, YAML key, DEFAULT_ATTRIBUTE (HTML/XML attr name) | `8aabe6` | blue-mid (property keys are identifiers, same level as functions) |
| `7dcfff` | Hyperlink, followed hyperlink, doc comment link, ctrl-clickable | `a5bcf0` | blue-bright (links need to pop) |
| `88affa` | Function declaration, function call, instance method, static method, extension method | `8aabe6` | blue-mid |
| `85a7f5` | Annotation, metadata, tab underline, bookmark, scrollbar hover, code vision hovered | `a5bcf0` | blue-bright |
| `7ab8d8` | String escape, console user input, YAML scalar list, custom keyword 4 | `7494c8` | blue-dim (secondary/escape tokens) |

### Changed: teal — toned down for perceptual uniformity

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `73daca` | Constant, enum identifier, enum member, struct identifier (+ underline decoration preserved) | `6ec4b6` | teal-mid |
| `73daca` | Protocol reference, list/map conversion | `8fd4c8` | teal-bright |

### Changed: class/type/namespace consolidation

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `c9b6e7` | Class name, abstract class, class reference, typedef, static class, Scala predefined, Razor directive | `c9b6ee` | violet-bright |
| `bba6de` | Namespace identifier | `c9b6ee` | violet-bright (same as class) |

### Changed: local variable / parameter — whisper level

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `a0c5e9` | Local variable, reassigned local variable, JS local variable, JS instance member variable | `bcc4e6` | blue-whisper |
| `d0cdd1` | Parameter, reassigned parameter, JS parameter, HTTP request parameter, anonymous class parameter | `c4e2db` | green-whisper |
| `d0cdd1` | TS type parameter, annotation attribute name | `c2c0e8` | violet-whisper |

### Changed: strings and green family

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `90d89f` | String literal, CSS property value, JS regexp, JS module name, HTTP input file/value | `9fd4ae` | green-bright |

### Changed: interface — more presence

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `8fb99c` | Interface declaration | `8ab896` | green-mid |

### Changed: git gutter — palette bright level

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `79ad7b` | Added lines gutter, FILESTATUS_ADDED | `9fd4ae` | green-bright |
| `a89e5c` | Modified lines gutter, FILESTATUS_MODIFIED | `d4d07a` | sand-bright |
| `c7778a` | Deleted lines gutter, FILESTATUS_DELETED | `e0aabf` | pink-bright |

---

## Governance rules

1. **Swatch book first.** Before adding any new color to `nebula-haze.xml`, identify which family and level it belongs to. If no slot fits, update this spec to add the slot before touching the theme file.

2. **No new hue families without a spec update.** Six families + one exception cover the full token space. Adding a seventh family is a design decision, not an implementation detail.

3. **Whisper derivation rule.** Whisper colors must be derived by nudging `c0caf5` toward the family's anchor hue by 15–20°, reducing saturation by ~20%, and keeping lightness within 4–6% of `c0caf5`. They must not be independently "nice-looking colors" — they must read as near-plain-text in isolation.

4. **Perceptual target.** When defining or adjusting a mid-level color, compare it visually against `8aabe6` (blue-mid, the reference). If it reads noticeably louder, reduce its HSL saturation. Teal and green will always require lower HSL sat than blue/violet at the same perceptual level.

5. **Amber is banned from syntax.** `d8c383`, `c9a55a` (syntax uses only), and similar warm-cast yellows must not appear in syntax token slots. Sand (`c5c28a`, `d4d07a`) replaces them. Exception: `c9a55a` is retained for warning diagnostics where amber has IDE-conventional meaning.

6. **Orange is a singleton exception.** `e09a68` is reserved exclusively for operators and punctuation. No other token family should use orange.

---

## Deferred decisions

**`9abccc`** — currently used for CSS class names, event identifiers, format string items, macros, JS console, log warning output. HSL(199°, 33%, 70%): hue sits between blue (222°) and teal (170°) families, saturation is already low and not causing problems. This color is not amber and not oversaturated, so it is low priority. During implementation, assign it to the nearest slot visually — likely teal-bright `8fd4c8` (same lightness band, shift hue toward teal) or blue-dim `7494c8` (shift toward blue). Evaluate in context and pick whichever looks less jarring.

---

## Out of scope

- Background colors (`21243a`, `2a2e4a`, `1e2138`, etc.) — not changed
- Error/warning diagnostics — not changed (exempt by rule)
- Console ANSI colors — follow syntax families but not audited in this pass
- Rainbow brackets — these intentionally cycle through multiple families; reviewed separately

---

## Amendment 2026-07-22 — Coral family (warm), parameters recolored

**Motivation.** Violet dominates the theme (keywords at violet-mid, classes + all tag names at violet-bright). To introduce warmth without disturbing that structure, add a single warm family and move one token group onto it. Parameters were chosen first: they were on teal-whisper `bdd8e8`, a near-plain-text slot, so recoloring them does not disturb any high-traffic syntax.

**New family — coral (~16°, warm).** The palette's first warm family. Governance rule 2 (no new hue family without a spec update) is satisfied by this amendment.

| Level | Hex | HSL (approx) | Uses |
|-------|-----|--------------|------|
| dim | — | — | Reserved (derive when needed) |
| mid | `e6ab8e` | 20°, 64%, 73% | Parameter, reassigned parameter, JS/HTTP parameter, anonymous class parameter |
| bright | — | — | Reserved |

Only the mid slot is defined. Dim/bright/whisper are left undefined until a concrete use arises, rather than inventing unvalidated hexes.

**Boundaries with existing warm-adjacent colors:**
- **Orange singleton (`e09a68`, ~25°)** stays operators-only. Coral-mid is lighter (L≈73% vs ≈64%) and lands on identifier tokens (multi-glyph), so it reads distinctly from single-glyph operators despite the near hue.
- **Pink (~338°)** is magenta/rose; coral is a genuinely warm hue, not a warmer pink.

**Token moves.**

| Old hex | Tokens | New hex | New slot |
|---------|--------|---------|----------|
| `bdd8e8` | `DEFAULT_PARAMETER`, `DEFAULT_REASSIGNED_PARAMETER` (fg + underline effect), `IMPLICIT_ANONYMOUS_CLASS_PARAMETER_ATTRIBUTES`, `HTTP_REQUEST_PARAMETER_NAME`, `JS.PARAMETER` | `e6ab8e` | coral-mid |

Type parameters (`TS.TYPE_PARAMETER`, `TYPE_PARAMETER_NAME_ATTRIBUTES`, Scala/ReSharper type-param slots) are a different concept (generics, violet-whisper) and were **not** touched.

**Side effect.** Teal-whisper `bdd8e8` is now unused — marked Reserved in `PALETTE.md`.

**Presence note.** Parameters move from a whisper-level slot to a mid-level color, so they gain some presence relative to before. This was an intentional, eye-tested choice.
