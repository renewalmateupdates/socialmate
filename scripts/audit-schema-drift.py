"""
Find every place the code names a database column that does not exist.

Three separate bugs in one day came from this, each invisible for months:

    profiles.user_id          - killed the day 1 activation email outright
    notifications.body/href   - every in-app notification insert rejected
    user_settings.use_case    - no onboarding goals, no +50 completion credits

The shape is always the same. Postgres answers an unknown column with a 400 and
rejects the whole statement; the caller destructures `{ data }` without ever
looking at `error`; `data` is null; a guard on the next line returns early. The
feature is dead and nothing anywhere says so.

Static types do not help, because the Supabase client is untyped here - column
names are strings, and a string typo is not a type error.

So compare the strings against the real schema. PostgREST publishes it at
/rest/v1/ as an OpenAPI document, which is the same source of truth the database
answers from.

    python scripts/audit-schema-drift.py            # report
    python scripts/audit-schema-drift.py --strict   # exit 1 on any finding (CI)

Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
"""
import argparse
import io
import json
import os
import re
import sys
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ['app', 'components', 'lib', 'contexts', 'hooks']
SKIP_DIRS = {'node_modules', '.next', '.git', '__pycache__'}

# PostgREST operators that take a column name as their first argument.
FILTERS = ('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in',
           'contains', 'containedBy', 'order')

# Columns the client synthesises or that are not real columns.
PSEUDO = {'count', '*'}


def load_env():
    env = {}
    with open(os.path.join(ROOT, '.env.local'), encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                env[line[:line.index('=')]] = line[line.index('=') + 1:].strip()
    return env


def live_schema(env):
    """{table: {column, ...}} straight from PostgREST's OpenAPI document."""
    req = urllib.request.Request(
        env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1/',
        headers={'apikey': env['SUPABASE_SERVICE_ROLE_KEY'],
                 'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY']})
    spec = json.loads(urllib.request.urlopen(req).read().decode())
    return {t: set(d.get('properties', {}).keys())
            for t, d in (spec.get('definitions') or {}).items()}


def iter_files():
    for d in DIRS:
        base = os.path.join(ROOT, d)
        if not os.path.isdir(base):
            continue
        for dp, dn, fn in os.walk(base):
            dn[:] = [x for x in dn if x not in SKIP_DIRS]
            for f in fn:
                if f.endswith(('.ts', '.tsx')):
                    p = os.path.join(dp, f)
                    yield p, os.path.relpath(p, ROOT).replace(os.sep, '/')


def balanced(text, open_at):
    """Index just past the bracket opened at `open_at`, or None."""
    pairs = {'(': ')', '{': '}'}
    close = pairs[text[open_at]]
    depth, i, n = 0, open_at, len(text)
    quote = None
    while i < n:
        c = text[i]
        if quote:
            if c == '\\':
                i += 2
                continue
            if c == quote:
                quote = None
        elif c in '"\'`':
            quote = c
        elif c == text[open_at]:
            depth += 1
        elif c == close:
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    return None


def clean_col(raw):
    """Normalise one entry from a .select() list to a bare column name."""
    c = raw.strip()
    if not c or '(' in c:      # embedded resource: other_table(col)
        return None
    if ':' in c:               # alias:column
        c = c.split(':', 1)[1]
    for sep in ('->>', '->', '::'):   # json path / cast
        if sep in c:
            c = c.split(sep, 1)[0]
    c = c.strip().strip('"')
    return c or None


SELECT_STR = re.compile(r"\.select\(\s*(['\"])(.*?)\1", re.S)
KEY = re.compile(r'''(?m)^\s{2,}(?:['"])?([A-Za-z_][A-Za-z0-9_]*)(?:['"])?\s*:''')
CHAIN_STEP = re.compile(r'\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(')


def top_level_keys(body):
    """[(offset, key)] for keys at depth 1 of the object literal `body`.

    Only the outermost keys are columns. Anything nested is the *contents* of a
    jsonb column, and reporting those produces confident nonsense: the analytics
    syncs write

        .update({ bluesky_stats: { likes, reposts, replies, fetched_at } })

    which is one real column, and a flat scan reports it as four phantom ones.
    Same for `data: { href }` on notifications and `metadata: { day, slot }` on
    SOMA posts. Eight of the findings in the first full run were this.
    """
    out = []
    depth = 0
    i, n = 0, len(body)
    quote = None
    while i < n:
        ch = body[i]
        if quote:
            if ch == '\\':
                i += 2
                continue
            if ch == quote:
                quote = None
        elif ch in '"\'`':
            quote = ch
        elif ch in '{[(':
            depth += 1
        elif ch in '}])':
            depth -= 1
        elif depth == 1:
            km = KEY_AT.match(body, i)
            # A key is only a key if the nearest non-space character behind it
            # opened the object or ended the previous entry. Without this,
            # `paused ? null : x` reads `null:` as a column named "null", and
            # ternaries inside payloads are common.
            if km and _opens_entry(body, i):
                out.append((km.start(1), km.group(1)))
                i = km.end()
                continue
        i += 1
    return out


# A single `key:` occurrence, anchored where the scanner currently sits.
KEY_AT = re.compile(r'''\s*(?:['"])?([A-Za-z_][A-Za-z0-9_]*)(?:['"])?\s*:''')


def _opens_entry(body, i):
    """True if position `i` starts a fresh entry in an object literal."""
    j = i - 1
    while j >= 0 and body[j] in ' \t\r\n':
        j -= 1
    return j < 0 or body[j] in '{,'


def chain_extent(text, start):
    """End index of the .a().b().c() chain beginning at `start`.

    A fixed-size window does not work here. Supabase calls sit inside
    Promise.all blocks and back-to-back awaits, so a flat 1200 chars runs
    straight past the end of one query and swallows the next - which is how a
    first pass "found" 467 phantom columns, most of them a neighbouring table's
    perfectly valid ones attributed to this one.

    Consume only genuine `.method(...)` continuations and stop at the first
    thing that is not one.
    """
    pos = start
    while True:
        m = CHAIN_STEP.match(text, pos)
        if not m:
            return pos
        close = balanced(text, m.end() - 1)
        if close is None:
            return pos
        pos = close


def scan_file(path, rel, schema, findings):
    try:
        src = open(path, encoding='utf-8').read()
    except Exception:
        return

    def line_of(idx):
        return src.count('\n', 0, idx) + 1

    for m in re.finditer(r"\.from\(\s*['\"]([A-Za-z0-9_]+)['\"]\s*\)", src):
        table = m.group(1)
        cols = schema.get(table)
        if cols is None:
            continue  # not a table PostgREST exposes (rpc, view, typo in table name)
        chain = src[m.end():chain_extent(src, m.end())]

        sm = SELECT_STR.search(chain)
        if sm and '*' not in sm.group(2):
            for raw in sm.group(2).split(','):
                c = clean_col(raw)
                if c and c not in PSEUDO and c not in cols:
                    findings.append((rel, line_of(m.end() + sm.start()), table, c, 'select'))

        for verb in ('insert', 'upsert', 'update'):
            vm = re.search(r'\.' + verb + r'\(\s*\{', chain)
            if not vm:
                continue
            brace = chain.index('{', vm.start())
            end = balanced(chain, brace)
            if end is None:
                continue
            body = chain[brace:end]
            if '...' in body:
                continue  # spread: keys are not statically visible
            for off, c in top_level_keys(body):
                if c not in cols:
                    findings.append((rel, line_of(m.end() + brace + off),
                                     table, c, verb))

        for fm in re.finditer(
                r"\.(" + '|'.join(FILTERS) + r")\(\s*['\"]([A-Za-z0-9_]+)['\"]", chain):
            c = fm.group(2)
            if c not in cols and c not in PSEUDO:
                findings.append((rel, line_of(m.end() + fm.start()), table, c,
                                 '.' + fm.group(1) + '()'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--strict', action='store_true', help='exit 1 if anything is found')
    a = ap.parse_args()

    schema = live_schema(load_env())
    print('live schema: %d tables\n' % len(schema))

    findings = []
    n = 0
    for path, rel in iter_files():
        n += 1
        scan_file(path, rel, schema, findings)

    # De-duplicate: the same bad column on the same line reported once.
    seen, uniq = set(), []
    for f in findings:
        if f in seen:
            continue
        seen.add(f)
        uniq.append(f)

    print('scanned %d files' % n)
    if not uniq:
        print('no phantom columns found')
        return 0

    by_table = {}
    for rel, line, table, col, kind in uniq:
        by_table.setdefault((table, col), []).append((rel, line, kind))

    print('PHANTOM COLUMNS: %d distinct, %d call sites\n' % (len(by_table), len(uniq)))
    for (table, col), sites in sorted(by_table.items(), key=lambda kv: -len(kv[1])):
        near = sorted(schema[table], key=lambda c: -_sim(c, col))[:3]
        print('  %s.%s   (%d site%s)' % (table, col, len(sites), '' if len(sites) == 1 else 's'))
        print('      closest real columns: %s' % ', '.join(near))
        for rel, line, kind in sites[:6]:
            print('      %s:%d  [%s]' % (rel, line, kind))
        if len(sites) > 6:
            print('      ... and %d more' % (len(sites) - 6))
        print()
    return 1 if a.strict else 0


def _sim(a, b):
    """Crude similarity so the suggestion list is useful."""
    a, b = a.lower(), b.lower()
    if a == b:
        return 100
    sa, sb = set(a), set(b)
    return len(sa & sb) - abs(len(a) - len(b))


if __name__ == '__main__':
    sys.exit(main())
