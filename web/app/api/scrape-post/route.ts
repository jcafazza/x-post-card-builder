/**
 * X Post Scraper API Route
 *
 * Uses Puppeteer (with @sparticuz/chromium for Vercel) to scrape X posts by:
 * 1. Loading the page in a real browser
 * 2. Waiting for JavaScript to render
 * 3. Extracting post data from the DOM
 */

import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'

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

// Helper to determine if we are running in a local environment
const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL

type SyndicationTweet = {
  text?: string
  created_at?: string
  user?: {
    name?: string
    screen_name?: string
    profile_image_url_https?: string
    verified?: boolean
  }
  photos?: Array<{ url?: string }>
  mediaDetails?: Array<{ media_url_https?: string }>
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

    // --- Production path: fast syndication fetch (no headless browser) ---
    try {
      const data = await fetchViaSyndication(tweetId)
      const text = data.text ?? ''
      const images = Array.isArray(data.photos)
        ? data.photos.map((p) => p?.url).filter(Boolean) as string[]
        : Array.isArray(data.mediaDetails)
          ? data.mediaDetails.map((m) => m?.media_url_https).filter(Boolean) as string[]
          : []

      const name = data.user?.name || username
      const handle = data.user?.screen_name ? `@${data.user.screen_name}` : `@${username}`
      const avatar = data.user?.profile_image_url_https || `https://unavatar.io/twitter/${username}`
      const verified = Boolean(data.user?.verified)
      const timestamp = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString()

      if (text) {
        return NextResponse.json({
          author: { name, handle, avatar, verified },
          content: { text, images },
          timestamp,
        })
      }
    } catch (e) {
      // If syndication fails, fall through to the (slower) Puppeteer path in local dev.
      console.warn('Syndication scrape failed:', e instanceof Error ? e.message : e)
      if (!isLocal) {
        return NextResponse.json(
          { error: 'Could not load post in production. Try again or use: demo, startup, code, ai, product' },
          { status: 503 }
        )
      }
    }

    // Configure Puppeteer for production (Vercel) vs Local
    let browser = null
    try {
      console.log(`Launching browser for ${url}... environment: ${isLocal ? 'local' : 'production'}`)

      // `@sparticuz/chromium-min`'s `headless` type can differ across versions.
      // Puppeteer expects `true` or `"shell"`; we normalize to a safe value.
      const chromiumHeadless = (chromium as any).headless as unknown
      const headless: true | 'shell' = chromiumHeadless === 'shell' ? 'shell' : true

      const options = isLocal 
        ? {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: process.platform === 'darwin' 
              ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
              : '/usr/bin/google-chrome',
            headless: true,
          }
        : {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar'),
            headless,
          }

      // Explicitly cast options as any to bypass strict LaunchOptions typing which varies between local/prod deps
      browser = await puppeteer.launch(options as any)
      const page = await browser.newPage()

      // Set a realistic viewport and user agent
      await page.setViewport({ width: 1280, height: 800 })
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

      // Navigate to the post
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 25000 // Increased timeout for serverless cold starts
      })

      // Wait for the tweet content to load
      await page.waitForSelector('article[data-testid="tweet"]', { timeout: 15000 })

      // Extract data from the rendered page
      const postData = await page.evaluate(() => {
        const article = document.querySelector('article[data-testid="tweet"]')
        if (!article) return null

        // Get author info
        const userNameEl = article.querySelector('[data-testid="User-Name"]')
        const displayName = userNameEl?.querySelector('span')?.textContent || ''
        const handleEl = userNameEl?.querySelectorAll('span')
        let handle = ''
        handleEl?.forEach(span => {
          const text = span.textContent || ''
          if (text.startsWith('@')) handle = text
        })

        // Get avatar
        const avatarImg = article.querySelector('img[src*="profile_images"]') as HTMLImageElement
        const avatar = avatarImg?.src?.replace('_normal', '_400x400') || ''

        // Check for verified badge
        const verified = !!article.querySelector('[data-testid="icon-verified"]')

        // Get tweet text
        const tweetTextEl = article.querySelector('[data-testid="tweetText"]')
        const text = tweetTextEl?.textContent || ''

        // Get images
        const images: string[] = []
        const imageEls = article.querySelectorAll('[data-testid="tweetPhoto"] img') as NodeListOf<HTMLImageElement>
        imageEls.forEach(img => {
          if (img.src && !img.src.includes('profile_images')) {
            const highQualitySrc = img.src.replace(/&name=\w+/, '&name=large')
            images.push(highQualitySrc)
          }
        })

        // Get timestamp
        const timeEl = article.querySelector('time')
        const timestamp = timeEl?.getAttribute('datetime') || new Date().toISOString()

        return {
          author: {
            name: displayName,
            handle: handle || '@unknown',
            avatar: avatar || '',
            verified,
          },
          content: {
            text,
            images,
          },
          timestamp,
        }
      })

      await browser.close()
      browser = null

      if (postData && postData.content.text) {
        if (!postData.author.avatar) {
          postData.author.avatar = `https://unavatar.io/twitter/${username}`
        }
        return NextResponse.json(postData)
      }

      return NextResponse.json(
        { error: 'Could not extract post content. The post may be protected.' },
        { status: 404 }
      )

    } catch (browserError: any) {
      console.error('Browser scraping error:', browserError.message)
      if (browser) await browser.close()

      return NextResponse.json(
        {
          error: browserError.message?.includes('timeout')
            ? 'Page took too long to load. Try again.'
            : 'Could not load post. Try: demo, startup, code, ai, or product'
        },
        { status: 503 }
      )
    }

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
