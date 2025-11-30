# PWA Icons Setup

To complete the PWA setup, you need to add the following icon files to the `public` directory:

## Required Icons

1. **icon-192x192.png** - 192x192 pixels
2. **icon-512x512.png** - 512x512 pixels

## Quick Setup

You can generate these icons using online tools:

1. **Favicon.io** - https://favicon.io/favicon-generator/
   - Upload a logo or use text "CH" for Contact Hub
   - Download and rename the files

2. **RealFaviconGenerator** - https://realfavicongenerator.net/
   - Upload your icon
   - Generate all sizes

3. **PWA Asset Generator** - https://github.com/onderceylan/pwa-asset-generator
   - CLI tool for generating all PWA assets

## Manual Creation

If you prefer to create manually:

1. Create a square image (at least 512x512)
2. Use a design tool (Figma, Canva, etc.)
3. Export as PNG:
   - `icon-192x192.png` (192x192)
   - `icon-512x512.png` (512x512)

## Icon Design Tips

- Use a simple, recognizable design
- Ensure it looks good at small sizes
- Use high contrast colors
- Test on both light and dark backgrounds

## Current Status

The manifest.json is configured to use these icons. Once you add the icon files, the PWA will be fully functional.

