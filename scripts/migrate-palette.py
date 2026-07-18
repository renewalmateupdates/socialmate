#!/usr/bin/env python3
"""
Migrate Tailwind default-palette utilities onto the instrument design tokens.

    python scripts/migrate-palette.py app/features app/vs app/for
    python scripts/migrate-palette.py --check app/vs        # report only

Committed rather than thrown away because it runs across ~100 files and will be
needed again for the remaining public surfaces.

THE MAPPING IS SEMANTIC, NOT COSMETIC. The design system carries three voices,
each with one fixed meaning, so colours collapse by what they *mean*:

    green / emerald   -> jade      published, live, included, real
    purple / violet   -> violet    AI, SOMA, generation, credits
    amber / yellow    -> amber     queued, scheduled, primary
    red / rose        -> alert     failure (the one documented exception)
    blue / indigo /   -> NEUTRAL   not one of the three voices, so it takes the
    sky / cyan / pink              ink ramp rather than a colour of its own

Blue collapsing to neutral is the point, not a shortcut: a fourth colour is what
makes a palette read as decoration instead of language.

GREY TEXT IS SHADE-AWARE, and that matters. A flat grey -> ink-muted mapping
shipped a real regression on the first run: `dark:text-gray-100` is near-WHITE
(a headline) and became muted, quietly greying out every h1 on the /vs pages.
These are dark-forced pages, so light shades are high-emphasis text, and the
dark shades were light-mode values the page never actually displayed.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

GREYS = r"gray|slate|zinc|neutral|stone"

# Ordered, most specific first. Paired `x dark:y` utilities must be rewritten
# before singles, or the single pass leaves orphaned `dark:` fragments behind.
PAIRS: list[tuple[str, str]] = [
    ("bg-white dark:bg-gray-900", "bg-panel"),
    ("bg-white dark:bg-gray-800", "bg-panel"),
    ("bg-gray-50 dark:bg-gray-900", "bg-panel"),
    ("bg-gray-50 dark:bg-gray-800", "bg-raised"),
    ("bg-gray-100 dark:bg-gray-800", "bg-raised"),
    ("bg-gray-100 dark:bg-gray-700", "bg-raised"),
    ("border-gray-100 dark:border-gray-800", "border-edge"),
    ("border-gray-200 dark:border-gray-700", "border-edge"),
    ("border-gray-300 dark:border-gray-600", "border-edge-lit"),
    ("text-gray-900 dark:text-gray-100", "text-ink-high"),
    ("text-black dark:text-white", "text-ink-high"),
    ("text-gray-800 dark:text-gray-200", "text-ink-body"),
    ("text-gray-700 dark:text-gray-300", "text-ink-body"),
    ("text-gray-600 dark:text-gray-400", "text-ink-muted"),
    ("text-gray-500 dark:text-gray-400", "text-ink-muted"),
    ("text-gray-400 dark:text-gray-500", "text-ink-muted"),
]

# (utility prefix, COMPLETE colour+scale regex, replacement token)
# The second element already includes its scale, so nothing is appended and
# there is no double-suffix trap.
RULES: list[tuple[str, str, str]] = [
    # text, greys by shade
    ("text", rf"(?:{GREYS})-(?:50|100|200)", "text-ink-high"),
    ("text", rf"(?:{GREYS})-(?:300|400)", "text-ink-body"),
    ("text", rf"(?:{GREYS})-(?:500|600)", "text-ink-muted"),
    ("text", rf"(?:{GREYS})-(?:700|800|900|950)", "text-ink-high"),
    # text, the voices
    ("text", r"(?:green|emerald)-\d{2,3}", "text-jade"),
    ("text", r"(?:purple|violet|fuchsia)-\d{2,3}", "text-violet"),
    ("text", r"(?:red|rose)-\d{2,3}", "text-alert"),
    ("text", r"(?:amber|yellow|orange)-\d{2,3}", "text-amber"),
    ("text", r"(?:indigo|blue|sky|cyan|teal|pink)-\d{2,3}", "text-ink-muted"),
    # backgrounds
    ("bg", r"(?:green|emerald)-\d{2,3}", "bg-jade/10"),
    ("bg", r"(?:purple|violet|fuchsia)-\d{2,3}", "bg-violet/10"),
    ("bg", r"(?:red|rose)-\d{2,3}", "bg-alert/10"),
    ("bg", r"(?:amber|yellow|orange)-\d{2,3}", "bg-amber/10"),
    ("bg", r"(?:indigo|blue|sky|cyan|teal|pink)-\d{2,3}", "bg-raised"),
    ("bg", rf"(?:{GREYS})-(?:900|950)", "bg-panel"),
    ("bg", rf"(?:{GREYS})-\d{{2,3}}", "bg-raised"),
    # borders
    ("border", r"(?:green|emerald)-\d{2,3}", "border-jade/40"),
    ("border", r"(?:purple|violet|fuchsia)-\d{2,3}", "border-violet/40"),
    ("border", r"(?:red|rose)-\d{2,3}", "border-alert/40"),
    ("border", r"(?:amber|yellow|orange)-\d{2,3}", "border-amber"),
    ("border", r"(?:indigo|blue|sky|cyan|teal|pink)-\d{2,3}", "border-edge-lit"),
    ("border", rf"(?:{GREYS})-\d{{2,3}}", "border-edge"),
    # rings and dividers
    ("ring", r"(?:amber|yellow|orange)-\d{2,3}", "ring-amber"),
    ("ring", r"(?:green|emerald)-\d{2,3}", "ring-jade"),
    ("ring", r"(?:purple|violet|fuchsia)-\d{2,3}", "ring-violet"),
    ("ring", r"(?:red|rose)-\d{2,3}", "ring-alert"),
    ("ring", rf"(?:{GREYS}|indigo|blue|sky|cyan|teal|pink)-\d{{2,3}}", "ring-edge-lit"),
    ("divide", rf"(?:{GREYS})-\d{{2,3}}", "divide-edge"),
]

BARE: list[tuple[str, str]] = [
    ("bg-white", "bg-panel"),
    ("bg-black", "bg-void"),
    ("text-white", "text-ink-high"),
    ("text-black", "text-ink-high"),
    ("border-white", "border-edge-lit"),
    ("border-black", "border-edge"),
]

VARIANTS = r"hover|focus|focus-visible|active|group-hover|disabled"


def migrate(text: str) -> str:
    for a, b in PAIRS:
        text = text.replace(a, b)

    for prefix, colour, repl in RULES:
        # bare and dark: forms
        text = re.sub(
            rf"\b(?:dark:)?{prefix}-{colour}(?:/\d{{1,3}})?\b", repl, text
        )
        # variant-preserving form (hover:, focus:, ...)
        text = re.sub(
            rf"\b({VARIANTS}):(?:dark:)?{prefix}-{colour}(?:/\d{{1,3}})?\b",
            lambda m, r=repl: f"{m.group(1)}:{r}",
            text,
        )

    for a, b in BARE:
        text = re.sub(rf"\b(?:dark:)?{re.escape(a)}(?:/\d{{1,3}})?\b", b, text)

    # A surviving dark: variant now points at an already-dark token. Dead weight
    # that can shadow the base class.
    text = re.sub(
        r"\bdark:(bg-panel|bg-raised|bg-void|text-ink-[\w-]+|border-edge(?:-lit)?)\b",
        r"\1",
        text,
    )

    # Collapse duplicate ink colours on one element. The last would win anyway,
    # but two competing colours is a trap for whoever edits it next.
    def dedupe(m: re.Match) -> str:
        seen = False
        out: list[str] = []
        for cls in m.group(1).split():
            if cls.startswith("text-ink"):
                if seen:
                    continue
                seen = True
            out.append(cls)
        return 'className="' + " ".join(out) + '"'

    return re.sub(r'className="([^"{}]*text-ink-[^"{}]*)"', dedupe, text)


PALETTE_RE = re.compile(
    r"\b(?:bg|text|border|ring|divide)-"
    r"(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|"
    r"teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b"
    r"|\b(?:bg|text|border)-(?:white|black)\b"
)


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check_only = "--check" in sys.argv
    if not args:
        print(__doc__)
        return 1

    files: list[Path] = []
    for root in args:
        rp = Path(root)
        files.extend(sorted(rp.rglob("*.tsx")) if rp.is_dir() else [rp])

    changed = before_n = after_n = 0
    for f in files:
        src = f.read_text(encoding="utf-8")
        b = len(PALETTE_RE.findall(src))
        if not b:
            continue
        out = migrate(src)
        before_n += b
        after_n += len(PALETTE_RE.findall(out))
        if out != src:
            changed += 1
            if not check_only:
                f.write_text(out, encoding="utf-8")

    verb = "would change" if check_only else "changed"
    print(f"{verb} {changed} files | palette utilities {before_n} -> {after_n}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
