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
- Drop shadow intensity (dropdown): none, light, medium, strong

#### Post Content Display
- Author avatar
- Author display name
- Author handle (@username)
- Post text content
- Attached images (if present)
- Timestamp (conditionally shown)

#### Export Options

**Option 1: PNG Export (MVP - Framer)**
- Download card as high-quality PNG image
- Optimized for web use
- Implemented using html-to-image library in Framer code component
- Captures the preview card frame and converts to downloadable image

**Option 2: Embed Code (Phase 2 - Post-MVP)**
- Web component implementation (separate from Framer site)
- Copy-to-clipboard functionality added to Framer UI
- Usage format: `<x-card url="[post-url]" theme="..." radius="..."></x-card>`
- Lightweight JavaScript library hosted on CDN
- Customizable via component attributes
- Framer site provides the UI to generate and copy embed code
- Web component built separately, tested, and deployed to CDN

**MVP Focus:** Start with PNG export only. This keeps the 2-3 day timeline realistic and gets a working product shipped. Web component can be added as v2.

---

## Technical Architecture

### Frontend (Framer)
- Build entire UI in Framer
- Leverage Framer's component system and reactivity
- Use Framer's code components for custom functionality
- Real-time preview of card as user adjusts settings
- Responsive design handled by Framer
- Built-in hosting via Framer

### Backend/Scraping (External API)
- Separate serverless function (Vercel, Railway, or Netlify)
- Endpoint: `POST /api/scrape-post`
- Accepts X post URL in request body
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
- Parse HTML from public X post URLs using Cheerio
- Handle CORS issues
- Error handling for deleted/protected posts
- Rate limiting to prevent abuse

### Framer Integration
- Use Framer's code override or code component to call scraping API
- Store post data in Framer's state/variables
- Bind data to Framer design elements
- Use Framer's interactions for control panel

### PNG Export (Framer)
- Use `html-to-image` library in Framer code component
- Capture the card preview as PNG
- Trigger download for user

### Web Component (Phase 2 - Post-MVP)
- Build separately from Framer site
- Host on CDN (jsDelivr, unpkg, or custom)
- Web component calls the same scraping API endpoint
- Custom element: `<x-card>`
- Props/attributes for customization

### Preset Templates
- Design 1-2 basic presets directly in Framer
- Use Framer variants for different preset styles
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

**Target: 2-3 days**

### Day 1: Backend API + Framer Setup
**Morning:**
- Set up Vercel project for scraping API
- Build `/api/scrape-post` endpoint
- Test scraping logic with various X post URLs
- Deploy to Vercel

**Afternoon:**
- Create new Framer project
- Design basic card layout and preview area
- Design control panel UI (sliders, toggles, color pickers)
- Set up Framer variants for preset styles

### Day 2: Framer Integration + Interactivity
**Morning:**
- Create Framer code component to call scraping API
- Wire up URL input to fetch post data
- Bind API response data to card design elements
- Handle loading and error states

**Afternoon:**
- Connect all customization controls to card preview
- Implement real-time updates as controls change
- Add PNG export functionality using html2canvas
- Test across different post types (text, images, with/without timestamp)

### Day 3: Polish + Testing
**Morning:**
- Visual polish and styling refinements
- Responsive design adjustments
- Error handling and edge cases
- Copy for UI and instructions

**Afternoon:**
- Cross-browser testing
- Mobile responsiveness check
- Performance optimization
- Deploy via Framer
- (Optional) Start web component if time allows

### Phase 2 (Post-MVP): Web Component
- Build standalone web component
- Set up separate build process
- Host on CDN
- Add "Copy Embed Code" feature to Framer site
- Documentation for developers

---

## Tech Stack

### Frontend
- **Framer** (primary platform for design and hosting)

### Backend API (Scraping Endpoint)
- **Vercel Serverless Functions**
- **Node.js** runtime
- **Cheerio** for HTML parsing

### Libraries/Dependencies
- **html-to-image** (PNG export in Framer)
- **Axios** or **fetch** (API calls from Framer to scraping endpoint)

### Hosting
- **Framer** (frontend/main site) - built-in
- **Vercel** (scraping API endpoint) - serverless functions
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
