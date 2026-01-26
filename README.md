# X Post Card Builder

Transform public X (Twitter) posts into beautiful, customizable visual cards. Built for designers who want **aesthetic control** (theme, radius, shadows) and **reliable export**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg)](https://nextjs.org/)

## ✨ Features

- **📥 Import**: Paste any public `x.com/.../status/...` URL to instantly load the post
- **🎨 Customization**: 
  - Drag to resize card width and corner radius
  - Switch between light, dim, and dark themes
  - Adjust shadow intensity (flat, raised, floating, elevated)
  - Toggle timestamp display
- **💾 Export**: Download high-quality PNG images (2x resolution)
- **🔗 Share**: Generate shareable URLs that preserve your customizations
- **♿ Accessible**: WCAG 2.1 compliant with reduced motion support

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Deployed on [Vercel](https://vercel.com/)
- Uses [html2canvas](https://github.com/niklasvh/html2canvas) for PNG export

---

**Made with ❤️ by [John Cafazza](https://github.com/johncafazza)**
