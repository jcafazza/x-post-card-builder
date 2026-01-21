# X Post Card Builder

Transform X (Twitter) posts into beautiful, customizable visual cards. Export as PNG or embed on your website.

## Product Vision

Unlike screenshot tools focused on social sharing, X Post Card Builder gives designers and creators granular control over card design to create embeddable post cards that match their website's brand aesthetic.

**Core Flow:**
1. Paste X post URL
2. Customize card design (colors, radius, spacing, shadows, toggle metrics/date)
3. Export as PNG (MVP) or copy embed code (Phase 2)

---

## Project Structure

```
x-post-visualizer/
├── api/
│   └── scrape-post.js          # Vercel serverless function - scrapes X posts
├── framer-components/
│   ├── APIFetcher.tsx          # Framer component to fetch post data
│   └── PNGExporter.tsx         # Framer component to export PNG
├── package.json                # Dependencies
├── vercel.json                 # Vercel configuration
├── README.md                   # This file
├── PRODUCT.md                  # Full product specification
└── CLAUDE.md                   # AI context and guidelines
```

---

## Tech Stack

- **Frontend**: Framer (visual design + hosting)
- **Backend API**: Vercel Serverless Functions
- **Scraping**: Cheerio (lightweight HTML parsing)
- **Export**: html-to-image (PNG export in browser)

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `cheerio` - HTML parsing for X post scraping
- `html-to-image` - PNG export in Framer

### 2. Deploy API to Vercel

You already have a Vercel account, so:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Deploy
```

After deployment, you'll get a URL like: `https://your-project.vercel.app`

**Important:** Copy your API URL - you'll need it for Framer integration.

### 3. Set Up Framer Project

#### A. Create/Open Your Framer Project

You mentioned you already have a Framer project ready.

#### B. Install html-to-image in Framer

1. In Framer, open the **Assets** panel
2. Click the **"+"** button
3. Search for **"html-to-image"**
4. Click **Install**

#### C. Add API Fetcher Component

1. In Framer, go to **Code** tab
2. Create a new **Code File** or **Override**
3. Copy the contents of [`framer-components/APIFetcher.tsx`](framer-components/APIFetcher.tsx)
4. **Important:** Update the `API_ENDPOINT` constant with your Vercel URL:
   ```tsx
   const API_ENDPOINT = "https://your-project.vercel.app/api/scrape-post"
   ```

#### D. Add PNG Exporter Component

1. In Framer, create a new **Code Component**
2. Copy the contents of [`framer-components/PNGExporter.tsx`](framer-components/PNGExporter.tsx)
3. Add the component to your canvas as an export button

---

## How to Use the Components in Framer

### API Fetcher

**Option 1: As an Override (Recommended)**

1. Apply the `withPostFetcher` override to your URL input field
2. The override handles fetching automatically when user enters a URL
3. Access the data in other components via Framer variables

**Option 2: As a Hook in a Code Component**

```tsx
import { usePostFetcher } from "./APIFetcher"

export default function PostCard(props) {
    const { data, loading, error } = usePostFetcher(props.url)

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!data) return <div>Enter a URL</div>

    return (
        <div>
            <img src={data.author.avatar} alt={data.author.name} />
            <h2>{data.author.name}</h2>
            <p>{data.author.handle}</p>
            <p>{data.content.text}</p>
        </div>
    )
}
```

### PNG Exporter

**Option 1: As a Component**

1. Drag the `PNGExporter` component onto your canvas
2. Set props in the properties panel:
   - `targetId`: The name of your card preview frame (e.g., "card-preview")
   - `label`: Button text (e.g., "Download PNG")
   - `filename`: Output filename (e.g., "x-post-card.png")

**Option 2: As a Function in an Override**

```tsx
import { exportElementToPNG } from "./PNGExporter"

export function ExportButton(Component): ComponentType {
    return (props) => {
        const handleClick = async () => {
            try {
                await exportElementToPNG("card-preview", "x-post-card.png")
            } catch (error) {
                console.error("Export failed:", error)
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}
```

---

## API Reference

### POST /api/scrape-post

Scrapes a public X post and returns structured data.

**Request:**
```json
{
  "url": "https://x.com/username/status/123456789"
}
```

**Response:**
```json
{
  "author": {
    "name": "Display Name",
    "handle": "@username",
    "avatar": "https://...",
    "verified": false
  },
  "content": {
    "text": "Post content...",
    "images": ["https://...", "https://..."]
  },
  "metrics": {
    "likes": 0,
    "retweets": 0,
    "replies": 0
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**Error Responses:**
- `400` - Invalid URL format
- `404` - Post not found or deleted
- `500` - Scraping failed or post structure changed

**Note:** Metrics (likes, retweets, replies) are not easily available via HTML scraping and will return 0 in the MVP. To get real metrics, you'd need Puppeteer (JavaScript rendering) or X API access.

---

## Framer Design Tips

### Component Structure

```
Page (Framer canvas)
├── Header
├── Input Section
│   └── URL Input Field (with APIFetcher override)
├── Main Content (2-column layout)
│   ├── Preview Panel (left)
│   │   └── Card Preview Frame (name: "card-preview")
│   │       ├── Author Section (avatar, name, handle)
│   │       ├── Content Section (text, images)
│   │       ├── Metrics Section (conditional)
│   │       └── Timestamp Section (conditional)
│   └── Controls Panel (right)
│       ├── Toggle Stack (show metrics, show date)
│       ├── Design Controls (radius, color, shadow, spacing)
│       └── Export Button (PNGExporter component)
└── Footer
```

### Framer Variables to Track State

Create these variables in Framer to manage the app state:

- `postUrl` (string) - User input URL
- `postData` (object) - Fetched post data from API
- `showMetrics` (boolean) - Toggle state for metrics
- `showDate` (boolean) - Toggle state for timestamp
- `borderRadius` (number) - Card border radius value
- `bgColor` (string) - Card background color
- `shadowIntensity` (string) - none/light/medium/strong
- `isLoading` (boolean) - Loading state
- `errorMessage` (string) - Error message if fetch fails

### Using Variants for Presets

Create Framer variants for preset styles:

1. Select your card frame
2. Create variants in the properties panel
3. Name them: "Default", "Minimal", "Bold", etc.
4. Adjust styling for each variant
5. Let users switch between presets with a dropdown/buttons

---

## Development Roadmap

### ✅ MVP (Current - 2-3 Days)
- [x] Vercel API scraper endpoint with Cheerio
- [x] Framer code components (API Fetcher, PNG Exporter)
- [ ] Framer UI design (input, preview, controls)
- [ ] Real-time preview updates
- [ ] PNG export functionality
- [ ] 1-2 preset templates
- [ ] Error handling and loading states
- [ ] Deploy to Framer

### 🔮 Phase 2 (Post-MVP)
- [ ] Web component for embeds
- [ ] Copy embed code feature
- [ ] CDN hosting for web component
- [ ] More preset templates
- [ ] Advanced customization options
- [ ] Save/share preset styles

### 🚀 Future Enhancements
- [ ] Font selection/typography controls
- [ ] Gradient backgrounds
- [ ] Dark mode
- [ ] Batch processing
- [ ] User accounts
- [ ] Figma/design tool integration

---

## Troubleshooting

### API Issues

**Problem:** "Could not extract post data"
- X's HTML structure may have changed
- Check if the post is public and accessible
- Try updating the scraper logic in [`api/scrape-post.js`](api/scrape-post.js)

**Problem:** CORS errors in Framer
- Make sure your Vercel API has correct CORS headers (already configured in the code)
- Verify you're using the correct API endpoint URL

**Problem:** "Post not found or deleted"
- The post may be private, deleted, or from a protected account
- Only public posts can be scraped

### Export Issues

**Problem:** PNG export not working
- Ensure html-to-image is installed in Framer
- Check that your card frame has the correct name/ID set
- Make sure the frame is visible on the canvas when exporting

**Problem:** Exported PNG is blank
- The element may not be fully rendered when export is triggered
- Add a small delay before export (100-200ms)
- Check browser console for errors

### Framer Integration Issues

**Problem:** Can't find the element to export
- Make sure your card frame has a name set in Framer properties
- Use the exact frame name in the `targetId` prop
- The exporter looks for both `id` and `data-framer-name` attributes

---

## Notes on Scraping

### Limitations

- **No real metrics**: Likes, retweets, and replies require JavaScript rendering or X API access. MVP returns 0 for these values.
- **Structure changes**: If X updates their HTML structure, the scraper may break and need updates.
- **Rate limiting**: Consider adding rate limiting to prevent abuse if this becomes public.

### Upgrading to Puppeteer (Optional)

If you need real metrics or more robust scraping:

1. Install Puppeteer: `npm install puppeteer-core chrome-aws-lambda`
2. Update [`api/scrape-post.js`](api/scrape-post.js) to use Puppeteer
3. Note: This increases cold start time and memory usage on Vercel

---

## Contributing

This is a solo project for now, but if you want to add features:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test thoroughly
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`

---

## License

MIT License - feel free to use and modify as needed.

---

## Resources

- [Framer Documentation](https://www.framer.com/developers/)
- [Vercel Documentation](https://vercel.com/docs)
- [Cheerio Documentation](https://cheerio.js.org/)
- [html-to-image Documentation](https://github.com/bubkoo/html-to-image)

---

## Questions?

Check the [PRODUCT.md](PRODUCT.md) file for full product specification and context.

---

**Built with ❤️ for designers and creators**
