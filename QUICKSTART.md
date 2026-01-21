# Quick Start Guide

Get your X Post Card Builder up and running in 3 steps.

---

## Step 1: Deploy API to Vercel (5 minutes)

### Install Dependencies
```bash
npm install
```

### Deploy to Vercel
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel
```

Follow the prompts:
- Link to existing project or create new
- Accept defaults
- Deploy

You'll get a URL like: `https://your-project.vercel.app`

**Copy this URL** - you'll need it in Step 2.

---

## Step 2: Set Up Framer Components (10 minutes)

### A. Add API Fetcher

1. In Framer, go to the **Code** tab (top menu)
2. Click **"+"** to create a new **Code File**
3. Name it `APIFetcher`
4. Copy the contents of [`framer-components/APIFetcher.tsx`](framer-components/APIFetcher.tsx)
5. **IMPORTANT:** Update line 15 with your Vercel URL:
   ```tsx
   const API_ENDPOINT = "https://your-project.vercel.app/api/scrape-post"
   ```
6. Save

### B. Add PNG Exporter

1. In Framer Code tab, click **"+"** again
2. Create a new **Code Component** (not file)
3. Name it `PNGExporter`
4. Copy the contents of [`framer-components/PNGExporter-FramerNative.tsx`](framer-components/PNGExporter-FramerNative.tsx)
   - **Note:** This version uses CDN-loaded html2canvas - no package installation needed!
5. Save

---

## Step 3: Build UI in Framer (1-2 hours)

### Create the Layout

1. **Header Section**
   - Add logo/title text
   - Optional: instructions or tagline

2. **URL Input Section**
   - Add an Input component
   - Give it a name in properties: `urlInput`

3. **Preview Section** (Main area)
   - Create a Frame for the card preview
   - **IMPORTANT:** Name this frame `card-preview` in properties
   - This frame will be exported as PNG

4. **Card Frame Contents**
   Inside the `card-preview` frame, add:
   - **Author section**: Avatar (Image), Name (Text), Handle (Text)
   - **Content section**: Post text (Text), Images (Image)
   - **Timestamp section**: Date/time (Text) - optional display

5. **Controls Panel**
   - Add toggle: Show Date
   - Add dropdown: Theme (light/dim/dark)
   - Add dropdown: Border Radius (0px/8px/16px/20px/24px)
   - Add dropdown: Shadow Intensity (none/light/medium/strong)

6. **Export Section**
   - Drag your `PNGExporter` component onto canvas
   - Set its `targetId` prop to: `card-preview`

### Wire Up the Components

#### Connect API Fetcher to Input
1. Select your URL input field
2. In the right panel, scroll to **Code Override**
3. Choose your `APIFetcher` file → `withPostFetcher` override
4. This will trigger API calls when users enter URLs

#### Create Framer Variables
In Framer, create these variables to store state:
- `postData` (Object) - Fetched post data
- `showDate` (Boolean) - Toggle state for timestamp
- `theme` (String) - Theme selection: "light", "dim", or "dark"
- `borderRadius` (String) - Border radius: "0px", "8px", "16px", "20px", or "24px"
- `shadowIntensity` (String) - Shadow: "none", "light", "medium", or "strong"

#### Bind Data to Card UI
1. For each text element in your card, bind to variables:
   - Author name → `postData.author.name`
   - Author handle → `postData.author.handle`
   - Post text → `postData.content.text`
   - Timestamp → `postData.timestamp` (formatted)

2. Use conditional visibility:
   - Timestamp section → visible when `showDate === true`

3. Bind styling to controls:
   - Card frame border radius → `borderRadius` variable
   - Card frame background/colors → based on `theme` variable:
     - `light`: White background, dark text
     - `dim`: Gray background (#15202B), light text
     - `dark`: Black background, white text
   - Card frame shadow → based on `shadowIntensity` value

---

## Testing Your Setup

### Test the API
Try pasting these X post URLs:
- `https://x.com/elonmusk/status/1234567890` (use any real post)
- Watch for loading state
- Check that data appears in your card

### Test Customization
- Toggle metrics on/off → card should update
- Toggle date on/off → card should update
- Adjust border radius → card should update
- Change background color → card should update

### Test PNG Export
1. Click your export button
2. Should download a PNG file
3. Open the file and verify it looks correct

---

## Troubleshooting

### "Could not find element" when exporting
- Make sure your card frame is named exactly `card-preview`
- Check that the `targetId` prop matches the frame name

### API not returning data
- Verify your API endpoint URL in `APIFetcher.tsx`
- Check browser console for errors
- Test your API directly: `POST https://your-project.vercel.app/api/scrape-post`

### "Invalid URL" error
- Make sure you're using a valid X post URL format
- Example: `https://x.com/username/status/123456789`

---

## Next Steps

Once everything is working:

1. **Design Polish**
   - Refine card aesthetics
   - Add preset templates (use Framer variants)
   - Improve control panel layout

2. **Error Handling**
   - Show loading spinners
   - Display error messages nicely
   - Handle edge cases (deleted posts, protected accounts)

3. **Deploy**
   - Publish your Framer site
   - Test end-to-end
   - Share with users

4. **Phase 2 (Optional)**
   - Build web component for embeds
   - Add "Copy Embed Code" feature
   - Host web component on CDN

---

## Resources

- [Full README](README.md) - Detailed documentation
- [Product Spec](PRODUCT.md) - Complete feature specification
- [Framer Docs](https://www.framer.com/developers/) - Framer code documentation
- [Vercel Docs](https://vercel.com/docs) - Vercel deployment guides

---

**Ready to build! 🚀**

If you get stuck, check the README or PRODUCT.md for more detailed information.
