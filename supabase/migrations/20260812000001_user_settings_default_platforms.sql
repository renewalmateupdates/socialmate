-- user_settings.default_platforms has been referenced by four code paths since
-- it was built, and has never existed.
--
-- The column was created on `workspaces` instead. Everything written against
-- `user_settings` therefore fails, and because Postgres rejects the whole
-- statement on an unknown column, the damage is not limited to this one field:
--
--   app/settings/page.tsx:211   a single select carrying white-label config,
--                               notification prefs, credit preference, IRIS
--                               opt-in, scheduling window and DND. All of it
--                               returns 400, so the Settings page has been
--                               showing defaults regardless of what was saved.
--   app/settings/page.tsx:460   saving default platforms silently fails.
--   app/compose/page.tsx:448    default platforms never pre-select.
--   app/onboarding/page.tsx     the completion upsert 400s, so onboarding_goal,
--                               display_name, iris_opt_in and the +50 credit
--                               completion bonus were never written for anyone.
--
-- The feature is a per-user preference with UI in Settings > Appearance, so the
-- column belongs here. Adding it rather than deleting the four call sites.
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS default_platforms TEXT[] DEFAULT '{}';

COMMENT ON COLUMN user_settings.default_platforms IS
  'Platforms pre-selected in Compose. Set in Settings > Appearance and at onboarding completion.';
