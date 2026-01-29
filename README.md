# X Post Card Builder

Transform public X (Twitter) posts into **beautiful, customizable visual cards**—no API keys, no login. Built for designers who want full **aesthetic control** (theme, radius, shadows) and **reliable export**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg)](https://nextjs.org/)

## ✨ Features

- **📥 Import** — Paste any public `x.com/.../status/...` URL to load the post
- **🎨 Customize** — Resize width and corner radius; switch light/dim/dark themes; set shadow intensity (flat → elevated)
- **💾 Export** — Download high-quality PNG (2× resolution) for social or docs
- **🔗 Share** — Copy a link that preserves your settings; share page matches your theme and layout
- **♿ Accessible** — WCAG 2.1–aligned, reduced motion supported

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/x-post-visualizer.git
cd x-post-visualizer

# Install dependencies
cd web
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

1. Import the repository into Vercel as a **Next.js** project
2. Set the **Root Directory** to `web`
3. Deploy

That's it! The UI and API routes ship together.

## How it works

- **Scraping** — X’s syndication endpoints (`cdn.syndication.twimg.com`) with tokenized request + HTML embed fallback; no API keys.
- **Image proxy** — Remote media via `web/app/api/image` for same-origin loading and reliable PNG export.

## Local development

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

**Dev scripts:** `npm run dev` starts the Next.js dev server (default bundler). Use `npm run dev:turbo` for Turbopack.

## 📁 Project Structure

```
web/
  app/
    api/
      scrape-post/route.ts   # POST /api/scrape-post
      image/route.ts         # GET  /api/image?url=...
    share/                   # Share page (URL-driven settings)
  components/                # React components
  hooks/                     # Custom React hooks
  lib/                       # Utilities, themes, API client
  types/                     # TypeScript type definitions
  constants/                 # UI constants (animations, card settings)
```

## 📚 Documentation

- [`PRODUCT.md`](./PRODUCT.md) – Full product specification
- [`THEMES.md`](./THEMES.md) – Design system and theme documentation
- [`QUICKSTART.md`](./QUICKSTART.md) – Fastest path to run + deploy
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) – Contribution guidelines

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code style and conventions
- Development workflow
- Pull request process
- Reporting issues

## Tech & License

- [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [html2canvas](https://github.com/niklasvh/html2canvas). Deploy anywhere (e.g. [Vercel](https://vercel.com/)).
- **License:** MIT — see [LICENSE](./LICENSE).

---

**[John Cafazza](https://github.com/johncafazza)** · X Post Card Builder
