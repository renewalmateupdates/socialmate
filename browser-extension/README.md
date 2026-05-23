# SocialMate — Save to Drafts (Chrome Extension)

Save any web content to your SocialMate drafts with one click.

## What it does

- Highlight text on any webpage, click the extension icon
- Selected text (or the page title) is pre-filled as your draft content
- Choose which platforms to target (Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, LinkedIn)
- Click **Save to Drafts** — content lands in your SocialMate drafts, ready to schedule

## Install in Developer Mode (local testing)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `browser-extension/` folder from this repo
5. The SocialMate icon appears in your Chrome toolbar

### Icons (required for a clean look)

Before loading, generate icons from the SocialMate logo:

```bash
# From the repo root (requires ImageMagick):
convert public/logo.png -resize 16x16  browser-extension/icons/icon16.png
convert public/logo.png -resize 48x48  browser-extension/icons/icon48.png
convert public/logo.png -resize 128x128 browser-extension/icons/icon128.png
```

Or follow the instructions in `browser-extension/icons/README_ICONS.md`.

Without icons, Chrome shows a grey placeholder — the extension still works.

## Sign in requirement

You must be signed in to [socialmate.studio](https://socialmate.studio) in the same browser profile for the extension to save drafts. If you see "Sign in to SocialMate first", open socialmate.studio, sign in, and try again.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Chrome Manifest V3 config |
| `popup.html` | Extension popup UI |
| `popup.js` | Popup logic (fetch selected text, save draft) |
| `content.js` | Injected into pages — reads selected text + page URL |
| `background.js` | Manifest V3 service worker (install event) |
| `icons/` | PNG icons (16, 48, 128px) |

## Production — Chrome Web Store

Submission checklist:
1. Generate production icons (see above)
2. Zip the `browser-extension/` directory contents (not the folder itself)
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Click **New Item** → upload the ZIP
5. Fill in store listing details
6. Submit for review (typically 1–3 business days)

## API

The extension POSTs to:

```
POST https://socialmate.studio/api/posts/create-draft
Content-Type: application/json
credentials: include

{
  "content": "...",
  "sourceUrl": "https://example.com/article",
  "platforms": ["bluesky", "mastodon", "twitter"]
}
```

Response:
```json
{ "success": true, "postId": "uuid" }
```

---

[socialmate.studio](https://socialmate.studio)
