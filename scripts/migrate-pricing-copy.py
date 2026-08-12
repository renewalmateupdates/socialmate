"""
Rewrite public copy for the Aug 2026 pricing change.

    Pro     $5/mo  -> $8/mo     $55/yr  -> $80/yr
    Agency  $20/mo -> $29/mo    $209/yr -> $290/yr
    Free     100 posts/month -> 250 posts/month

Why this is not a find-and-replace
----------------------------------
"$5" and "$20" are load-bearing for at least eight *other* things in this
codebase: donation tiers, fan-subscription examples, White Label Basic ($20/mo),
SOMA Full Send ($20/mo), Enki Emperor annual ($20/mo), credit packs, X Boosters,
and Studio Stax renewal savings. Replacing the bare number corrupts all of them.

The obvious guard - "is a competitor named nearby?" - is worse than useless
here, because the entire marketing angle is "competitors charge $99, we charge
$5". Competitor mentions co-occur with our own price constantly.

So the rule is adjacency plus exclusion:

  1. A plan word ("Pro" / "Agency") must appear within WINDOW chars of the amount.
  2. No decoy term may appear between the plan word and the amount, which is what
     kills "White Label Pro ($40/mo)" and "Pro plan ... Full Send is $20/month".
  3. The amount must not be part of a larger token ($5K, $55.00, $209m).

Per CLAUDE.md: a script touching 100+ files proves its mapping on examples
first. Run `python scripts/migrate-pricing-copy.py --test` - it exercises every
real string shape found in the tree, including the ones that must NOT change.
Run with no flags for a dry-run report; `--apply` writes.
"""
import argparse
import io
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ['app', 'components', 'lib', 'public', 'messages']
SKIP_DIRS = {'node_modules', '.next', '.git', '__pycache__', 'temp'}
EXTS = ('.tsx', '.ts', '.json', '.txt', '.md')

# Files whose numbers are the source of truth and already correct, or that
# describe the migration itself.
SKIP_FILES = {
    'app/pricing/page.tsx',
    'lib/post-limits.ts',
    'app/api/stripe/webhook/route.ts',
    'components/pricing/FlipCard.tsx',
    # Hand-fixed: its Pro and Agency rows both claimed "100 posts / month",
    # which was already wrong before this change (they are 1,000 and 5,000).
    # Rewriting 100 -> 250 there would have replaced one wrong number with
    # another, so the tier values are corrected by hand instead.
    'app/for/linkedin-creators/page.tsx',
}

WINDOW = 34  # chars between plan word and amount
ANCHOR = 72  # chars between our own name and an untiered amount

# Our name, or a construction that only ever introduces our own price.
OURS = re.compile(
    r'(socialmate|free forever|free plan|for free or|free,? or|starts free'
    r'|we give for|gives for|we charge)', re.I)
# A competitor named between the anchor and the amount means the amount is
# theirs, not ours. Comparison copy puts the two within a sentence of each
# other constantly, so the anchor alone is not enough.
COMPETITOR = re.compile(
    r'(hootsuite|buffer|later|publer|sprout|sendible|loomly|planoly|planable'
    r'|postplanner|crowdfire|zoho|socialbee|missinglettr|recurpost|taplio'
    r'|hubspot|canva|brand24|agorapulse|kontentino|gain|emplifi|khoros'
    r'|semrush|beehiiv|substack|mailchimp|convertkit|linktree|notion)', re.I)

AMOUNTS = {
    ('pro', '5'): '8',
    ('pro', '55'): '80',
    ('agency', '20'): '29',
    ('agency', '209'): '290',
}

# Terms that, sitting between the plan word and the amount, mean the amount
# belongs to something else.
DECOY = re.compile(
    r'(white[\s-]?label|full[\s-]send|autopilot|booster|credit pack|credits?\b'
    r'|donat|tip jar|fan sub|monthly tier|enki|emperor|commander|cloud runner'
    r'|studio stax|add[\s-]?on)', re.I)

PLAN_WORD = re.compile(r'\b(Pro|Agency)\b')
# Not preceded by $ or digit; not followed by more number, or a letter (
# excludes $5K, $20M), or a decimal.
# Not part of a bigger number ($55 when we want $5, $5.99, $5K, $20M). The
# trailing guard has to allow a sentence-ending "$5." while still rejecting
# "$5.99", so it forbids a following digit and a decimal-then-digit, rather than
# forbidding the period outright — which is what hid "we give for $5." from the
# first pass.
AMOUNT = re.compile(r'(?<![\d.$])\$(5|20|55|209)(?!\d)(?![.,]\d)(?![A-Za-z])')

# Only a *monthly* 100 is the free cap. Requiring the month marker is what
# rules out, in one stroke: "100 posts lifetime" (RecurPost's limit), "Up to 100
# posts per session" (the bulk scheduler's per-batch cap), "100 posts published"
# (the Century Poster achievement), and "schedule 100 posts" (a description of
# bulk CSV upload). Each of those is a different number that happens to be 100.
POSTS_100 = re.compile(r'(?<![\d,])100 posts\s*(?:/|per |a |every )\s*(?:month|mo)\b')
# ...and a competitor's monthly cap is still not ours.
POSTS_DECOY = re.compile(
    r'(hootsuite|buffer|later\b|publer|sprout|sendible|loomly|planoly|postplanner'
    r'|crowdfire|zoho|socialbee|missinglettr|recurpost'
    r'|they (allow|cap|limit)|their (free )?plan)', re.I)


def _plan_for(text, start, end):
    """Which plan owns the amount at [start:end), or None.

    Nearest plan word wins, not the first one found. "Pro is $8/month. Agency is
    $20/month." puts both words in the window before $20; taking the first would
    attribute $20 to Pro, find no ('pro', '20') mapping, and silently skip a real
    change. The nearest word is the one the sentence is actually about.
    """
    before = text[max(0, start - WINDOW):start]
    after = text[end:end + WINDOW]
    candidates = []  # (distance, plan)
    for m in PLAN_WORD.finditer(before):
        between = before[m.end():]
        if DECOY.search(between):
            continue
        if DECOY.search(before[max(0, m.start() - 14):m.start()]):
            continue
        candidates.append((len(before) - m.end(), m.group(1).lower()))
    for m in PLAN_WORD.finditer(after):
        if DECOY.search(after[:m.start()]):
            continue
        if DECOY.search(after[max(0, m.start() - 14):m.start()]):
            continue
        candidates.append((m.start(), m.group(1).lower()))
    if not candidates:
        return None
    return min(candidates)[1]


def transform(text):
    """Return (new_text, [(old, new, context), ...])."""
    changes = []

    def money(m):
        plan = _plan_for(text, m.start(), m.end())
        if plan is None:
            # Marketing copy names no tier: "Free forever or $5/month",
            # "SocialMate covers 7 platforms for $5/month", "socialmate:
            # '$20/mo'". Our own name is the anchor instead, and in this
            # codebase an unqualified $5 is always Pro and an unqualified $20
            # beside our name is always Agency.
            #
            # Deliberately narrow: it needs OUR name within ANCHOR chars and no
            # decoy in between, which is what leaves Buffer's "$5/month if you
            # pay a full year upfront", Enki's "$5 min" trade size, and the
            # guides' "$5 per square foot" untouched.
            lead = text[max(0, m.start() - ANCHOR):m.start()]
            hit = None
            for a in OURS.finditer(lead):
                tail = lead[a.end():]
                if DECOY.search(tail) or COMPETITOR.search(tail):
                    continue
                hit = a  # nearest qualifying anchor wins
            if hit is None:
                return m.group(0)
            plan = 'pro' if m.group(1) in ('5', '55') else 'agency'
        new = AMOUNTS.get((plan, m.group(1)))
        if new is None:
            return m.group(0)
        ctx = re.sub(r'\s+', ' ', text[max(0, m.start() - 55):m.end() + 35]).strip()
        changes.append((m.group(0), '$' + new, ctx))
        return '$' + new

    out = AMOUNT.sub(money, text)

    def posts(m):
        seg = out[max(0, m.start() - 90):m.end() + 60]
        # On a /vs page our own number sits inches from the competitor's name
        # ("Publer limits you to 3 accounts... SocialMate gives you 100
        # posts/month"), so the decoy alone would block the very thing we came
        # to change. An explicit attribution to us wins over it.
        ours = re.search(r'socialmate', out[max(0, m.start() - 45):m.start()], re.I)
        if not ours and POSTS_DECOY.search(seg):
            return m.group(0)
        ctx = re.sub(r'\s+', ' ', seg).strip()
        # Swap only the number; the match spans the whole "100 posts / month"
        # phrase so that spacing and the "/mo" vs "a month" wording survive.
        new = m.group(0).replace('100', '250', 1)
        changes.append((m.group(0), new, ctx))
        return new

    out = POSTS_100.sub(posts, out)
    return out, changes


# ---------------------------------------------------------------- tests
CASES_CHANGE = [
    ('Upgrade to Pro for $5 whenever it earns it.', 'Pro for $8'),
    ('Upgrade to Pro — $5/mo', 'Pro — $8/mo'),
    ('Start free. Pro is $5/month.', 'Pro is $8/month'),
    ('The Pro plan ($5/month) and Agency plan ($20/month) pay for infrastructure.',
     'Pro plan ($8/month) and Agency plan ($29/month)'),
    ('The $5/month Pro plan would cover 5 accounts per platform.', '$8/month Pro plan'),
    ("What's included in Agency ($20/month)?", 'Agency ($29/month)'),
    ('Pay $20/month for SocialMate Agency. White label it.', 'Pay $29/month'),
    ('Pro Plan: $5/month or $55/year, billed in advance.', '$8/month or $80/year'),
    ('Agency: $20/month or $209/year.', '$29/month or $290/year'),
    ('we give for $5 or free — Pro tier', 'for $8 or free'),
    ('Free gives you 100 posts a month', '250 posts a month'),
    ('Free tier includes 100 posts/month, 50 AI credits', '250 posts/month'),
    ('<li>100 posts / month, no per-channel cap</li>', '250 posts / month'),
    ('100 posts per month across 7 platforms', '250 posts per month'),
    # Ours, sitting right beside a competitor's name on a /vs page.
    ('Publer limits you to 3 accounts and 10 posts per account. SocialMate gives '
     'you 100 posts/month, no per-account fees.', '250 posts/month'),
    ("recurpost: '(100 posts lifetime cap)', socialmate: '100 posts/month free'",
     "socialmate: '250 posts/month free'"),
    ('<li>100 posts every month, no lifetime cap</li>', '250 posts every month'),
    # Nearest plan word wins, not the first in the window.
    ('SocialMate starts free forever. Pro is $5/month. Agency is $20/month.',
     'Pro is $8/month. Agency is $29/month.'),
    ('Flat pricing — Pro $5/mo, Agency $20/mo. No per-brand fees',
     'Pro $8/mo, Agency $29/mo'),
    # Untiered, anchored on our own name.
    ("description: 'Schedule fitness content to 7 platforms. Free forever or $5/month.'",
     'Free forever or $8/month'),
    ('SocialMate covers 7 platforms for $5/month — or free.', 'for $8/month'),
    ("{ feature: 'Agency plan', gain: '$99/mo+', socialmate: '$20/mo' }",
     "socialmate: '$29/mo'"),
    ('SocialMate is self-serve, starts free, and scales to $20/month max.',
     'scales to $29/month max'),
    # Sentence-ending "$5." — hidden from the first pass by the $5.99 guard.
    ('What Hootsuite charges $99 for, we give for $5.', 'we give for $8.'),
    ('free forever, or $5/month when you need more.', 'or $8/month when you need'),
    ('Free forever on the free plan. $5/month if you need more.',
     'free plan. $8/month if you need'),
    ('a real product thousands use to stay consistent — for free or $5/month.',
     'for free or $8/month'),
]

CASES_KEEP = [
    'White Label Basic ($20/mo): logo + colors + brand name.',
    'White Label Pro ($40/mo): everything plus custom domain.',
    'Full Send is $20/month — fully autonomous, zero review.',
    'Autopilot is $10/month and Full Send is $20/month.',
    'Set a monthly tier — $3, $5, $10, whatever works for your audience.',
    'Go Emperor — $20/mo (annual)',
    'you save $20 off the $100/yr founding rate',
    'a realistic 12-month $5K/month roadmap',
    'Built for maximum compounding from small accounts ($5 → growth).',
    'White-label add-ons ($20–$40) also attributed to you',
    'Hootsuite caps you at 100 posts on their free plan',
    'Pro users get 2,000 credits for $20 in credit packs',
    # A competitor's price, or an unrelated quantity, that happens to be one of
    # our numbers. These are the reason the anchor needs OUR name nearby.
    'Buffer charges $6/month per channel on monthly billing ($5/month if you pay a full year upfront).',
    'Ad revenue on YouTube averages $1–$5 per 1,000 views depending on your niche.',
    'Simplified Method: $5 per square foot, max 300 sq ft',
    "['$5 min', 'Minimum trade size']",
    'Set presets ($1/$3/$5/$10) or custom amounts.',
    '0.5% of your monthly audience tips an average of $4 at 1,000 followers = $20/month.',
    'got their first 10 customers from flyers they printed for $5 and posted at the library',
    # Each of these is a different quantity that happens to be 100 posts.
    "label: 'Century Poster', desc: '100 posts published'",
    'Bulk CSV scheduler — upload a spreadsheet, schedule 100 posts',
    'Agency · Up to 100 posts per session · 3-month horizon',
    'RecurPost free plan: 3 accounts, 100 posts lifetime',
    # Verbatim from app/vs/page.tsx:228-229 — the competitor's name sits on the
    # preceding line, which is what the decoy window has to reach.
    ("    headline:    'RecurPost free plan: 3 accounts, 100 posts lifetime',\n"
     '    angle:       "Not 100 posts per month — 100 posts ever. Use them up '
     'and you\'re done unless you pay $25/month."'),
]


def run_tests():
    ok = True
    for src, expect in CASES_CHANGE:
        got, _ = transform(src)
        if expect not in got:
            ok = False
            print('  FAIL (should change)')
            print('    in:       %s' % src)
            print('    expected: %s' % expect)
            print('    got:      %s' % got)
    for src in CASES_KEEP:
        got, ch = transform(src)
        if got != src:
            ok = False
            print('  FAIL (should NOT change)')
            print('    in:  %s' % src)
            print('    got: %s' % got)
    print('%d change-cases, %d keep-cases: %s' %
          (len(CASES_CHANGE), len(CASES_KEEP), 'ALL PASS' if ok else 'FAILURES ABOVE'))
    return ok


def walk():
    for d in DIRS:
        for dp, dn, fn in os.walk(os.path.join(ROOT, d)):
            dn[:] = [x for x in dn if x not in SKIP_DIRS]
            for f in fn:
                if not f.endswith(EXTS):
                    continue
                p = os.path.join(dp, f)
                rel = os.path.relpath(p, ROOT).replace(os.sep, '/')
                if rel in SKIP_FILES:
                    continue
                yield p, rel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--test', action='store_true')
    ap.add_argument('--show', type=int, default=0, help='print N sample changes')
    a = ap.parse_args()

    if a.test:
        sys.exit(0 if run_tests() else 1)

    if not run_tests():
        print('\nrefusing to run with failing tests')
        sys.exit(1)

    files_changed, total, samples = 0, 0, []
    for p, rel in walk():
        try:
            s = open(p, encoding='utf-8').read()
        except Exception:
            continue
        new, ch = transform(s)
        if not ch:
            continue
        files_changed += 1
        total += len(ch)
        for old, nw, ctx in ch:
            samples.append((rel, old, nw, ctx))
        if a.apply:
            open(p, 'w', encoding='utf-8', newline='').write(new)

    print('\n%s: %d replacements across %d files' %
          ('APPLIED' if a.apply else 'DRY RUN', total, files_changed))
    if a.show:
        print()
        for rel, old, nw, ctx in samples[:a.show]:
            print('  %s\n    %s -> %s   ...%s' % (rel, old, nw, ctx[:120]))


if __name__ == '__main__':
    main()
