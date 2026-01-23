/**
 * X Post Scraper API Route
 *
 * Uses Puppeteer (with @sparticuz/chromium for Vercel) to scrape X posts by:
 * 1. Loading the page in a real browser
 * 2. Waiting for JavaScript to render
 * 3. Extracting post data from the DOM
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Give the serverless function enough time for network variability.
export const maxDuration = 30

// Sample posts for demo mode
const SAMPLE_POSTS: Record<string, {
  author: { name: string; handle: string; avatar: string; verified: boolean }
  content: { text: string; images: string[] }
  timestamp: string
}> = {
  'demo': {
    author: {
      name: 'Design Systems',
      handle: '@designsystems',
      avatar: 'https://unavatar.io/twitter/designsystems',
      verified: true,
    },
    content: {
      text: 'Good design is invisible. Great design is unforgettable. The best design systems disappear into the background while making everything feel effortless.',
      images: [],
    },
    timestamp: new Date().toISOString(),
  },
  'startup': {
    author: {
      name: 'Paul Graham',
      handle: '@paulg',
      avatar: 'https://unavatar.io/twitter/paulg',
      verified: true,
    },
    content: {
      text: 'The best way to have startup ideas is to notice them organically. Live in the future and build what seems interesting.',
      images: [],
    },
    timestamp: new Date().toISOString(),
  },
  'code': {
    author: {
      name: 'Guillermo Rauch',
      handle: '@rauchg',
      avatar: 'https://unavatar.io/twitter/rauchg',
      verified: true,
    },
    content: {
      text: 'Ship early, ship often. The best code is code that solves real problems for real users. Everything else is just practice.',
      images: [],
    },
    timestamp: new Date().toISOString(),
  },
  'ai': {
    author: {
      name: 'Andrej Karpathy',
      handle: '@karpathy',
      avatar: 'https://unavatar.io/twitter/karpathy',
      verified: true,
    },
    content: {
      text: 'The hottest new programming language is English. Natural language interfaces are becoming the default way we interact with computers.',
      images: [],
    },
    timestamp: new Date().toISOString(),
  },
  'product': {
    author: {
      name: 'Julie Zhuo',
      handle: '@joulee',
      avatar: 'https://unavatar.io/twitter/joulee',
      verified: true,
    },
    content: {
      text: 'A product is never truly finished. It\'s a living thing that grows with your users. The best PMs know when to ship and when to iterate.',
      images: [],
    },
    timestamp: new Date().toISOString(),
  },
}

type SyndicationTweet = {
  text?: string
  created_at?: string
  user?: {
    name?: string
    screen_name?: string
    profile_image_url_https?: string
    verified?: boolean
    is_blue_verified?: boolean
  }
  photos?: Array<{ url?: string }>
  video?: {
    poster?: string
    variants?: Array<{ url?: string; content_type?: string }>
  }
  mediaDetails?: Array<{ 
    media_url_https?: string
    type?: string
  }>
}

/**
 * Normalizes an X avatar URL to get the high-resolution version (400x400).
 * Also strips session-based query parameters that can cause image loading failures.
 */
function normalizeAvatarUrl(url?: string): string | undefined {
  if (!url) return undefined
  
  // 1. Strip query parameters (they often contain session tokens that expire)
  const baseUrl = url.split('?')[0]
  
  // 2. Replace common size suffixes with _400x400
  // Suffixes: _normal (48x48), _bigger (73x73), _mini (24x24)
  const normalized = baseUrl.replace(/_(normal|bigger|mini)(\.(jpg|png|jpeg|webp))$/i, '_400x400$2')
  
  return normalized
}

/**
 * Extracts high-quality images from the syndication response.
 */
function extractMedia(data: SyndicationTweet): string[] {
  const images: string[] = []

  // 1. Try photos array (standard images)
  if (data.photos && Array.isArray(data.photos)) {
    data.photos.forEach((p) => {
      if (p?.url) images.push(p.url)
    })
  }

  // 2. Try mediaDetails (often contains video thumbnails/gifs or high-res variants)
  if (data.mediaDetails && Array.isArray(data.mediaDetails)) {
    data.mediaDetails.forEach((m) => {
      if (m?.media_url_https) images.push(m.media_url_https)
    })
  }

  // 3. Try video poster as a fallback for video/gif posts
  if (images.length === 0 && data.video?.poster) {
    images.push(data.video.poster)
  }

  // Deduplicate and normalize URLs to get the highest quality
  return Array.from(new Set(images)).map((url) => {
    if (url.includes('pbs.twimg.com/media/')) {
      // Ensure we get the large version and prefer jpg format for compatibility
      const baseUrl = url.split('?')[0]
      return `${baseUrl}?format=jpg&name=large`
    }
    return url
  })
}

async function fetchViaSyndication(tweetId: string): Promise<SyndicationTweet> {
  // This endpoint is fast and avoids running a headless browser in production.
  const endpoint = `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(tweetId)}&lang=en`
  const response = await fetch(endpoint, {
    headers: {
      // Some CDNs behave better with a real UA.
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Syndication fetch failed (HTTP ${response.status})`)
  }

  return response.json()
}

type OEmbedResponse = {
  author_name?: string
  author_url?: string
  html?: string
}

async function fetchViaOEmbed(tweetUrl: string): Promise<OEmbedResponse> {
  const endpoint = `https://publish.twitter.com/oembed?omit_script=1&url=${encodeURIComponent(tweetUrl)}`
  const response = await fetch(endpoint, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`oEmbed fetch failed (HTTP ${response.status})`)
  }

  return response.json()
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function extractTextFromOEmbedHtml(html: string): string {
  // Typical payload:
  // <blockquote ...><p ...>text<br>more</p>&mdash; ... <a ...>Date</a></blockquote>
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (!match) return ''

  return decodeHtmlEntities(
    match[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim()
  )
}

function extractDateFromOEmbedHtml(html: string): string | null {
  const match = html.match(/<a [^>]*>([^<]+)<\/a>\s*<\/blockquote>\s*$/i)
  if (!match) return null
  const parsed = new Date(match[1])
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a URL' },
        { status: 400 }
      )
    }

    // Check for demo/sample mode
    const keyword = url.toLowerCase().trim()
    if (SAMPLE_POSTS[keyword]) {
      return NextResponse.json(SAMPLE_POSTS[keyword])
    }

    // Validate it's an X/Twitter URL
    const xUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/i
    const match = url.match(xUrlPattern)

    if (!match) {
      return NextResponse.json(
        { error: 'Enter a valid X post URL (x.com/user/status/...)' },
        { status: 400 }
      )
    }

    const [, , username, tweetId] = match

    // --- Production-first: use fast endpoints (avoid headless browser on Vercel) ---
    // 1) Try syndication JSON (best fidelity for modern posts).
    try {
      const data = await fetchViaSyndication(tweetId)
      const text = data.text ?? ''
      
      // Use the improved media extraction
      const images = extractMedia(data)

      const name = data.user?.name || username
      const handle = data.user?.screen_name ? `@${data.user.screen_name}` : `@${username}`
      
      // Use the improved avatar normalization
      const avatar = normalizeAvatarUrl(data.user?.profile_image_url_https) || `https://unavatar.io/twitter/${username}`
      
      const verified = Boolean(data.user?.verified || data.user?.is_blue_verified)
      const timestamp = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString()

      if (text || images.length > 0) {
        return NextResponse.json({
          author: { name, handle, avatar, verified },
          content: { text, images },
          timestamp,
        })
      }
    } catch (e) {
      console.warn('Syndication scrape failed:', e instanceof Error ? e.message : e)
    }

    // 2) Fallback: oEmbed (works even for very old posts; text-only, no images).
    try {
      const canonicalUrl = `https://twitter.com/${username}/status/${tweetId}`
      const oembed = await fetchViaOEmbed(canonicalUrl)
      const text = oembed.html ? extractTextFromOEmbedHtml(oembed.html) : ''
      const timestamp = oembed.html ? extractDateFromOEmbedHtml(oembed.html) : null

      if (text) {
        return NextResponse.json({
          author: {
            name: oembed.author_name || username,
            handle: oembed.author_name ? `@${oembed.author_name}` : `@${username}`,
            avatar: `https://unavatar.io/twitter/${oembed.author_name || username}`,
            verified: false,
          },
          content: { text, images: [] },
          timestamp: timestamp || new Date().toISOString(),
        })
      }
    } catch (e) {
      console.warn('oEmbed scrape failed:', e instanceof Error ? e.message : e)
    }

    // Stop here: this API uses the fast syndication + oEmbed endpoints only.
    // Headless browser scraping is intentionally avoided for Vercel reliability.
    return NextResponse.json(
      { error: 'Could not load post. Try: demo, startup, code, ai, or product' },
      { status: 503 }
    )

  } catch (error: any) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
