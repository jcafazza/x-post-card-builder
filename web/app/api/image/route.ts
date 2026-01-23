import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

function isAllowedImageHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'pbs.twimg.com') return true
  if (h === 'video.twimg.com') return true
  if (h.endsWith('.twimg.com')) return true
  if (h === 'unavatar.io') return true
  return false
}

function guessContentType(url: string): string {
  const lower = url.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        // Twimg/CDNs behave much more reliably with a real UA + referer.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://platform.twitter.com/',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      // Avoid caching issues from intermediaries; we control caching headers below.
      cache: 'no-store',
    })
  } finally {
    clearTimeout(t)
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (target.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only https images are allowed' }, { status: 400 })
  }

  if (!isAllowedImageHost(target.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  try {
    const res = await fetchWithTimeout(target.toString(), 12000)
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream failed (${res.status})` }, { status: 502 })
    }

    const buf = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || guessContentType(target.toString())

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Same-origin URL now, so canvas export + Safari should behave.
        'Access-Control-Allow-Origin': '*',
        // Cache aggressively at the edge; these URLs are content-addressed/stable.
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Image proxy failed' },
      { status: 502 }
    )
  }
}

