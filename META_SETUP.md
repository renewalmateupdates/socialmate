# Instagram + Facebook + Threads (Meta) setup

The code for Instagram, Facebook Page and Threads posting is in place
(`lib/meta.ts`, `lib/publish/instagram.ts`, `lib/publish/facebook.ts`,
`lib/publish/threads.ts`, `app/api/accounts/instagram`, `app/api/accounts/facebook`,
`app/api/accounts/threads`, `app/api/meta`, `app/meta/data-deletion`). It stays
hidden from the public until Meta approves the app. Until then only the admin
sees the Instagram, Facebook and Threads cards on /accounts.

## What is already set up (Nov 17, 2026)

- Business portfolio **Gilgamesh Enterprise LLC** (ID 1160184956410808). Unverified.
- Meta app **SocialMate**, App ID **3029152627438755**, in that portfolio, with three
  use cases: "Manage messaging & content on Instagram", "Manage everything on your
  Page" and "Access the Threads API". Threads app ID **2185331902357341**.
- App settings → Basic: icon, privacy policy, terms, data deletion instructions URL
  (`https://socialmate.studio/meta/data-deletion`), app domain `socialmate.studio`,
  category Business and pages.
- Instagram uses **Instagram API with Unified Login**. Meta no longer offers
  "Instagram API with Instagram Login" to new apps. Unified Login is Facebook Login
  for Business with an Instagram configuration; the person logs in with Instagram
  or Facebook and picks their Instagram professional account. No Facebook Page needed.
  - Configuration **SocialMate Instagram**, ID **2652776831809492**: system-user
    token, never expires, Instagram account asset required, permissions
    `instagram_basic`, `instagram_content_publish`, `business_management`.
- Facebook Pages configuration **SocialMate Facebook Pages**, ID **1193337396352977**:
  user access token, permissions `pages_show_list`, `pages_read_engagement`,
  `pages_manage_posts`.
- Facebook Login for Business → Settings: redirect URIs
  `https://socialmate.studio/api/accounts/instagram/callback` and
  `https://socialmate.studio/api/accounts/facebook/callback`; deauthorize
  `https://socialmate.studio/api/meta/deauthorize`; data deletion
  `https://socialmate.studio/api/meta/data-deletion`.
- Threads use case → Settings: redirect `https://socialmate.studio/api/accounts/threads/callback`,
  uninstall `https://socialmate.studio/api/meta/deauthorize`, delete
  `https://socialmate.studio/api/meta/data-deletion`. Permissions `threads_basic`,
  `threads_content_publish`.

## Still to do by hand

- **Threads tester**: App roles → Roles → Add people → Threads Tester → your Threads
  username, then accept in Threads (Settings → Account → Website permissions → Invites).
- **App secrets into Vercel** (Meta asks for your password to show them).

## Vercel environment variables (Production)

| Name | Value |
|---|---|
| `META_APP_ID` | `3029152627438755` |
| `META_APP_SECRET` | App settings → Basic → App secret → Show |
| `META_IG_CONFIG_ID` | `2652776831809492` |
| `META_FB_LOGIN_CONFIG_ID` | `1193337396352977` |
| `THREADS_APP_ID` | `2185331902357341` |
| `THREADS_APP_SECRET` | App settings → Basic → Threads app secret → Show |
| `META_GRAPH_VERSION` | optional, defaults to `v26.0` |
| `META_REVIEWER_EMAILS` | the SocialMate login email(s) given to Meta's reviewers, comma-separated. Those logins can connect before approval. Remove after approval. |
| `META_CONNECT_OPEN` | leave unset until App Review passes, then `true` |
| `NEXT_PUBLIC_META_CONNECT_OPEN` | leave unset until App Review passes, then `true` (needs a redeploy) |

App IDs and configuration IDs are not secret. The two secrets are: never commit
them. This repo is public.

## Test with your own accounts (works before review)

1. Sign in to SocialMate as the admin and open /accounts. Instagram, Facebook and Threads show as connectable for the admin only.
2. Connect Instagram: log in, choose the business portfolio and your Instagram Business or Creator account.
3. Connect Facebook and pick a Page you manage.
4. Connect Threads (your profile must be a Threads tester).
5. In Compose, post to Instagram with a **JPG** photo, then a 2 to 10 photo carousel, then a short MP4 (posts as a Reel).
6. Post text, one photo, several photos and a video to the Facebook Page.
7. Post text, a photo, a carousel and a video to Threads.
8. Each permission needs at least one successful API call before it can be submitted for review.

## App Review (Advanced Access)

Request: `instagram_basic`, `instagram_content_publish`, `business_management`,
`pages_show_list`, `pages_read_engagement`, `pages_manage_posts`,
`threads_basic`, `threads_content_publish`.
Business Verification of Gilgamesh Enterprise LLC is required first (Business
settings → Security center; upload the LLC documents yourself).

Use-case text (one per permission, adjust as needed):

- **instagram_basic**: SocialMate is a social media scheduler. After a creator connects their Instagram professional account, we read the account ID, username and profile picture to show which account is connected and to publish to it. We do not read messages, comments or insights.
- **instagram_content_publish**: Creators write a caption and attach a photo, carousel or video in SocialMate's Compose page, pick a time, and SocialMate publishes it to their Instagram account at that time.
- **business_management**: Required by Instagram API with Unified Login to list the Instagram account the creator chose to share (/me/assigned_instagram_accounts). SocialMate does not create, edit or delete anything in the creator's business portfolio.
- **pages_show_list**: After Facebook Login, we list the Pages the person manages so they can choose which Pages to connect.
- **pages_read_engagement**: Needed with pages_manage_posts to read the Page name and picture shown on the connected-accounts screen.
- **pages_manage_posts**: People schedule text, photo and video posts in Compose and SocialMate publishes them to the Page they picked at the scheduled time.
- **threads_basic**: After a creator connects Threads, we read their Threads user ID, username and profile picture to show which account is connected.
- **threads_content_publish**: Creators write a post (with optional photos or a video) in Compose, pick a time, and SocialMate publishes it to their Threads profile at that time.

Screencast script (one recording per permission is accepted, one longer video covering all also works):

1. Show the SocialMate login, then /accounts.
2. Click Connect on Instagram, show the Meta login, the business portfolio and Instagram account choice, land back on /accounts with the account listed (instagram_basic, business_management).
3. Open Compose, attach a JPG, write a caption, select Instagram, Post now; open the Instagram app and show the post (instagram_content_publish).
4. Click Connect on Facebook, show Facebook's consent and the Page picker, land back with the Page listed (pages_show_list, pages_read_engagement).
5. Compose a post to the Page, Post now, open the Page on Facebook and show it (pages_manage_posts).
6. Click Connect on Threads, show Threads' consent screen, land back with the profile listed (threads_basic). Compose a post to Threads, Post now, open Threads and show it (threads_content_publish).
7. Show Disconnect on /accounts and the /meta/data-deletion page.

Reviewer test account: create a SocialMate login for the reviewer and give the
credentials in the submission's testing instructions.

## After approval

Set `META_CONNECT_OPEN=true` and `NEXT_PUBLIC_META_CONNECT_OPEN=true` in Vercel and
redeploy. Instagram, Facebook and Threads then show as live for everyone on
/accounts and in Compose. Update marketing pages and the platform count separately.
