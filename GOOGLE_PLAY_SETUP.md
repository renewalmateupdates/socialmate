# SocialMate — Google Play Store Setup Guide

The app is a Capacitor WebView wrapper pointing at `https://socialmate.studio`.
No static export or separate API is needed — deploy to Vercel as normal,
Play Store users automatically get the latest version.

**Build approach: GitHub Actions CI/CD — no Android Studio required locally.**

---

## Overview

| Step | Where it runs | One-time? |
|------|--------------|-----------|
| Generate `android/` directory | Your machine (just needs Node) | ✅ Once |
| Create & store keystore | Your machine | ✅ Once |
| Add GitHub Secrets | GitHub.com | ✅ Once |
| Build + sign AAB | GitHub Actions (cloud) | On every tagged release |
| Upload AAB to Play Store | GitHub Actions (optional) or manual | Per release |

---

## Step 1 — Generate the Android project (one time, no Android Studio needed)

You need Node 18+ and Capacitor CLI. Run from the project root:

```bash
npm install
npx cap add android
npx cap sync android
```

This generates the `android/` directory from Capacitor's templates. No Android SDK needed for this step.

After it finishes:
```bash
git add android/
git commit -m "chore: add Capacitor Android project"
git push
```

---

## Step 2 — Add signing config to build.gradle (one time)

Open `android/app/build.gradle` and add the keystore config:

```gradle
// At the top of the file, after the first line:
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystorePropertiesFile.withInputStream { keystoreProperties.load(it) }
}

android {
    // ... existing config ...

    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'] ?: '../socialmate-release.jks')
            storePassword keystoreProperties['storePassword'] ?: System.getenv('KEYSTORE_PASSWORD')
            keyAlias keystoreProperties['keyAlias'] ?: System.getenv('KEYSTORE_ALIAS')
            keyPassword keystoreProperties['keyPassword'] ?: System.getenv('KEY_PASSWORD')
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

Commit this change:
```bash
git add android/app/build.gradle
git commit -m "chore: configure release signing in build.gradle"
git push
```

---

## Step 3 — Create a release keystore (one time, keep forever)

Run this from the project root (needs Java, which is free):

```bash
keytool -genkey -v \
  -keystore socialmate-release.jks \
  -alias socialmate \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Fill in the prompts (name, org, etc). Remember the passwords you set.

**CRITICAL: Back this file up somewhere safe (Google Drive, password manager, etc.).
If you lose the keystore, you can NEVER update the app on the Play Store. You'd have to
create a new app listing from scratch.**

Do NOT commit `socialmate-release.jks` to git. It's in `.gitignore` already.

---

## Step 4 — Add GitHub Secrets

Convert the keystore to base64 for GitHub:

```bash
# On Mac/Linux:
base64 -i socialmate-release.jks | tr -d '\n'

# On Windows PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("socialmate-release.jks"))
```

Copy that output. Then go to:
**GitHub → Settings → Secrets and variables → Actions → New repository secret**

Add these 4 secrets:

| Secret name | Value |
|---|---|
| `KEYSTORE_BASE64` | base64 output from above |
| `KEYSTORE_PASSWORD` | the keystore password you set |
| `KEYSTORE_ALIAS` | `socialmate` (the alias you used) |
| `KEY_PASSWORD` | the key password (same or different from keystore password) |

---

## Step 5 — Trigger a build

The workflow triggers on any tag starting with `v`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Go to **GitHub → Actions → Android Release Build** to watch it run.

When it finishes, download the `.aab` file from the workflow artifacts.

---

## Step 6 — Google Play Console

1. Go to https://play.google.com/console
2. Pay the one-time $25 developer fee
3. **Create app** → App name: "SocialMate" → Default language: English (US)
4. App category: **Productivity**
5. Fill in the store listing:
   - Short description (80 chars max): `Free social media scheduler — TikTok, Bluesky, Discord & more with AI tools`
   - Full description: Use the landing page pitch or `/story` page content
   - Screenshots: at least 2 phone screenshots (use Chrome DevTools device mode on socialmate.studio, then screenshot)
   - Feature graphic: 1024×500 PNG — make in Canva, use SocialMate brand colors
6. Content rating: complete the questionnaire → SocialMate is **Everyone**
7. Target audience: 13+
8. **Production → Create new release → Upload .aab**
9. Release notes: "SocialMate is now on Android. Schedule to 6 platforms, use 12 AI tools, and manage your content — free."
10. Roll out to **Internal testing** first (just you), then promote to production once tested

---

## App ID

`studio.socialmate.app` — matches `capacitor.config.json`. This is permanent once submitted to Play Store.

---

## Updates after this

**For normal feature updates:** Deploy to Vercel as usual. The Play Store app is a WebView — it automatically shows the latest version. **No new Play Store release needed.**

**For a new Play Store release (only needed when):**
- Native Capacitor plugins are added or changed
- `capacitor.config.json` changes
- Android permissions change
- Major version bump for store optics

To release: `git tag v1.1.0 && git push origin v1.1.0` → build runs → download AAB → upload to Play Console.

---

## Optional: Auto-upload to Play Store from GitHub Actions

Uncomment the last step in `.github/workflows/android-release.yml` and add:

```
PLAY_STORE_SERVICE_ACCOUNT_JSON = { ... }
```

as a GitHub Secret. To get this:
1. Go to Google Play Console → Setup → API access
2. Link to a Google Cloud project
3. Create a service account with "Release manager" role
4. Download the JSON key → paste the full contents as the secret

---

## Useful local commands (if you ever want to test locally)

```bash
npx cap sync android      # sync after config changes
npx cap open android      # open Android Studio (if installed)
npx cap run android       # run on connected device / emulator
```
