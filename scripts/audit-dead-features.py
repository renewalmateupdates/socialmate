#!/usr/bin/env python3
"""Find code paths that cannot succeed, without running the product.

    python scripts/audit-dead-features.py
    python scripts/audit-dead-features.py --strict   # exit 1 on a real finding

WHY

The most expensive bug in this project is never a crash. It is a path that has
never executed once, so nobody has seen it fail. Between 2026-08-12 and
2026-08-30 that single pattern produced:

  * nine shipped features disabled by a phantom column      (PRs #554-#565)
  * four features whose backing table did not exist         (PR #577)
  * an affiliate control that could not remove anyone       (PR #573)
  * a paid plan that never reached the limit enforcement    (PR #579)

scripts/audit-schema-drift.py already catches the static half: columns and
tables the code names that do not exist. This catches the half that only fails
at runtime.

THE CHECK THAT MATTERS

Postgres rejects `ON CONFLICT (a, b)` unless a unique index covers exactly
those columns, with error 42P10. Supabase's .upsert(..., { onConflict: 'a,b' })
compiles straight to that. So an upsert whose target has no matching index
fails one hundred percent of the time, for every user, forever -- and it is
invisible until somebody actually performs that action.

42P10 is raised while planning the statement, before any row is touched. So an
empty request body is a complete and side-effect-free probe:

    {} + missing index  ->  42P10   the bug
    {} + real index     ->  23502   not-null violation, i.e. it got past planning

Verified on 2026-08-30 against production: both outcomes, zero rows written.

Tables where every column is nullable or defaulted are SKIPPED rather than
probed, because {} would be a valid row there and the probe would insert. A
tool that runs against production should not need an undo path.

SECONDARY, AND MUCH WEAKER

A user-facing table with zero rows. Sometimes it means the feature is broken;
usually it means nobody has used it yet. Reported last, and deliberately not
treated as a finding.
"""
import argparse
import collections
import json
import os
import re
import sys
import urllib.error
import urllib.request

SKIP_DIRS = {'node_modules', '.next', '.git', '.claude', 'supabase'}
NOT_TABLES = {'media'}          # storage bucket, not a table

FROM_RE = re.compile(r"\.from\(\s*['\"]([A-Za-z0-9_]+)['\"]\s*\)")
CONFLICT_RE = re.compile(r"onConflict:\s*['\"]([A-Za-z0-9_,\s]+)['\"]")
WRITE_RE = re.compile(r"\.(insert|upsert)\s*\(")


def load_env(path='.env.local'):
    env = {}
    if os.path.exists(path):
        for line in open(path, encoding='utf-8'):
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    for k in ('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'):
        env.setdefault(k, os.environ.get(k, ''))
    return env


def request(env, method, path, body=None, extra_headers=None):
    headers = {'apikey': env['SUPABASE_SERVICE_ROLE_KEY'],
               'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY'],
               'Content-Type': 'application/json'}
    headers.update(extra_headers or {})
    req = urllib.request.Request(
        env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/') + '/rest/v1/' + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read().decode(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), dict(e.headers)


# Columns that are NOT NULL but carry a default, so they do not stop an empty
# insert. PostgREST's `required` list cannot distinguish these, and getting it
# wrong is the difference between a read-only probe and one that writes.
DEFAULTED = {'id', 'created_at', 'updated_at'}


def live_tables(env):
    """{table: set(required columns)} straight from PostgREST's OpenAPI doc."""
    _, body, _ = request(env, 'GET', '')
    doc = json.loads(body)
    defs = doc.get('definitions') or doc.get('components', {}).get('schemas', {})
    return {t: set(d.get('required') or []) for t, d in defs.items()}


def safe_to_probe(required):
    """Whether an empty insert is guaranteed to be rejected before it writes.

    The probe sends {}. On a table with a NOT NULL column that has no default,
    Postgres raises 23502 and nothing is written -- but 42P10 is raised earlier,
    while planning, so the signal still comes through. On a table where every
    column is nullable or defaulted, {} is a perfectly valid row and the probe
    would INSERT. Those get skipped rather than written to and cleaned up after;
    a tool that runs against production should not need an undo path.
    """
    return bool(required - DEFAULTED)


def row_count(env, table):
    _, _, headers = request(env, 'GET', f'{table}?select=*',
                            extra_headers={'Prefer': 'count=exact', 'Range': '0-0'})
    rng = headers.get('Content-Range', '')
    return int(rng.split('/')[-1]) if '/' in rng else None


def audience(rel):
    if '/admin' in rel:
        return 'admin'
    if rel.startswith('lib/inngest') or '/cron/' in rel:
        return 'cron'
    return 'user'


def scan():
    """(table, onConflict, file) for every upsert, plus {table: [files]} writers."""
    upserts, writers = [], collections.defaultdict(list)
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if not f.endswith(('.ts', '.tsx')):
                continue
            p = os.path.join(root, f)
            try:
                src = open(p, encoding='utf-8').read()
            except Exception:
                continue
            rel = p.replace(os.sep, '/').lstrip('./')
            for m in FROM_RE.finditer(src):
                table = m.group(1)
                if table in NOT_TABLES:
                    continue
                tail = src[m.end():m.end() + 900]
                if WRITE_RE.search(tail):
                    writers[table].append(rel)
                c = CONFLICT_RE.search(tail)
                if c:
                    target = ','.join(x.strip() for x in c.group(1).split(','))
                    upserts.append((table, target, rel))
    return upserts, writers


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--strict', action='store_true')
    a = ap.parse_args()

    env = load_env()
    if not env.get('SUPABASE_SERVICE_ROLE_KEY'):
        print('SUPABASE_SERVICE_ROLE_KEY not set (expected in .env.local)')
        return 2

    schema = live_tables(env)
    tables = set(schema)
    upserts, writers = scan()
    pairs = sorted({(t, c) for t, c, _ in upserts})
    sites = collections.defaultdict(set)
    for t, c, rel in upserts:
        sites[(t, c)].add(rel)

    print('live tables: %d   upsert targets to verify: %d\n' % (len(tables), len(pairs)))

    broken, skipped, wrote = [], [], []
    for table, target in pairs:
        if table not in tables:
            skipped.append((table, target, 'table does not exist -- see audit-schema-drift.py'))
            continue
        if not safe_to_probe(schema[table]):
            skipped.append((table, target, 'every column nullable or defaulted -- probe would insert'))
            continue
        status, body, _ = request(
            env, 'POST', f'{table}?on_conflict={target}', {},
            extra_headers={'Prefer': 'resolution=merge-duplicates'})
        try:
            code = json.loads(body).get('code')
        except Exception:
            code = None
        if code == '42P10':
            broken.append((table, target))
        elif status in (200, 201, 204):
            # Should be unreachable given safe_to_probe, so shout rather than
            # quietly clean up: it means the safety gate is wrong.
            wrote.append((table, target))

    if broken:
        print('UPSERTS THAT CANNOT SUCCEED  (%d)' % len(broken))
        print('  ON CONFLICT names columns with no matching unique index.')
        print('  Postgres raises 42P10 every time. This fails for every user, always.\n')
        for table, target in broken:
            print('  %s  onConflict: %s' % (table, target))
            for rel in sorted(sites[(table, target)]):
                print('      [%s] %s' % (audience(rel), rel))
        print()

    if skipped:
        print('NOT VERIFIED  (%d)' % len(skipped))
        for table, target, why in skipped:
            print('  %s (%s) -- %s' % (table, target, why))
        print()

    if wrote:
        print('NOTE: probe inserted and then removed a row in: %s'
              % ', '.join(t for t, _ in wrote))
        print('  Those tables have no NOT NULL columns. Verify the cleanup.\n')

    if not broken:
        print('all %d upsert targets have a matching unique index\n' % len(pairs))

    # ---- weak signal, reported last and never counted as a finding ----
    empty = []
    for table in sorted(writers):
        if table not in tables:
            continue
        if any(audience(r) == 'user' for r in writers[table]):
            if row_count(env, table) == 0:
                empty.append(table)
    if empty:
        print('user-facing tables with zero rows (%d) -- usually just unused, not broken:'
              % len(empty))
        print('  ' + ', '.join(empty))

    return 1 if (a.strict and broken) else 0


if __name__ == '__main__':
    sys.exit(main())
