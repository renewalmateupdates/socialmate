# SocialMate — Google Play Store Setup Guide

This guide walks through getting SocialMate onto Google Play using Capacitor.
The app is a WebView wrapper pointing at `https://socialmate.studio` — no static
export or separate API is needed.

---

## Prerequisites

- [ ] Android Studio installed (free): https://developer.android.com/studio
- [ ] Java 17+ installed (bundled with Android Studio)
- [ ] Google Play Console account ($25 one-time): https://play.google.com/console
- [ ] Node 18+ (already have this)

---

## Step 1 — Install dependencies and init Android

Run these once from the project root:

```bash
npm install
npx cap add android
```

This generates the `android/` directory. **Commit it** after it's generated.

---

## Step 2 — App icons + splash screen

Place these files **before** running `npx cap sync`:

| File | Size | Location |
|------|------|----------|
| `ic_launcher.png` | 192×192 | `android/app/src/main/res/mipmap-xxxhdpi/` |
| `ic_launcher.png` | 144×144 | `android/app/src/main/res/mipmap-xxhdpi/` |
| `ic_launcher.png` | 96×96  | `android/app/src/main/res/mipmap-xhdpi/` |
| `ic_launcher.png` | 72×72  | `android/app/src/main/res/mipmap-hdpi/` |
| `ic_launcher.png` | 48×48  | `android/app/src/main/res/mipmap-mdpi/` |
| `ic_launcher_round.png` | same sizes | same folders |
| `splash.png` | 2732×2732 | `android/app/src/main/res/drawable/` |

**Tip:** Use https://capacitorjs.com/docs/guides/splash-screens-and-icons or
the `@capacitor/assets` tool to auto-generate all sizes from a single 1024×1024 PNG:

```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --android
```

(Place your 1024×1024 source at `assets/icon.png` and `assets/splash.png`.)

---

## Step 3 — Sync web assets

```bash
npx cap sync android
```

---

## Step 4 — Open Android Studio

```bash
npx cap open android
# or: npm run cap:android
```

In Android Studio:
- Let Gradle sync finish
- Go to **Build → Generate Signed Bundle / APK**
- Choose **Android App Bundle (.aab)** (required for Play Store)

---

## Step 5 — Create a keystore (one time only)

```bash
keytool -genkey -v \
  -keystore socialmate-release.jks \
  -alias socialmate \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Store this file and the passwords somewhere safe. If you lose it, you can never
update the app on the Play Store.**

Set environment variables (or use Android Studio's signing config UI):
```
KEYSTORE_PATH=./socialmate-release.jks
KEYSTORE_ALIAS=socialmate
KEYSTORE_PASSWORD=your-password
```

---

## Step 6 — Build the release AAB

In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**
Select your keystore → Build.

Output: `android/app/release/app-release.aab`

---

## Step 7 — Google Play Console

1. Go to https://play.google.com/console
2. **Create app** → App name: "SocialMate" → Default language: English (US)
3. App category: **Productivity**
4. Fill in store listing:
   - Short description (80 chars): "Free social media scheduler — post to 16 platforms with AI tools"
   - Full description: use the /monetize landing copy or pitch deck content
   - Screenshots: at least 2 phone screenshots (use Chrome DevTools device mode on socialmate.studio)
   - Feature graphic: 1024×500 PNG (create in Canva)
5. Content rating questionnaire → complete it (SocialMate is Everyone)
6. Target audience: 18+
7. Go to **Production** → **Create new release** → Upload `.aab` file
8. Roll out to production (or start with 10% rollout)

---

## App ID

`studio.socialmate.app` — matches `capacitor.config.ts` and must match `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "studio.socialmate.app"
        ...
    }
}
```

---

## Updates

After every deploy to `https://socialmate.studio`, the Play Store app automatically
picks up changes because it's a WebView — **no new Play Store release needed**.

Only release a new version to the Play Store when:
- Native Capacitor plugins are added/updated
- `capacitor.config.ts` changes
- Android manifest or permissions change

---

## Useful commands

```bash
npm run cap:sync       # sync after config changes
npm run cap:android    # open Android Studio
npx cap run android    # run on connected device / emulator
```
