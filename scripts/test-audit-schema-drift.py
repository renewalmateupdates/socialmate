#!/usr/bin/env python3
"""Tests for audit-schema-drift.py's bracket scanner.

    python scripts/test-audit-schema-drift.py

This script is a guard, and a guard that reports imaginary bugs is one people
stop reading. It has already produced false positives twice: 16 from descending
into nested jsonb (fixed in PR #565), and two more from an apostrophe inside a
`//` comment running the scan past the end of a call and attributing the next
query's columns to the wrong table. Both were mapping bugs a handful of examples
would have caught, which is why these now exist.

No network and no database — this covers the pure text scanning only.
"""
import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location(
    'aud', os.path.join(HERE, 'audit-schema-drift.py'))
aud = importlib.util.module_from_spec(spec)
spec.loader.exec_module(aud)


# Each case is a single (...) spanning the whole string, so the correct answer
# is always len(src). Computed, never hand-counted — hand-counting these is how
# a passing function looked like it was failing.
BALANCED_CASES = [
    ('plain object',            "({ a: 1 })"),
    ('string containing paren', "({ a: 'x)y' })"),
    ('nested parens',           "({ a: (1 || 2) })"),
    ('escaped quote',           r"({ a: 'it\'s' })"),
    ('template literal',        "({ a: `x ${y} z` })"),
    ('// inside a string',      "({ a: 'http://x' })"),

    # The regression. An apostrophe in a comment used to open a string literal
    # that never closed, so the scan ran to the next quote somewhere in the next
    # function and swallowed whole queries on the way.
    ('apostrophe in // comment', "({\n // doesn't matter\n a: 1 })"),
    ('apostrophe in /* */',      "({\n /* won't break */\n a: 1 })"),
    ('brackets inside a comment', "({\n // } ) not real\n a: 1 })"),

    # Shape of the real .update() that triggered it, comment and all.
    ('real update body',
     "({\n status: 'x',\n"
     " // clear it so a stale reason doesn't sit on a live account\n"
     " b: c ? (d || null) : null,\n})"),
]


def test_balanced():
    failures = []
    for name, src in BALANCED_CASES:
        got, want = aud.balanced(src, 0), len(src)
        if got != want:
            failures.append('  %-26s got=%s want=%s\n     src: %r'
                            % (name, got, want, src))
    return 'balanced()', len(BALANCED_CASES), failures


def test_chain_extent_stops_at_statement_end():
    """A chain must not run past the statement it belongs to.

    Two .from() calls back to back: if the first chain swallows the second, the
    scanner attributes the second table's columns to the first.
    """
    src = (
        "const { error } = await db\n"
        "  .from('affiliates')\n"
        "  .update({\n"
        "    reviewed_by: user.email,\n"
        "    // clear it so a stale reason doesn't sit on a live account\n"
        "    rejection_reason: action === 'suspend' ? (reason || null) : null,\n"
        "  })\n"
        "  .eq('id', id)\n"
        "\n"
        "const { data } = await db\n"
        "  .from('user_settings')\n"
        "  .select('referral_code')\n"
    )
    first = src.index(".from('affiliates')") + len(".from('affiliates')")
    end = aud.chain_extent(src, first)
    failures = []
    if 'user_settings' in src[first:end]:
        failures.append('  chain from affiliates ran into the user_settings query')
    if ".eq('id', id)" not in src[first:end]:
        failures.append('  chain stopped before the end of its own statement')
    return 'chain_extent()', 2, failures


def test_clean_col():
    cases = [
        ('id',                    'id'),
        ('  name  ',              'name'),
        ('alias:real_column',     'real_column'),
        ('other_table(col)',      None),   # embedded resource, not our column
        ('',                      None),
    ]
    failures = []
    for raw, want in cases:
        got = aud.clean_col(raw)
        if got != want:
            failures.append('  clean_col(%r) got=%r want=%r' % (raw, got, want))
    return 'clean_col()', len(cases), failures


def main():
    total = passed = 0
    all_failures = []
    for fn in (test_balanced, test_chain_extent_stops_at_statement_end, test_clean_col):
        name, count, failures = fn()
        total += count
        passed += count - len(failures)
        status = 'ok' if not failures else 'FAIL'
        print('%-18s %-5s %d/%d' % (name, status, count - len(failures), count))
        all_failures.extend(failures)

    print()
    if all_failures:
        print('\n'.join(all_failures))
        print('\n%d/%d failed' % (len(all_failures), total))
        return 1
    print('all %d assertions pass' % total)
    return 0


if __name__ == '__main__':
    sys.exit(main())
