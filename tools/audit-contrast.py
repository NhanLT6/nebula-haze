#!/usr/bin/env python3
"""
audit-contrast.py — WCAG contrast audit for nebula-haze.xml

Checks two categories:
  1. Attribute blocks that declare both BACKGROUND and FOREGROUND explicitly.
  2. Implied pairs — tokens in <colors> where the IDE draws its own text on the
     background color (e.g. blame stripes, gutter, popups). These are defined
     in IMPLIED_PAIRS below; extend that list as you discover new ones.

Exit 0 = all pairs pass.  Exit 1 = one or more fail.  Exit 2 = usage error.

Run from repo root:
    python audit-contrast.py
"""

import re
import sys

from xml.etree.ElementTree import Element  # type reference only — not used for parsing
try:
    import defusedxml.ElementTree as ET
except ImportError:
    print("ERROR: defusedxml is required. Run: pip install defusedxml")
    sys.exit(2)

# ── WCAG helpers ──────────────────────────────────────────────────────────────

def _linearize(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex6: str) -> float:
    """Relative luminance of a 6-char hex color (leading # and trailing alpha both ignored)."""
    h = hex6.strip("#")[:6]
    r, g, b = (int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))
    return 0.2126 * _linearize(r) + 0.7152 * _linearize(g) + 0.0722 * _linearize(b)


def contrast(hex_a: str, hex_b: str) -> float:
    la, lb = luminance(hex_a), luminance(hex_b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


_HEX_RE = re.compile(r"^[0-9a-fA-F]{6,8}$")


def is_hex(v: str) -> bool:
    return bool(_HEX_RE.match(v))


# ── Theme constants ───────────────────────────────────────────────────────────

# These are referenced by name in IMPLIED_PAIRS below. They must match what's
# in the XML so that updates to the XML stay automatically reflected.
EDITOR_BG = "21243a"  # base editor / gutter background
EDITOR_FG = "c0caf5"  # plain text / default identifier

NORMAL = 4.5  # WCAG AA — body / code text
LARGE  = 3.0  # WCAG AA — large or UI-chrome text

# ── Intentional dims ──────────────────────────────────────────────────────────
#
# Tokens that are deliberately quiet — checked at a low "not invisible" threshold
# instead of full WCAG. Add a token here when you intentionally want it dim.
# The threshold represents the absolute minimum before it becomes unreadably dark.
#
INTENTIONAL_DIMS: dict[str, float] = {
    "INLAY_DEFAULT":          1.5,  # supplementary hints — very quiet by design
    "INLINE_PARAMETER_HINT":  1.5,
    "BREADCRUMBS_DEFAULT":    2.0,  # navigable but secondary
    "BREADCRUMBS_INACTIVE":   1.5,  # barely-there by design
}

# ── Implied pairs ─────────────────────────────────────────────────────────────
#
# Format: (bg_token_name, fg_hex_or_token_name, threshold, human_note)
#
# bg_token_name  — key in <colors> whose value is the background
# fg_hex_or_token_name — either a literal hex OR another <colors> token name
# threshold      — minimum acceptable contrast ratio
# human_note     — shown in failure output to explain why the pair matters
#
IMPLIED_PAIRS = [
    # VCS blame stripes — IDE renders annotation text in a platform colour on
    # these backgrounds; the closest approximation is EDITOR_FG.
    ("VCS_ANNOTATIONS_COLOR_1", EDITOR_FG, LARGE,  "blame stripe bg / IDE annotation text"),
    ("VCS_ANNOTATIONS_COLOR_2", EDITOR_FG, LARGE,  "blame stripe bg / IDE annotation text"),
    ("VCS_ANNOTATIONS_COLOR_3", EDITOR_FG, LARGE,  "blame stripe bg / IDE annotation text"),
    ("VCS_ANNOTATIONS_COLOR_4", EDITOR_FG, LARGE,  "blame stripe bg / IDE annotation text"),
    ("VCS_ANNOTATIONS_COLOR_5", EDITOR_FG, LARGE,  "blame stripe bg / IDE annotation text"),
    # Gutter — line numbers are intentionally dim; "not invisible" minimum
    ("GUTTER_BACKGROUND",        "LINE_NUMBERS_COLOR", 2.0,    "gutter bg / line number text (intentionally dim)"),
    # Selection — selected text must remain readable
    ("SELECTION_BACKGROUND",     EDITOR_FG, NORMAL, "selection bg / editor text"),
    # Caret row — code on the highlighted current line
    ("CARET_ROW_COLOR",          EDITOR_FG, NORMAL, "caret-row bg / editor text"),
    # Popups
    ("DOCUMENTATION_COLOR",      EDITOR_FG, NORMAL, "docs popup bg / text"),
    ("LOOKUP_COLOR",             EDITOR_FG, NORMAL, "autocomplete popup bg / text"),
]

# ── XML parsing ───────────────────────────────────────────────────────────────

def parse_colors(root: Element) -> dict[str, str]:
    """Return {token: hex6} for every valid flat <option> in <colors>."""
    result: dict[str, str] = {}
    colors_el = root.find("colors")
    if colors_el is not None:
        for opt in colors_el.findall("option"):
            name = opt.get("name", "")
            val  = opt.get("value", "")
            if name and val and is_hex(val):
                result[name] = val[:6]
    return result


def parse_attribute_pairs(root: Element) -> list[dict]:
    """Return [{token, bg, fg}] for attribute blocks that set both explicitly."""
    pairs: list[dict] = []
    attrs_el = root.find("attributes")
    if attrs_el is None:
        return pairs
    for attr_opt in attrs_el.findall("option"):
        name     = attr_opt.get("name", "")
        value_el = attr_opt.find("value")
        if value_el is None:
            continue
        bg = fg = None
        for opt in value_el.findall("option"):
            n, v = opt.get("name", ""), opt.get("value", "")
            if n == "BACKGROUND" and is_hex(v):
                bg = v[:6]
            elif n == "FOREGROUND" and is_hex(v):
                fg = v[:6]
        if bg and fg:
            pairs.append({"token": name, "bg": bg, "fg": fg})
    return pairs


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    try:
        tree = ET.parse("nebula-haze.xml")
    except FileNotFoundError:
        print("ERROR: nebula-haze.xml not found — run from the repo root.")
        sys.exit(2)

    root   = tree.getroot()
    colors = parse_colors(root)

    issues: list[dict] = []
    passes = 0

    # Category 1: explicit BG + FG pairs in <attributes>
    for pair in parse_attribute_pairs(root):
        threshold = INTENTIONAL_DIMS.get(pair["token"], NORMAL)
        ratio = contrast(pair["bg"], pair["fg"])
        dim_note = " (intentionally dim)" if pair["token"] in INTENTIONAL_DIMS else ""
        if ratio < threshold:
            issues.append({**pair, "ratio": ratio, "threshold": threshold,
                           "note": f"explicit attribute FG/BG pair{dim_note}"})
        else:
            passes += 1

    # Category 2: implied pairs from <colors>
    for bg_token, fg_val, threshold, note in IMPLIED_PAIRS:
        bg_hex = colors.get(bg_token)
        if bg_hex is None:
            continue
        # fg_val is either a literal hex or a token name to look up
        fg_hex = colors.get(fg_val, fg_val)
        if not is_hex(fg_hex) or len(fg_hex.strip("#")) < 6:
            continue
        fg_hex = fg_hex[:6]
        ratio = contrast(bg_hex, fg_hex)
        if ratio < threshold:
            issues.append({
                "token":     bg_token,
                "bg":        bg_hex,
                "fg":        fg_hex,
                "ratio":     ratio,
                "threshold": threshold,
                "note":      note,
            })
        else:
            passes += 1

    # ── Report ────────────────────────────────────────────────────────────────
    if issues:
        bar = "=" * 62
        print(f"\n{bar}")
        print(f"  FAIL - {len(issues)} contrast issue(s)   ({passes} pair(s) passed)")
        print(f"{bar}\n")
        for i in issues:
            need = f"need >= {i['threshold']}:1"
            print(f"  FAIL  {i['token']}")
            print(f"        bg=#{i['bg']}  fg=#{i['fg']}  ratio={i['ratio']:.2f}:1  ({need})")
            print(f"        {i['note']}")
            print()
        sys.exit(1)
    else:
        print(f"\nPASS - {passes} pair(s) checked, all above threshold.\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
