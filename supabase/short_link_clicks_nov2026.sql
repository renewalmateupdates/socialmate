-- Short link clicks, counted in one statement (Nov 2026, campaign link tracking).
--
-- /go/[slug] used to read a link's click count and write count + 1, so two
-- clicks landing together counted once. Campaign links now go through /go, so
-- this counts and returns the target in one atomic UPDATE.
--
-- Run once in the Supabase SQL editor. Until it runs, /go falls back to the old
-- read-then-write (it checks for PGRST202), so nothing breaks either way.
-- Only the service role (the /go route) may call it.

CREATE OR REPLACE FUNCTION public.increment_short_link_clicks(p_slug text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE short_links
     SET clicks = clicks + 1
   WHERE slug = p_slug
  RETURNING original_url;
$$;

REVOKE ALL ON FUNCTION public.increment_short_link_clicks(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_short_link_clicks(text) TO service_role;

-- Tell PostgREST about the new function now rather than at its next reload.
NOTIFY pgrst, 'reload schema';

-- Check: should return one row, true.
SELECT has_function_privilege('service_role', 'public.increment_short_link_clicks(text)', 'execute') AS service_role_can_call;
