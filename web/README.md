# X Post Card Builder - Web Application

Next.js application for transforming X posts into beautiful, customizable visual cards.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with opacity-based color system
- **UI Components**: Base UI (headless components)
- **Export**: html2canvas for PNG generation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- The Vercel API must be deployed (see parent directory)

### Installation

```bash
npm install
```

### Configuration

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Vercel API endpoint:
   ```
   NEXT_PUBLIC_API_ENDPOINT=https://your-project.vercel.app/api/scrape-post
   ```

   For local development with the API running locally:
   ```
   NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000/api/scrape-post
   ```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles & Tailwind imports
├── components/
│   ├── PostCard.tsx      # Card preview component
│   ├── ControlsPanel.tsx # Customization controls
│   └── URLInput.tsx      # URL input with API integration
├── lib/
│   ├── api.ts           # API client
│   ├── themes.ts        # Theme configuration
│   ├── placeholder.ts   # Funny placeholder content
│   └── export.ts        # PNG export utility
├── types/
│   └── post.ts          # TypeScript type definitions
└── public/              # Static assets
```

## Features

- Real-time card preview with live updates
- Three theme options (light/dim/dark) with opacity-based colors
- Customizable border radius (0px/8px/16px/20px/24px)
- Adjustable shadow intensity (flat/raised/floating/elevated)
- Optional timestamp display
- Collapsible controls panel
- PNG export with high-quality rendering (2x scale)
- Funny, provocative tech-themed placeholder content

## Theme System

The app uses an opacity-based color system with three themes:

### Light Theme
- Background: `#FFFFFF`
- Primary text: `#000000`
- Secondary text: `#666666`
- Tertiary text: `#999999`
- Border: `#E6E6E6`

### Dim Theme
- Background: `#15202B`
- Primary text: `#F2F2F2`
- Secondary text: `#999999`
- Tertiary text: `#666666`
- Border: `rgba(255, 255, 255, 0.1)`

### Dark Theme
- Background: `#000000`
- Primary text: `#FFFFFF`
- Secondary text: `#999999`
- Tertiary text: `#666666`
- Border: `rgba(255, 255, 255, 0.1)`

## Usage

1. **Load a Post**:
   - Paste an X post URL in the input field
   - Click "Load Post" to fetch the data
   - Or use the funny placeholder content loaded by default

2. **Customize**:
   - Use the controls panel to adjust theme, border radius, shadow, and date visibility
   - Changes update in real-time

3. **Export**:
   - Click "Download PNG" to export the card as a high-quality image
   - The PNG will download directly to your computer

## Deployment

### Deploy to Vercel

```bash
vercel
```

Make sure to set the `NEXT_PUBLIC_API_ENDPOINT` environment variable in your Vercel project settings.

## Troubleshooting

### API Connection Issues

If you see "Failed to load post" errors:
1. Verify your API endpoint is correct in `.env.local`
2. Make sure the Vercel API is deployed and accessible
3. Check browser console for CORS errors

### Export Not Working

If PNG export fails:
1. Ensure the card preview is visible on screen
2. Check browser console for errors
3. Try a different browser (some browsers have limitations with html2canvas)

### Styling Issues

If the card doesn't look right:
1. Make sure Tailwind CSS is properly configured
2. Check that all dependencies are installed: `npm install`
3. Try clearing Next.js cache: `rm -rf .next`

## License

MIT License - see parent directory for details
