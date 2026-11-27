# YouTube setup: Google's two reviews

The code for YouTube posting is in place (`lib/youtube.ts`,
`lib/publish/youtube.ts`, `app/api/accounts/youtube`). It uploads the video
attached to a post with videos.insert, titled with the post's first line and
described with the whole post. The admin account connected YouTube on Nov 18,
2026 and published one video.

Two separate Google reviews stand between that and everyone:

1. **Google OAuth verification.** Until it passes, only the project's test users
   can sign in, so the connect button is limited to the admin and reviewer
   logins (`canConnectYouTube` in `lib/review-access.ts`).
2. **YouTube API Services audit.** Until it passes, YouTube locks every video
   uploaded through the project to Private. The project's quota also stays at
   10,000 units a day, and each upload costs 1,600, so about 6 uploads a day for
   the whole app.

## The project

- Google Cloud project **socialmate-youtube-engine**, owner
  **socialmatehq@gmail.com**. Both reviews have to be done signed in as that
  account.
- Scopes: `youtube.readonly` (the channel's ID, title and thumbnail, to show
  which channel is connected) and `youtube.upload` (uploading the videos people
  schedule). Both are sensitive scopes, not restricted ones, so no paid security
  assessment is needed.
- The privacy policy already has what Google checks:
  - the YouTube API Services line and a link to YouTube's Terms of Service;
  - Google's privacy policy;
  - each scope and what it's for;
  - the Limited Use statement (the API Services User Data Policy).

## Who does what

**Only Joshua:**
- Sign in to Chrome as socialmatehq@gmail.com: add the account, with its
  password and two-factor code.
- Record the demo video and upload it to YouTube as unlisted.
- Accept any terms Google shows.
- Okay each final Submit.

**Claude, in Joshua's Chrome, once he is signed in:**
- check Google Auth Platform's branding, audience, data access and domain
  pages;
- fill in the scope justifications and the audit form;
- confirm socialmate.studio is verified in Search Console (if it needs a meta
  tag, Claude adds it in a PR);
- stop before each Submit.

## 1. Google OAuth verification

console.cloud.google.com → project socialmate-youtube-engine → Google Auth
Platform.

- **Branding:**
  - app name SocialMate;
  - support email socialmatehq@gmail.com;
  - logo `public/logo.png`;
  - home page https://socialmate.studio;
  - privacy https://socialmate.studio/privacy;
  - terms https://socialmate.studio/terms;
  - authorized domain `socialmate.studio`;
  - developer contact socialmatehq@gmail.com.
- **Authorized domain ownership:** socialmate.studio must be verified in Google
  Search Console by an owner of the project (socialmatehq@gmail.com).
- **Audience:** External, publishing status "In production" (not Testing).
- **Data Access:** the two scopes, with these justifications:

```
youtube.upload: SocialMate is a social media scheduler. When a creator schedules a video in SocialMate, we upload it to the channel they connected, at the time they picked, with the title and description they wrote. We never change or delete existing videos.
```

```
youtube.readonly: After a creator connects YouTube, we read the channel's ID, title and thumbnail once, to show which channel is connected on the Accounts page. We don't read their videos, comments or analytics.
```

- **Demo video** (unlisted on YouTube, in English):
  1. Sign in to SocialMate and open Accounts.
  2. Press Connect on YouTube. Google's consent screen shows the app name, and
     the address bar shows the `client_id`. Google checks both, so keep the
     address bar in view.
  3. Back on Accounts, the channel shows its name and thumbnail
     (`youtube.readonly`).
  4. In Compose, attach a short MP4, write the first line as the title, tick
     YouTube and press Post now.
  5. Open YouTube Studio and show the uploaded video (`youtube.upload`).
  6. Press Disconnect on Accounts.
- Then go to Verification Center and press Submit for verification. Google
  usually answers in a few days to a few weeks, by email to socialmatehq@gmail.com.

## 2. YouTube API Services audit

The form: https://support.google.com/youtube/contact/yt_api_form ("YouTube API
Services - Audit and Quota Extension"). It asks for:
- the project number;
- what SocialMate does with the API;
- how people sign in and revoke access (Disconnect on Accounts, and
  https://myaccount.google.com/permissions);
- the links to the privacy policy and terms;
- screenshots or the same demo video.

Passing it lifts the Private lock and is where to ask for more quota.

## After both pass

- Set `YOUTUBE_CONNECT_OPEN=true` and `NEXT_PUBLIC_YOUTUBE_CONNECT_OPEN=true` in
  Vercel, then redeploy.
- Remove the reviewer logins from `YOUTUBE_REVIEWER_EMAILS`.
- YouTube moves from `SOON_PLATFORMS` to live in `lib/site-facts.ts`; update
  the pages that count platforms in the same PR.
