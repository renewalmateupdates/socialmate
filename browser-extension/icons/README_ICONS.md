# Extension Icons

Chrome Manifest V3 requires PNG icons at 16x16, 48x48, and 128x128 pixels.

## How to generate from logo.png

1. Copy `public/logo.png` from the repo root to this directory.
2. Run one of the commands below (requires ImageMagick or similar):

```bash
# Using ImageMagick
convert ../../../public/logo.png -resize 16x16 icon16.png
convert ../../../public/logo.png -resize 48x48 icon48.png
convert ../../../public/logo.png -resize 128x128 icon128.png
```

Or use an online converter (e.g. https://redketchup.io/icon-resizer) to produce:
- `icon16.png`  — 16 x 16 px
- `icon48.png`  — 48 x 48 px
- `icon128.png` — 128 x 128 px

Place all three files in this `icons/` directory.

## Placeholder fallback

Until real icons are added, Chrome will show a generic grey puzzle-piece icon.
The extension still works — icons are cosmetic only.
