/**
 * X Post Scraper API Route
 *
 * Fetches public X post data without API keys via:
 * 1) Twitter syndication JSON (`cdn.syndication.twimg.com/tweet-result`) with required token
 * 2) Syndication embed HTML fallback (`cdn.syndication.twimg.com/tweet`)
 *
 * Media URLs are proxied through `/api/image` for same-origin loading/export reliability.
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
  full_text?: string
  created_at?: string
  user?: {
    name?: string
    screen_name?: string
    profile_image_url_https?: string
    verified?: boolean
    is_blue_verified?: boolean
  }
  // Long posts ("Show more") are often represented as a note tweet with a separate text field.
  // The exact shape can vary, so we keep this flexible.
  note_tweet?: {
    text?: string
    note_tweet_results?: {
      result?: {
        text?: string
      }
    }
  }
  entities?: {
    urls?: Array<{
      url?: string
      expanded_url?: string
      display_url?: string
    }>
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

function unwrapSyndicationTweet(data: any): any {
  // Some responses include a nested `tweet` object; others are already tweet-shaped.
  return data?.tweet ?? data?.data?.tweet ?? data
}

function unwrapSyndicationUser(data: any, tweet: any): any {
  // Prefer an explicit `user` field, then anything embedded in the tweet.
  return data?.user ?? tweet?.user ?? data?.data?.user ?? null
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

function proxyImageUrl(url?: string): string {
  if (!url) return ''
  // If already proxied/relative, leave as-is.
  if (url.startsWith('/')) return url
  if (!url.startsWith('http')) return url
  return `/api/image?url=${encodeURIComponent(url)}`
}

function proxyImageUrls(urls: string[]): string[] {
  return urls.map((u) => proxyImageUrl(u)).filter(Boolean)
}

type NormalizedMedia = { url: string; kind: 'photo' | 'thumb' }

function normalizeTwimgMediaUrl(input?: string): NormalizedMedia | null {
  if (!input || typeof input !== 'string') return null
  if (!input.startsWith('http')) return null

  let u: URL
  try {
    u = new URL(input)
  } catch {
    return null
  }

  const host = u.hostname.toLowerCase()
  if (host !== 'pbs.twimg.com' && !host.endsWith('.twimg.com')) return null

  const path = u.pathname

  // Never treat avatars/icons/etc as tweet media.
  if (path.includes('/profile_images/')) return null

  // Ignore non-tweet media assets that often appear in embeds.
  if (path.includes('/card_img/')) return null
  if (path.includes('/semantic_core_img/')) return null

  const isPhoto = path.includes('/media/')
  const isThumb =
    path.includes('/ext_tw_video_thumb/') ||
    path.includes('/amplify_video_thumb/') ||
    path.includes('/tweet_video_thumb/')

  if (!isPhoto && !isThumb) return null

  const baseUrl = `${u.origin}${u.pathname}`
  return {
    url: `${baseUrl}?format=jpg&name=large`,
    kind: isPhoto ? 'photo' : 'thumb',
  }
}

/**
 * Extracts high-quality images from the syndication response.
 */
function extractMedia(data: any): string[] {
  const rawCandidates: string[] = []
  const anyData = data as any

  // 1. Try photos array (standard images)
  if (data.photos && Array.isArray(data.photos)) {
    data.photos.forEach((p: any) => {
      if (p?.url) rawCandidates.push(p.url)
    })
  }

  // 2. Try mediaDetails (often contains video thumbnails/gifs or high-res variants)
  if (data.mediaDetails && Array.isArray(data.mediaDetails)) {
    data.mediaDetails.forEach((m: any) => {
      if (m?.media_url_https) rawCandidates.push(m.media_url_https)
    })
  }

  // 2b. Extra brute-force paths (payload shape can vary)
  const altMediaLists: any[] = [
    anyData?.entities?.media,
    anyData?.extended_entities?.media,
    anyData?.media,
    anyData?.media_details,
  ].filter(Boolean)
  for (const list of altMediaLists) {
    if (!Array.isArray(list)) continue
    for (const m of list) {
      const u =
        m?.media_url_https ||
        m?.media_url ||
        m?.url ||
        m?.mediaUrl ||
        m?.src
      if (typeof u === 'string' && u) rawCandidates.push(u)
    }
  }

  // 3. Video poster as a fallback (only helps for video/GIF posts)
  if (data.video?.poster) {
    rawCandidates.push(data.video.poster)
  }

  const normalized: NormalizedMedia[] = []
  for (const c of rawCandidates) {
    const n = normalizeTwimgMediaUrl(c)
    if (n) normalized.push(n)
  }

  // If the tweet has real photos, drop video thumbs (they often cause "extra" broken images).
  const hasPhotos = normalized.some((m) => m.kind === 'photo')
  const filtered = hasPhotos ? normalized.filter((m) => m.kind === 'photo') : normalized

  // Deduplicate while preserving order, and cap to a reasonable max.
  const out: string[] = []
  const seen = new Set<string>()
  for (const m of filtered) {
    if (seen.has(m.url)) continue
    seen.add(m.url)
    out.push(m.url)
    if (out.length >= 4) break
  }

  return out
}

function extractBestText(data: any): string {
  // "Note tweets" (Show more) and other expanded formats have been observed under
  // various nested keys. If we can't find a good known field, fall back to a
  // bounded deep search for the longest plausible "*text*" value.
  const findDeepBestText = (root: any): string => {
    const stack: Array<{ key: string; value: any; depth: number }> = [{ key: '', value: root, depth: 0 }]
    const visited = new Set<any>()

    let best = ''
    let nodes = 0
    const MAX_NODES = 4000
    const MAX_DEPTH = 8

    const isProbablyTweetText = (k: string, v: string): boolean => {
      const key = k.toLowerCase()
      if (!key.includes('text')) return false
      if (key.includes('display_url') || key.includes('expanded_url')) return false
      if (key === 'url') return false
      if (/^https?:\/\//i.test(v.trim())) return false
      // Avoid accidentally selecting chunks of HTML/markup
      if (v.includes('<blockquote') || v.includes('<p') || v.includes('</')) return false
      return true
    }

    while (stack.length > 0 && nodes < MAX_NODES) {
      const cur = stack.pop()!
      nodes++

      const { key, value, depth } = cur
      if (value && typeof value === 'object') {
        if (visited.has(value)) continue
        visited.add(value)
      }

      if (typeof value === 'string') {
        if (isProbablyTweetText(key, value) && value.length > best.length) best = value
        continue
      }

      if (!value || typeof value !== 'object' || depth >= MAX_DEPTH) continue

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          stack.push({ key, value: value[i], depth: depth + 1 })
        }
      } else {
        for (const [k, v] of Object.entries(value)) {
          stack.push({ key: k, value: v, depth: depth + 1 })
        }
      }
    }

    return best
  }

  const anyData = data as any

  const candidates: Array<unknown> = [
    anyData?.note_tweet?.text,
    anyData?.note_tweet?.note_tweet_results?.result?.text,
    anyData?.noteTweet?.text,
    anyData?.noteTweet?.noteTweetResults?.result?.text,
    anyData?.extended_tweet?.full_text,
    anyData?.retweeted_status?.extended_tweet?.full_text,
    anyData?.legacy?.full_text,
    anyData?.full_text,
    anyData?.text,
  ]

  const strings = candidates.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
  if (strings.length === 0) return findDeepBestText(anyData)

  // Prefer the longest option (note tweets are typically much longer than `text`).
  const best = strings.reduce((b, cur) => (cur.length > b.length ? cur : b), strings[0])
  // If it still looks truncated, try deep search (some payloads keep the full
  // text elsewhere).
  if (best.trim().endsWith('…')) {
    const deep = findDeepBestText(anyData)
    if (deep.length > best.length) return deep
  }
  return best
}

/**
 * Removes media-only shortlinks that X appends to the tweet text.
 * Examples:
 * - "pic.twitter.com/2keQnkX8VI"
 * - "https://t.co/AbCdEf1234" (often the media stub)
 *
 * We only trim these when they appear at the end of the text (optionally repeated),
 * so we don't accidentally remove legitimate links in the middle of a tweet.
 */
function stripTrailingMediaShortlinks(input: string): string {
  let text = input ?? ''
  if (!text) return ''

  // Normalize whitespace at end to make repeated stripping reliable
  text = text.replace(/\s+$/g, '')

  const picAtEnd = /(?:\s+|^)(?:https?:\/\/)?pic\.twitter\.com\/[a-z0-9]+$/i
  const tcoAtEnd = /(?:\s+|^)(?:https?:\/\/)?t\.co\/[a-z0-9]+$/i

  // Strip repeated media stubs at the end (sometimes multiple tokens)
  // Example: "text ... https://t.co/xxx pic.twitter.com/yyy"
  // Do a bounded loop to avoid any chance of infinite looping.
  for (let i = 0; i < 10; i++) {
    const before = text
    text = text.replace(picAtEnd, '').replace(/\s+$/g, '')
    text = text.replace(tcoAtEnd, '').replace(/\s+$/g, '')
    if (text === before) break
  }

  return text
}

function collectMediaShortUrls(data: any): Set<string> {
  const urls = data.entities?.urls
  if (!Array.isArray(urls)) return new Set()

  const out = new Set<string>()
  for (const u of urls) {
    const short = u?.url
    const display = u?.display_url ?? ''
    const expanded = u?.expanded_url ?? ''

    // Only target media stubs, not normal outbound links.
    const looksLikeMedia =
      display.includes('pic.twitter.com') ||
      expanded.includes('pic.twitter.com') ||
      expanded.includes('twitter.com/') && expanded.includes('/photo/')

    if (looksLikeMedia && typeof short === 'string' && short.length > 0) {
      out.add(short)
    }
  }

  return out
}

function cleanTweetText(input: string, opts: { hasImages: boolean; mediaShortUrls: Set<string> }): string {
  let text = input ?? ''
  if (!text) return ''

  // Remove `pic.twitter.com/...` anywhere (X often adds this on its own line).
  if (opts.hasImages) {
    text = text.replace(/(?:https?:\/\/)?pic\.twitter\.com\/[a-z0-9]+/gi, '')
    // Remove known media `t.co/...` stubs when we have images.
    for (const short of opts.mediaShortUrls) {
      text = text.split(short).join('')
    }
  }

  // Always strip any remaining trailing stubs and normalize whitespace.
  text = stripTrailingMediaShortlinks(text)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

  return text
}

async function fetchViaSyndication(tweetId: string): Promise<SyndicationTweet> {
  // This endpoint is fast and avoids running a headless browser in production.
  // Twitter/X now requires a token param for reliable responses; without it
  // the endpoint can return `{}` with HTTP 200.
  // Reverse engineered by Vercel's `react-tweet`.
  const getToken = (id: string) =>
    ((Number(id) / 1e15) * Math.PI)
      .toString(6 ** 2)
      .replace(/(0+|\.)/g, '')

  const url = new URL('https://cdn.syndication.twimg.com/tweet-result')
  url.searchParams.set('id', tweetId)
  url.searchParams.set('lang', 'en')
  url.searchParams.set('token', getToken(tweetId))

  const featuresCookie = [
    'tfw_timeline_list:',
    'tfw_follower_count_sunset:true',
    'tfw_tweet_edit_backend:on',
    'tfw_refsrc_session:on',
    'tfw_fosnr_soft_interventions_enabled:on',
    'tfw_show_birdwatch_pivots_enabled:on',
    'tfw_show_business_verified_badge:on',
    'tfw_duplicate_scribes_to_settings:on',
    'tfw_use_profile_image_shape_enabled:on',
    'tfw_show_blue_verified_badge:on',
    'tfw_legacy_timeline_sunset:true',
    'tfw_show_gov_verified_badge:on',
    'tfw_show_business_affiliate_badge:on',
    'tfw_tweet_edit_frontend:on',
  ].join(';')

  const response = await fetch(url.toString(), {
    headers: {
      // Some CDNs behave better with a real UA.
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://platform.twitter.com/',
      Accept: 'application/json',
      Cookie: `features=${featuresCookie}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Syndication fetch failed (HTTP ${response.status})`)
  }

  return response.json()
}

type SyndicationEmbed = {
  text: string
  avatar?: string
  images: string[]
}

async function fetchViaSyndicationEmbed(tweetId: string): Promise<SyndicationEmbed> {
  const endpoint = `https://cdn.syndication.twimg.com/tweet?id=${encodeURIComponent(tweetId)}&lang=en`
  const response = await fetch(endpoint, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://platform.twitter.com/',
      Accept: 'text/html,*/*;q=0.8',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Syndication embed fetch failed (HTTP ${response.status})`)
  }

  const html = await response.text()

  // Extract text from common embed markup
  const textMatch =
    html.match(/<p[^>]*class="[^"]*Tweet-text[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
    html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  const raw = textMatch?.[1] ?? ''
  const text = decodeHtmlEntities(
    raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim()
  )

  // Extract images + avatar by scanning <img src="...">
  const imgSrcs = Array.from(html.matchAll(/<img[^>]+src="([^"]+)"/gi)).map((m) => m[1])
  const avatar = imgSrcs.find((s) => s.includes('profile_images'))
  const images = imgSrcs
    .map((s) => normalizeTwimgMediaUrl(s))
    .filter((v): v is NormalizedMedia => Boolean(v))
    .filter((v) => v.kind === 'photo')
    .map((v) => v.url)

  return {
    text,
    avatar,
    images: Array.from(new Set(images)).slice(0, 4),
  }
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

/** CORS headers for public API access (required for x-post-card-visualizer npm package) */
function corsHeaders(): HeadersInit {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Check for demo/sample mode
    const keyword = url.toLowerCase().trim()
    if (SAMPLE_POSTS[keyword]) {
      const sample = SAMPLE_POSTS[keyword]
      return NextResponse.json({
        ...sample,
        author: {
          ...sample.author,
          // Keep demo mode consistent with production: proxy remote images so export works reliably.
          avatar: proxyImageUrl(sample.author.avatar),
        },
      }, { headers: corsHeaders() })
    }

    // Validate it's an X/Twitter URL
    const xUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/i
    const match = url.match(xUrlPattern)

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const [, , username, tweetId] = match

    // --- Production-first: use fast endpoints (avoid headless browser on Vercel) ---
    // 1) Try syndication JSON (best fidelity for modern posts).
    try {
      const data = await fetchViaSyndication(tweetId)
      const tweet = unwrapSyndicationTweet(data)
      const user = unwrapSyndicationUser(data, tweet)
      
      // Use the improved media extraction
      const images = extractMedia(tweet)
      const mediaShortUrls = collectMediaShortUrls(tweet)
      const rawText = extractBestText(tweet)
      const text = cleanTweetText(rawText, { hasImages: images.length > 0, mediaShortUrls })

      const name = user?.name || username
      const handle = user?.screen_name ? `@${user.screen_name}` : `@${username}`
      
      // Use the improved avatar normalization
      const avatarRaw = normalizeAvatarUrl(user?.profile_image_url_https) || `https://unavatar.io/twitter/${username}`
      
      const verified = Boolean(user?.verified || user?.is_blue_verified)
      const timestamp = tweet?.created_at
        ? new Date(tweet.created_at).toISOString()
        : new Date().toISOString()

      if (text || images.length > 0) {
        return NextResponse.json({
          author: { name, handle, avatar: proxyImageUrl(avatarRaw), verified },
          content: { text, images: proxyImageUrls(images) },
          timestamp,
        }, { headers: corsHeaders() })
      }
    } catch (e) {
      // Log detailed error in development, but don't expose to client
      if (process.env.NODE_ENV === 'development') {
        console.warn('Syndication scrape failed:', e instanceof Error ? e.message : e)
      }
    }

    // 1b) Brute-force fallback: syndication embed HTML (often works when JSON is brittle)
    try {
      const embed = await fetchViaSyndicationEmbed(tweetId)
      const images = extractMedia({ photos: embed.images.map((url) => ({ url })) } as any)
      const text = cleanTweetText(embed.text, { hasImages: images.length > 0, mediaShortUrls: new Set() })

      if (text || images.length > 0) {
        const avatarRaw = normalizeAvatarUrl(embed.avatar) || `https://unavatar.io/twitter/${username}`
        return NextResponse.json({
          author: {
            name: username,
            handle: `@${username}`,
            avatar: proxyImageUrl(avatarRaw),
            verified: false,
          },
          content: { text, images: proxyImageUrls(images) },
          timestamp: new Date().toISOString(),
        }, { headers: corsHeaders() })
      }
    } catch (e) {
      // Log detailed error in development, but don't expose to client
      if (process.env.NODE_ENV === 'development') {
        console.warn('Syndication embed scrape failed:', e instanceof Error ? e.message : e)
      }
    }

    // 2) Fallback: oEmbed (works even for very old posts; text-only, no images).
    try {
      const canonicalUrl = `https://twitter.com/${username}/status/${tweetId}`
      const oembed = await fetchViaOEmbed(canonicalUrl)
      const text = cleanTweetText(oembed.html ? extractTextFromOEmbedHtml(oembed.html) : '', { hasImages: false, mediaShortUrls: new Set() })
      const timestamp = oembed.html ? extractDateFromOEmbedHtml(oembed.html) : null

      if (text) {
        return NextResponse.json({
          author: {
            name: oembed.author_name || username,
            // `author_name` can include spaces/emojis; always use the URL username for handle + avatar lookup.
            handle: `@${username}`,
            avatar: proxyImageUrl(`https://unavatar.io/twitter/${username}`),
            verified: false,
          },
          content: { text, images: [] },
          timestamp: timestamp || new Date().toISOString(),
        }, { headers: corsHeaders() })
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('oEmbed scrape failed:', e instanceof Error ? e.message : e)
      }
    }

    // Stop here: this API uses the fast syndication + oEmbed endpoints only.
    // Headless browser scraping is intentionally avoided for Vercel reliability.
    return NextResponse.json(
      { error: 'Post unavailable' },
      { status: 503, headers: corsHeaders() }
    )

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Scraping error:', message)
    }
    return NextResponse.json(
      { error: 'Load failed' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}
