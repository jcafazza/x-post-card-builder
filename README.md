# X Post Card Builder

Transform public X (Twitter) posts into beautiful, customizable visual cards. Built for designers who want **aesthetic control** (theme, radius, shadows) and **reliable export**.

## Features

- **Import**: Paste any public `x.com/.../status/...` URL.
- **High-fidelity rendering**: Avatars + media are fetched server-side and proxied for same-origin loading.
- **Tactile customization**: Drag to resize width and corner radius, toggle timestamp, switch themes and shadows.
- **Export**: Download a crisp PNG using `html2canvas`.
- **Share**: Generate a view-only share URL that preserves theme + settings.

## How it works (reliability-first)

- **Scraping**: Uses Twitter’s syndication endpoints (`cdn.syndication.twimg.com`) with a tokenized request, plus an HTML embed fallback.
- **Image proxy**: All remote media is served through `web/app/api/image` to avoid CORS issues and make export consistent.

## Local development

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

```
web/
  app/
    api/
      scrape-post/route.ts   # POST /api/scrape-post
      image/route.ts         # GET  /api/image?url=...
    share/                   # Share page (URL-driven settings)
  components/                # Card + controls
  lib/                       # themes, export, helpers
  types/                     # Post + settings types
```

## Docs

- `PRODUCT.md` – product spec (kept concise, implementation-aware)
- `THEMES.md` – design system notes
- `QUICKSTART.md` – fastest path to run + deploy

## License

MIT © John Cafazza
