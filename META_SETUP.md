# Instagram + Facebook (Meta) setup

The code for Instagram and Facebook Page posting is in place (`lib/meta.ts`,
`lib/publish/instagram.ts`, `lib/publish/facebook.ts`, `app/api/accounts/instagram`,
`app/api/accounts/facebook`, `app/api/meta`, `app/meta/data-deletion`). It stays
hidden from the public until Meta approves the app. Until then only the admin
sees the Instagram and Facebook cards on /accounts.

## 1. Meta app (developers.facebook.com)

- Business portfolio: **Gilgamesh Enterprise LLC** (created Nov 17, 2026).
- Create app: type **Business**, name **SocialMate**, portfolio Gilgamesh Enterprise LLC.
- App settings → Basic:
  - App icon: `public/logo.png` (1024 x 1024)
  - Privacy policy URL: `https://socialmate.studio/privacy`
  - Terms of service URL: `https://socialmate.studio/terms`
  - User data deletion: **Data deletion instructions URL** `https://socialmate.studio/meta/data-deletion`
    (or **Data deletion callback URL** `https://socialmate.studio/api/meta/data-deletion`)
  - Category: Business and pages
- Add product **Instagram** → API setup with Instagram login:
  - Copy the **Instagram app ID** and **Instagram app secret** (these are different from the Facebook app ID/secret)
  - Business login settings → OAuth redirect URI: `https://socialmate.studio/api/accounts/instagram/callback`
  - Deauthorize callback URL: `https://socialmate.studio/api/meta/deauthorize`
  - Data deletion request URL: `https://socialmate.studio/api/meta/data-deletion`
  - Add your own Instagram professional account as an **Instagram tester** (Roles), and accept the invite in Instagram (Settings → Website permissions → Apps and websites → Tester invites)
- Add product **Facebook Login for Business**:
  - Valid OAuth redirect URI: `https://socialmate.studio/api/accounts/facebook/callback`
  - Deauthorize callback URL: `https://socialmate.studio/api/meta/deauthorize`
  - Data deletion request URL: `https://socialmate.studio/api/meta/data-deletion`
  - Create a **configuration** (login variation "General", token type "User access token") with the permissions
    `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, and copy its **Configuration ID**

## 2. Vercel environment variables (Production)

| Name | Value |
|---|---|
| `META_APP_ID` | Facebook app ID (App settings → Basic) |
| `META_APP_SECRET` | Facebook app secret |
| `INSTAGRAM_APP_ID` | Instagram app ID (Instagram → API setup with Instagram login) |
| `INSTAGRAM_APP_SECRET` | Instagram app secret |
| `META_FB_LOGIN_CONFIG_ID` | Facebook Login for Business configuration ID (optional; without it the scope list is used) |
| `META_GRAPH_VERSION` | optional, defaults to `v25.0` |
| `META_CONNECT_OPEN` | leave unset until App Review passes, then `true` |
| `NEXT_PUBLIC_META_CONNECT_OPEN` | leave unset until App Review passes, then `true` (needs a redeploy) |

Never commit these values. This repo is public.

## 3. Test with your own accounts (works before review)

1. Sign in to SocialMate as the admin and open /accounts. Instagram and Facebook show as connectable for the admin only.
2. Connect Instagram (a Business or Creator account that is an Instagram tester on the app).
3. Connect Facebook and pick a Page you manage.
4. In Compose, post to Instagram with a **JPG** photo, then a 2 to 10 photo carousel, then a short MP4 (posts as a Reel).
5. Post text, one photo, several photos and a video to the Facebook Page.
6. Each permission needs at least one successful API call before it can be submitted for review.

## 4. App Review (Advanced Access)

Request: `instagram_business_basic`, `instagram_business_content_publish`,
`pages_show_list`, `pages_read_engagement`, `pages_manage_posts`.
Business Verification of Gilgamesh Enterprise LLC is required first (Business
settings → Security center; upload the LLC documents yourself).

Use-case text (one per permission, adjust as needed):

- **instagram_business_basic**: SocialMate is a social media scheduler. After a creator connects their Instagram professional account, we read the account ID, username and profile picture to show which account is connected and to publish to it. We do not read messages, comments or insights.
- **instagram_business_content_publish**: Creators write a caption and attach a photo, carousel or video in SocialMate's Compose page, pick a time, and SocialMate publishes it to their Instagram account at that time.
- **pages_show_list**: After Facebook Login, we list the Pages the person manages so they can choose which Pages to connect.
- **pages_read_engagement**: Needed with pages_manage_posts to read the Page name and picture shown on the connected-accounts screen.
- **pages_manage_posts**: People schedule text, photo and video posts in Compose and SocialMate publishes them to the Page they picked at the scheduled time.

Screencast script (one recording per permission is accepted, one longer video covering all also works):

1. Show the SocialMate login, then /accounts.
2. Click Connect on Instagram, show Instagram's login and consent screens, land back on /accounts with the account listed (basic).
3. Open Compose, attach a JPG, write a caption, select Instagram, Post now; open the Instagram app and show the post (content_publish).
4. Click Connect on Facebook, show Facebook's consent and the Page picker, land back with the Page listed (pages_show_list, pages_read_engagement).
5. Compose a post to the Page, Post now, open the Page on Facebook and show it (pages_manage_posts).
6. Show Disconnect on /accounts and the /meta/data-deletion page.

Reviewer test account: create a SocialMate login for the reviewer and give the
credentials in the submission's testing instructions.

## 5. After approval

Set `META_CONNECT_OPEN=true` and `NEXT_PUBLIC_META_CONNECT_OPEN=true` in Vercel and
redeploy. Instagram and Facebook then show as live for everyone on /accounts and
in Compose. Update marketing pages and the platform count separately.
