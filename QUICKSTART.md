# Quickstart

Get X Post Card Builder running locally, then deploy.

## Local

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Paste a public `x.com/.../status/...` URL to load a post; use the toolbar to customize and export PNG or copy a share link.

## Deploy (Vercel)

1. Import the repo as a **Next.js** project
2. Set **Root Directory** to `web`
3. Deploy

UI and API routes (`/api/scrape-post`, `/api/image`) ship together.
