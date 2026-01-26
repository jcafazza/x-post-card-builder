# API Documentation

This document describes the API routes available in the X Post Card Builder application.

## Base URL

All API routes are served from `/api/` when running locally or from your deployment domain.

---

## POST `/api/scrape-post`

Fetches and parses data from a public X (Twitter) post URL.

### Request

**Method:** `POST`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "url": "https://x.com/username/status/1234567890"
}
```

**URL Format:**
- Must be a valid X/Twitter post URL
- Supports both `x.com` and `twitter.com` domains
- Format: `https://(x.com|twitter.com)/username/status/tweetId`

### Response

**Success (200 OK):**
```json
{
  "author": {
    "name": "Display Name",
    "handle": "@username",
    "avatar": "/api/image?url=https://...",
    "verified": true
  },
  "content": {
    "text": "Post content text...",
    "images": ["/api/image?url=https://...", "..."]
  },
  "timestamp": "2026-01-23T12:00:00.000Z"
}
```

**Error Responses:**

| Status | Error Message | Description |
|--------|---------------|-------------|
| 400 | `"URL required"` | Missing or empty URL in request body |
| 400 | `"Invalid URL"` | URL is not a valid X/Twitter post URL |
| 503 | `"Post unavailable"` | Post could not be scraped (deleted, protected, or scraping failed) |
| 500 | `"Load failed"` | Internal server error during scraping |

### Error Format

All errors return a JSON object:
```json
{
  "error": "Error message"
}
```

### Scraping Strategy

The API uses a multi-tier fallback strategy for maximum reliability:

1. **Primary**: Twitter syndication JSON API (`cdn.syndication.twimg.com/tweet-result`)
   - Fastest and most reliable
   - Includes full text for long posts
   - Best image quality

2. **Fallback 1**: Syndication HTML embed (`cdn.syndication.twimg.com/tweet`)
   - Works when JSON API fails
   - Extracts text and images from HTML

3. **Fallback 2**: oEmbed API (`publish.twitter.com/oembed`)
   - Works for very old posts
   - Text-only (no images)

### Demo Mode

For testing, you can use special keywords instead of URLs:
- `"demo"` - Design systems post
- `"startup"` - Paul Graham post
- `"code"` - Guillermo Rauch post
- `"ai"` - Andrej Karpathy post
- `"product"` - Julie Zhuo post

### Image URLs

All image URLs (avatars and post images) are automatically proxied through `/api/image` to ensure:
- Same-origin loading (no CORS issues)
- Reliable PNG export
- Consistent image delivery

---

## GET `/api/image`

Proxies remote images to enable same-origin loading and reliable export.

### Request

**Method:** `GET`

**Query Parameters:**
- `url` (required): The URL-encoded image URL to proxy

**Example:**
```
GET /api/image?url=https%3A%2F%2Fpbs.twimg.com%2Fmedia%2Fexample.jpg
```

### Response

**Success (200 OK):**
- **Content-Type:** `image/png`, `image/jpeg`, `image/webp`, etc. (based on source)
- **Body:** Binary image data
- **Headers:**
  - `Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800`
  - `Access-Control-Allow-Origin: *`

**Error Responses:**

| Status | Error Message | Description |
|--------|---------------|-------------|
| 400 | `"Missing url"` | No `url` query parameter provided |
| 400 | `"Invalid url"` | URL is malformed |
| 400 | `"Only https images are allowed"` | URL uses non-HTTPS protocol |
| 403 | `"Host not allowed"` | Image host is not in the allowlist |
| 502 | `"Upstream failed (XXX)"` | Remote server returned an error |
| 502 | `"Image proxy failed"` | Network error or timeout |

### Allowed Hosts

For security, only specific hosts are allowed:
- `pbs.twimg.com` (Twitter media)
- `video.twimg.com` (Twitter video thumbnails)
- `*.twimg.com` (Any Twitter CDN subdomain)
- `unavatar.io` (Avatar fallback service)

### Caching

Images are cached aggressively:
- Browser cache: 24 hours
- CDN cache: 24 hours
- Stale-while-revalidate: 7 days

This ensures fast loading while keeping images relatively fresh.

### Timeout

Image requests timeout after 12 seconds to prevent hanging requests.

---

## CORS

All API routes support CORS with `Access-Control-Allow-Origin: *` for public API access.

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting if the API becomes public-facing.

---

## Error Handling

All API errors return user-friendly 2-word error messages:
- `"URL required"`
- `"Invalid URL"`
- `"Post unavailable"`
- `"Load failed"`

Detailed error information is logged server-side but not exposed to clients for security.

---

## Examples

### Fetch a Post

```typescript
const response = await fetch('/api/scrape-post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://x.com/elonmusk/status/1234567890'
  })
})

const post = await response.json()
console.log(post.author.name) // "Elon Musk"
```

### Load an Image

```typescript
// Image URLs are automatically proxied
const imageUrl = post.content.images[0]
// Returns: "/api/image?url=https%3A%2F%2Fpbs.twimg.com%2F..."

// Use directly in <img> tag
<img src={imageUrl} alt="Post image" />
```

---

## Notes

- The scraping API is stateless - no authentication required
- All image URLs are automatically proxied for reliability
- The API uses multiple fallback strategies for maximum reliability
- Protected or private posts cannot be scraped (by design)
