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

## Where it stands (Nov 27, 2026)

- The Threads tester and the app secrets are done: the admin account connected
  Instagram, Facebook and Threads on Nov 17, and published one post to each.
  So every permission below has had a real, successful call. Meta's review page
  shows that per permission; if it says a call is missing or too old, post once
  more to each platform from the admin account, then submit.
- The privacy policy names each permission and what it's used for, and
  `/meta/data-deletion`, `/privacy` and `/terms` all answer 200.
- **What blocks the submission:** the business portfolio is unverified, and
  Advanced Access needs Business Verification first. Meta for Developers was
  signed out in Joshua's Chrome on Nov 27.

## Who does what

**Only Joshua** (sign-ins, legal documents, terms and money stay his):
1. Sign in at developers.facebook.com: "Continue with Facebook", then his password
   and two-factor code.
2. Business Verification (below): enter the business details and upload one
   document.
3. Accept any terms Meta shows.
4. Record the screencast (below; about 10 minutes).
5. Type the reviewer test login's password into the testing instructions.
6. Okay the final Submit.

**Claude, in Joshua's Chrome, once he is signed in:**
- read the App Review page;
- request Advanced Access for the eight permissions and paste each use case;
- upload his recording;
- fill in the data handling answers and the testing instructions (without the
  password);
- check App settings → Basic and the app mode;
- stop before Submit.
- If Meta offers domain verification by meta tag, Claude adds the tag to
  socialmate.studio in a PR.

## Business Verification

business.facebook.com/settings → the **Gilgamesh Enterprise LLC** portfolio →
Security center → Start verification.

- **Legal name:** exactly "Gilgamesh Enterprise LLC", the way it appears on the
  document. The address and phone you enter should match the document too.
- **One document** that shows the legal name (and ideally the address):
  - the Wyoming Articles of Organization;
  - the IRS EIN letter (CP 575 or 147C);
  - a Mercury bank statement;
  - or a utility bill.
- **How Meta confirms it:** an email at the business's own domain, a phone
  call or text, or domain verification (a DNS record, or a meta tag Claude can
  add).
- Meta usually decides within days, sometimes up to two weeks.

## Data handling answers (drafts; Joshua confirms each)

- **Processors with access to Platform Data:** Yes.
  - Supabase: the database that stores access tokens, account IDs, usernames,
    profile pictures and scheduled posts.
  - Vercel: hosting, and the server functions that call Meta's APIs.
- **Responsible entity:** Gilgamesh Enterprise LLC, United States.
- **Platform Data given to public authorities for national security requests
  in the last 12 months:** No.
- **Policies on requests from public authorities:** tick only what you will
  actually do. Suggested:
  - review a request's legality;
  - challenge one that isn't lawful;
  - data minimization (SocialMate keeps only what posting needs);
  - keep a record of any request.

## Testing instructions for the reviewer (paste, then add the password)

```
SocialMate (https://socialmate.studio) is a social media scheduler: people write a post once and SocialMate publishes it to their connected accounts at the time they choose.

1. Log in at https://socialmate.studio/login with the test account below.
2. Open Accounts in the left sidebar. Under Instagram, press Connect, sign in, and choose an Instagram professional account. Do the same for Facebook (pick a Page) and Threads.
3. Open Compose. Attach a JPG image, write a caption, tick Instagram, the Facebook Page and Threads, and press Post now. Each post appears on its account within about a minute.
4. Accounts shows each connected account's name and picture, and Disconnect removes it. https://socialmate.studio/meta/data-deletion explains how to delete your data.

Test login: email ______ / password ______
```

The test login's email must be in `META_REVIEWER_EMAILS` (Vercel), or it can't
connect before approval.

## Recording the screencast on Windows

- Press Win+Shift+R (Snipping Tool's screen recorder), drag over the browser
  window, and press Start. It saves an MP4. Xbox Game Bar (Win+Alt+R) also
  works and records the active window.
- Follow the script under App Review below. One video covering everything is
  accepted.
- Disconnect each account first, so the recording shows the full Meta login and
  consent.
- Show each post on Instagram, Facebook and Threads after Post now.

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
| `META_REVIEWER_EMAILS` | the SocialMate login email(s) given to Meta's reviewers, comma-separated. Those logins can connect before approval, and `lib/internal-accounts.ts` keeps them out of customer counts and emails. Remove after approval, and delete those logins at the same time, or they count as customers again. |
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
