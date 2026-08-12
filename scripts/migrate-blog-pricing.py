"""Apply the tested pricing-copy transform to blog_posts rows in Supabase.

Reuses transform() from scripts/migrate-pricing-copy.py rather than writing a
second set of rules, so the 51 test cases cover the database content too.

  (no flags)  dry run + report
  --show N    print N proposed diffs
  --apply     back up every touched row to JSON, then PATCH
"""
import argparse
import importlib.util
import json
import os
import re
import time
import urllib.request

REPO = 'C:/Users/jbost/socialmate'
SCRATCH = os.path.dirname(os.path.abspath(__file__))

spec = importlib.util.spec_from_file_location(
    'mig', os.path.join(REPO, 'scripts', 'migrate-pricing-copy.py'))
mig = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mig)   # this wraps stdout in utf-8 for us

env = {}
for line in open(os.path.join(REPO, '.env.local'), encoding='utf-8'):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        env[line[:line.index('=')]] = line[line.index('=') + 1:].strip()

URL = env['NEXT_PUBLIC_SUPABASE_URL']
KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HDRS = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json'}
FIELDS = ('title', 'excerpt', 'content')

# Posts a mechanical rewrite would leave incoherent. Two kinds:
#
#   thesis - the old price is the headline, the slug, and the argument. Swapping
#            $5 for $8 in the body leaves a post titled "Why $5/Month Is the
#            Right Price" at a URL containing "5-dollars-month". The slug cannot
#            change without breaking the URL, the sitemap and any backlinks.
#   math   - the body derives figures from the old price ("$5/month is $60/year",
#            "Per year: $240", the whole BDAY31 discount table). Rewriting only
#            the monthly number leaves the arithmetic contradicting itself.
#
# These need an editorial decision - rewrite, retire, or leave as dated - which
# is Joshua's call, not a migration script's.
SKIP_SLUGS = {
    'why-5-dollars-month-affordable-creator-tool':     'thesis',
    '5-dollar-social-media-tool-replaces-99':          'thesis + math',
    'socialmate-built-different-5-dollar-vs-99':       'thesis',
    'social-media-scheduler-7-platforms':              'thesis (title)',
    'socialmate-under-4-dollars-month':                'thesis + math',
    'best-social-media-tool-deal-2026':                'math (BDAY31)',
    'bday31-promo-explained':                          'math (BDAY31)',
    'socialmate-vs-sprout-social':                     'math ($240/yr)',
    'what-is-social-media-scheduler-do-you-need-one':  'math ($60/yr)',
    # Applied, then rolled back: the transform updated the parts with a plan
    # word in reach and left the rest, so the commission sums and the section
    # headings contradicted themselves. Originals restored from backup.
    'socialmate-affiliate-program-how-it-works':       'math (10 x $5 x 30% commission)',
    'socialmate-affiliate-milestones-40-percent':      'math (100 x $8 x 40% commission)',
    'social-media-automation-budget-what-works':       'structure ("What Works at $5-10/Month")',
}


def req(method, path, body=None, extra=None):
    h = dict(HDRS)
    if extra:
        h.update(extra)
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(URL + '/rest/v1/' + path, data=data, headers=h, method=method)
    with urllib.request.urlopen(r) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else None


def fetch_all():
    rows, offset = [], 0
    while True:
        batch = req('GET', 'blog_posts?select=id,slug,title,excerpt,content'
                           '&order=id.asc&limit=500&offset=%d' % offset)
        if not batch:
            break
        rows += batch
        offset += 500
        if len(batch) < 500:
            break
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--show', type=int, default=0)
    a = ap.parse_args()

    if not mig.run_tests():
        print('refusing to run with failing tests')
        return

    rows = fetch_all()
    print('\nfetched %d blog_posts rows' % len(rows))

    planned, samples, skipped = [], [], []
    for row in rows:
        if row['slug'] in SKIP_SLUGS:
            skipped.append((row['slug'], SKIP_SLUGS[row['slug']]))
            continue
        patch, changes = {}, []
        for f in FIELDS:
            val = row.get(f)
            if not isinstance(val, str) or not val:
                continue
            new, ch = mig.transform(val)
            if new != val:
                patch[f] = new
                changes += [(f,) + c for c in ch]
        if patch:
            planned.append((row, patch, changes))
            for f, old, nw, ctx in changes:
                samples.append((row['slug'], f, old, nw, ctx))

    total = sum(len(c) for _, _, c in planned)
    print('%d rows would change, %d replacements total' % (len(planned), total))
    print('%d rows held back for editorial review:' % len(skipped))
    for slug, why in sorted(skipped):
        print('    %-50s %s' % (slug, why))
    print()

    if a.show:
        for slug, f, old, nw, ctx in samples[:a.show]:
            print('  %-52s %-8s %s -> %s' % (slug[:52], f, old, nw))
            print('      ...%s' % ctx[:128])

    if not a.apply:
        print('\n(dry run - nothing written)')
        return

    backup = os.path.join(SCRATCH, 'blog_backup_%d.json' % int(time.time()))
    with open(backup, 'w', encoding='utf-8') as fh:
        json.dump([r for r, _, _ in planned], fh, ensure_ascii=False, indent=1)
    print('backed up %d original rows -> %s' % (len(planned), backup))

    done = 0
    for row, patch, _ in planned:
        req('PATCH', 'blog_posts?id=eq.' + row['id'], patch,
            {'Prefer': 'return=minimal'})
        done += 1
        if done % 25 == 0:
            print('  updated %d/%d' % (done, len(planned)))
    print('APPLIED: %d rows updated, %d replacements' % (done, total))


if __name__ == '__main__':
    main()
