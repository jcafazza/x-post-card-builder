# X Post Card Builder - Product Specification

## Product Overview
A web application that transforms X (Twitter) posts into beautiful, customizable visual cards. Users can paste any X post URL, customize the card design, and export as PNG or copy embed code for use on their websites.

## Target Users
- Designers
- Content creators
- Personal brand builders
- Anyone wanting aesthetically pleasing X post embeds on their website

## Core Value Proposition
Unlike existing tools that focus on screenshot generation for social sharing, this tool provides granular design control for creating embeddable X post cards that match a website's brand aesthetic.

## Key Differentiators
- Focus on UI representation and design customization
- Web component embed option (not just static images)
- Granular control over card styling (radius, colors, spacing, shadows)
- Clean, simple workflow with no account required

---

## User Workflow

1. **Paste X Post URL** - User pastes link to any public X post
2. **Customize Design** - Adjust card appearance using controls
3. **Export** - Download PNG OR copy web component embed code

---

## Feature Requirements

### MVP Features

#### Input
- Text input field for X post URL
- Parse and validate X post URLs
- Server-side scraping of post content (no X API required)

#### Customization Controls
**Toggle Options:**
- Creation date/timestamp - on/off

**Design Controls:**
- Theme selection (dropdown): "light", "dim", "dark"
- Card border radius (dropdown): 0px, 8px, 16px, 20px, 24px
- Drop shadow intensity (dropdown): flat, raised, floating, elevated

#### Post Content Display
- Author avatar
- Author display name
- Author handle (@username)
- Post text content
- Attached images (if present)
- Timestamp (conditionally shown)

#### Export Options

**Option 1: PNG Export (MVP)**
- Download card as high-quality PNG image
- Optimized for web use
- Implemented using `html2canvas` in the web app
- Captures the preview card frame and converts to downloadable image

**Option 2: Embed Code (Phase 2 - Post-MVP)**
- Web component implementation (separate package / distribution)
- Copy-to-clipboard functionality added to the app UI
- Usage format: `<x-card url="[post-url]" theme="..." radius="..."></x-card>`
- Lightweight JavaScript library hosted on CDN
- Customizable via component attributes
- App provides the UI to generate and copy embed code
- Web component built separately, tested, and deployed to CDN

**MVP Focus:** Start with PNG export only. This keeps the 2-3 day timeline realistic and gets a working product shipped. Web component can be added as v2.

---

## Technical Architecture

### Frontend (Next.js)
- Single Next.js app (App Router) for UI + share page
- Theme/motion constants centralized for design consistency

### Backend/Scraping (Next.js API Routes)
- Server-side routes ship with the app (Vercel Functions)
- Endpoint: `POST /api/scrape-post`
- Accepts an X post URL in the request body
- Returns JSON with parsed post data:
  ```json
  {
    "author": {
      "name": "Display Name",
      "handle": "@username",
      "avatar": "url"
    },
    "content": {
      "text": "Post content...",
      "images": ["url1", "url2"]
    },
    "timestamp": "2024-01-15T12:00:00Z"
  }
  ```
- Primary data source: Twitter syndication endpoints + HTML embed fallback
- Image proxy route: `GET /api/image?url=...` for CORS-safe media + reliable export
- Error handling for deleted/protected posts
- Rate limiting to prevent abuse

### PNG Export (Web)
- Use `html2canvas` client-side to capture the card preview
- Proxy media via `/api/image` to avoid canvas tainting (CORS)

### Web Component (Phase 2 - Post-MVP)
- Build separately from the app UI
- Host on CDN (jsDelivr, unpkg, or custom)
- Web component calls the same scraping API endpoint
- Custom element: `<x-card>`
- Props/attributes for customization

### Preset Templates
- Ship 1-2 presets directly in the app UI
- Users can customize from preset starting points

---

## User Experience Considerations

### Stateless & Anonymous
- No user accounts required
- No login/signup
- Each session is independent
- No saved designs (for MVP)

### Performance
- Fast load times
- Quick scraping/parsing
- Instant preview updates as user adjusts settings
- Efficient PNG export generation

### Error Handling
- Invalid URL detection
- Deleted post warnings
- Protected/private post handling
- Network error messaging

---

## Visual Design Principles

### Card Aesthetics
- Clean, modern design
- Professional appearance
- Customizable enough to match various brand styles
- Default design should look great out-of-box

### Interface Design
- Simple, intuitive controls
- Live preview dominates the viewport
- Controls panel (sidebar or below preview)
- Clear visual hierarchy
- Minimal friction workflow

---

## Out of Scope (Future Considerations)

- Font selection/typography controls
- Custom avatars/handles for mockups
- Gradient backgrounds
- Mobile/desktop preview toggle
- Save/share preset styles
- User accounts
- Dark mode toggle
- Batch processing multiple posts
- Advanced animation effects
- Integration with design tools (Figma, etc.)

---

## Technical Constraints & Considerations

### Scraping Brittleness
- X's HTML structure may change
- Plan for maintenance/updates to scraper logic
- Consider fallback handling

### CORS & Security
- Server-side scraping prevents client-side CORS issues
- Proxy endpoint for web component data fetching
- No exposed API keys (since not using X API)

### Web Component Browser Support
- Ensure compatibility with modern browsers
- Consider polyfills if needed
- Lightweight bundle size is critical

---

## Success Metrics (Post-Launch)

- PNG exports per session
- Embed code copies per session
- Average customization time
- Bounce rate vs completion rate
- Most-used customization features

---

## Development Timeline

**Target: 2–3 days**

### Day 1: Core experience
- UI shell + theme system
- `/api/scrape-post` endpoint (syndication JSON + HTML embed fallback)
- `/api/image` proxy for reliable media + export
- Card rendering for text + images

### Day 2: Polish + sharing
- Export (PNG) via `html2canvas`
- Share page that reads settings from URL params
- Edge-case hardening (long posts, missing media, protected posts)
- Deployment to Vercel

### Phase 2: Embeds
- Standalone `<x-card>` web component package + CDN distribution
- “Copy embed code” UX in the app

---

## Tech Stack

### Frontend
- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS**
- **Base UI**
- **Framer Motion** (micro-interactions)

### Backend (API Routes)
- **Next.js Route Handlers** (Vercel Functions, Node.js runtime)
- Tokenized requests to Twitter syndication endpoints + HTML fallback
- Same-origin image proxy for CORS-safe rendering/export

### Libraries/Dependencies
- **html2canvas** (PNG export)

### Hosting
- **Vercel** (web app + API routes)
- **CDN** (web component in Phase 2) - jsDelivr or unpkg

---

## Reference Inspiration

- **BrandBird Tweet to Image Tool**: https://www.brandbird.app/tools/tweet-to-image
  - Reference for theme controls and execution quality
  - Execution quality benchmark
  - BUT: We focus more on embeddable cards with design control vs screenshot sharing

---

## Final Notes

- Keep it simple for MVP
- Focus on execution quality (visual polish)
- Scraping is fine for MVP; can add API later if needed
- Web component is the differentiator—make it easy to use
- Beautiful defaults matter more than infinite customization
