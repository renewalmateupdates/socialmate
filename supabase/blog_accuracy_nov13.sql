-- Blog accuracy fixes, Nov 13, 2026.
-- Found by `npm run verify:content -- --db` against production blog_posts (read-only).
-- Each REPLACE target was checked to appear exactly once in that post's content
-- before this file was written. Run in the Supabase SQL editor, then
-- `/api/admin/revalidate` and IndexNow for the seven slugs below.
--
-- What's wrong, and why:
--  1-3. socialmate-credit-system quoted old/wrong AI credit costs (caption 2,
--       repurpose 5, hashtags 1). Current costs (lib/ai-tool-costs.ts,
--       app/api/ai/route.ts): caption 5, repurpose 10, hashtags 5.
--  4-7. Four more posts quoted the repurposer or hashtag tool at 1 or 5
--       credits; both are wrong the same way.
--  8-9. hootsuite-alternative-with-tiktok-linkedin said Instagram/Facebook
--       scheduling is "SocialMate coming" / something "still working toward".
--       Per CLAUDE.md: Meta's app review has not started, and Pinterest
--       declined SocialMate's application outright. Reworded to the real
--       status instead of implying active progress.
--  10.  soma-projects-multiple-brands linked to https://socialmate.studio/soma/projects,
--       which has no page (only /soma/projects/new and /soma/projects/[id]
--       exist) and 404s. Pointed at /soma/dashboard, which lists projects.

BEGIN;

UPDATE blog_posts SET content = REPLACE(content,
  'Write caption: 2 credits',
  'Write caption: 5 credits')
WHERE slug = 'socialmate-credit-system';

UPDATE blog_posts SET content = REPLACE(content,
  'Repurpose post: 5 credits',
  'Repurpose post: 10 credits')
WHERE slug = 'socialmate-credit-system';

UPDATE blog_posts SET content = REPLACE(content,
  'Hashtag suggestions: 1 credit',
  'Hashtag suggestions: 5 credits')
WHERE slug = 'socialmate-credit-system';

UPDATE blog_posts SET content = REPLACE(content,
  'Content Repurposer</strong> — reformats existing content for LinkedIn, 5 credits',
  'Content Repurposer</strong> — reformats existing content for LinkedIn, 10 credits')
WHERE slug = 'linkedin-ai-content-tools-2026';

UPDATE blog_posts SET content = REPLACE(content,
  'Content Repurposer (5 credits)',
  'Content Repurposer (10 credits)')
WHERE slug = 'linkedin-repurpose-content-strategy';

UPDATE blog_posts SET content = REPLACE(content,
  '**SocialMate Repurpose Tool (1 credit):**',
  '**SocialMate Repurpose Tool (10 credits):**')
WHERE slug = 'ai-social-media-tools-2026';

UPDATE blog_posts SET content = REPLACE(content,
  '**SocialMate Hashtag Generator (1 credit):**',
  '**SocialMate Hashtag Generator (5 credits):**')
WHERE slug = 'ai-social-media-tools-2026';

UPDATE blog_posts SET content = REPLACE(content,
  'SocialMate''s AI repurpose feature (1 credit per repurpose)',
  'SocialMate''s AI repurpose feature (10 credits per repurpose)')
WHERE slug = 'social-media-automation-small-business';

UPDATE blog_posts SET content = REPLACE(content,
  'SocialMate hashtag generator (1 credit per use)',
  'SocialMate hashtag generator (5 credits per use)')
WHERE slug = 'social-media-automation-small-business';

UPDATE blog_posts SET content = REPLACE(content,
  'Hootsuite covers more platforms (Instagram, Facebook, Pinterest, YouTube) that SocialMate is still working toward. If Instagram/Facebook scheduling is essential to your workflow right now, Hootsuite or Buffer is the right call.',
  'Hootsuite covers more platforms (Instagram, Facebook, Pinterest, YouTube) that SocialMate does not support. Instagram and Facebook need Meta''s app review, which has not started; Pinterest declined SocialMate''s application. If any of those matter to your workflow right now, Hootsuite or Buffer is the right call.')
WHERE slug = 'hootsuite-alternative-with-tiktok-linkedin';

UPDATE blog_posts SET content = REPLACE(content,
  '- Instagram and Facebook scheduling (Meta API — SocialMate coming)',
  '- Instagram and Facebook scheduling (needs Meta''s app review, not started)')
WHERE slug = 'hootsuite-alternative-with-tiktok-linkedin';

UPDATE blog_posts SET content = REPLACE(content,
  '[socialmate.studio/soma/projects](https://socialmate.studio/soma/projects)',
  '[socialmate.studio/soma/dashboard](https://socialmate.studio/soma/dashboard)')
WHERE slug = 'soma-projects-multiple-brands';

-- Sanity check before committing: every row here should say true. false means
-- that post's content changed since this file was written and the matching
-- UPDATE above did nothing -- ROLLBACK and re-check it instead of committing
-- a partial fix.
SELECT slug,
  content LIKE '%Write caption: 5 credits%'
  AND content LIKE '%Repurpose post: 10 credits%'
  AND content LIKE '%Hashtag suggestions: 5 credits%'
FROM blog_posts WHERE slug = 'socialmate-credit-system'
UNION ALL
SELECT slug, content LIKE '%10 credits%' FROM blog_posts WHERE slug = 'linkedin-ai-content-tools-2026'
UNION ALL
SELECT slug, content LIKE '%Content Repurposer (10 credits)%' FROM blog_posts WHERE slug = 'linkedin-repurpose-content-strategy'
UNION ALL
SELECT slug, content LIKE '%Repurpose Tool (10 credits)%' AND content LIKE '%Hashtag Generator (5 credits)%' FROM blog_posts WHERE slug = 'ai-social-media-tools-2026'
UNION ALL
SELECT slug, content LIKE '%10 credits per repurpose%' AND content LIKE '%5 credits per use%' FROM blog_posts WHERE slug = 'social-media-automation-small-business'
UNION ALL
SELECT slug, content LIKE '%not started%' AND content NOT LIKE '%SocialMate coming%' FROM blog_posts WHERE slug = 'hootsuite-alternative-with-tiktok-linkedin'
UNION ALL
SELECT slug, content LIKE '%soma/dashboard%' FROM blog_posts WHERE slug = 'soma-projects-multiple-brands';

COMMIT;
