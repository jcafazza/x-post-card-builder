'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import InteractivePostCard from '@/components/InteractivePostCard'
import AnimatedHandMetal from '@/components/AnimatedHandMetal'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fetchPostData } from '@/lib/api'
import { getThemeStyles } from '@/lib/themes'
import { isShadow, isTheme } from '@/types/post'
import type { CardSettings, PostData, ShadowIntensity, Theme } from '@/types/post'
import {
  ANIMATION_DELIBERATE,
  EASING_ELEGANT,
  EASING_STANDARD,
  ENTRANCE_DELAY_CARD,
  FOOTER_FADE_HEIGHT,
  FOOTER_FADE_OPACITY,
  FOOTER_FADE_STOP,
  SHARE_LOADING_MIN_MS,
  SHARE_PHASE2_DELAY_MS,
  SHARE_PHASE2_DURATION_MS,
} from '@/constants/ui'
import { hexToRgba } from '@/lib/utils'
import {
  CARD_DEFAULT_RADIUS,
  CARD_DEFAULT_WIDTH,
  CARD_MAX_RADIUS,
  CARD_MAX_WIDTH,
  CARD_MIN_WIDTH,
} from '@/constants/card'

/** Parse window.location.search into sourceUrl + initialSettings (no suspend). */
function parseShareSearch(search: string): { sourceUrl: string | null; initialSettings: CardSettings } {
  const params = new URLSearchParams(search)
  const themeParam = params.get('theme')
  const shadowParam = params.get('shadow')
  const cardWidthParam = params.get('cardWidth')
  const radiusParam = params.get('radius')

  const theme: Theme = isTheme(themeParam) ? themeParam : 'light'
  const shadowIntensity: ShadowIntensity = isShadow(shadowParam) ? shadowParam : 'floating'
  const showDate = false

  const rawWidth = Number(cardWidthParam ?? CARD_DEFAULT_WIDTH)
  const cardWidth = Number.isFinite(rawWidth)
    ? Math.max(CARD_MIN_WIDTH, Math.min(CARD_MAX_WIDTH, Math.round(rawWidth / 2) * 2))
    : CARD_DEFAULT_WIDTH

  const rawRadius = Number(radiusParam ?? CARD_DEFAULT_RADIUS)
  const customBorderRadius = Number.isFinite(rawRadius)
    ? Math.max(0, Math.min(CARD_MAX_RADIUS, rawRadius))
    : CARD_DEFAULT_RADIUS

  return {
    sourceUrl: params.get('url'),
    initialSettings: {
      theme,
      borderRadius: '20',
      shadowIntensity,
      showDate,
      cardWidth,
      customBorderRadius,
    },
  }
}

/**
 * Renders share content with URL-derived sourceUrl and initialSettings.
 * Fetches post, handles loading/error, and runs card entrance + phase-2 (shadow + button) animations.
 */
function SharePageContent({
  sourceUrl,
  initialSettings,
}: {
  sourceUrl: string | null
  initialSettings: CardSettings
}) {
  const [settings, setSettings] = useState<CardSettings>(initialSettings)

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const theme = getThemeStyles(settings.theme)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--share-bg', theme.appBg)
    root.style.setProperty('--share-text', theme.appText)
    root.style.setProperty('--share-muted', theme.textSecondary)
    return () => {
      root.style.removeProperty('--share-bg')
      root.style.removeProperty('--share-text')
      root.style.removeProperty('--share-muted')
    }
  }, [theme.appBg, theme.appText, theme.textSecondary])

  const [post, setPost] = useState<PostData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cardRevealed, setCardRevealed] = useState(false)
  const [phase2Revealed, setPhase2Revealed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phase2TimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const minLoadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadPost() {
      if (!sourceUrl) {
        setError('Missing URL.')
        setPost(null)
        return
      }
      const startedAt = Date.now()
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchPostData(sourceUrl)
        if (cancelled) return
        setPost(data)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load post.')
        setPost(null)
      } finally {
        if (cancelled) return
        const elapsed = Date.now() - startedAt
        const remaining = Math.max(0, SHARE_LOADING_MIN_MS - elapsed)
        minLoadingTimeoutRef.current = setTimeout(() => {
          minLoadingTimeoutRef.current = null
          if (!cancelled) setIsLoading(false)
        }, remaining)
      }
    }
    void loadPost()
    return () => {
      cancelled = true
      if (minLoadingTimeoutRef.current) {
        clearTimeout(minLoadingTimeoutRef.current)
        minLoadingTimeoutRef.current = null
      }
    }
  }, [sourceUrl])

  useEffect(() => {
    if (!post) return
    let cancelled = false
    const delay = prefersReducedMotion ? 0 : ENTRANCE_DELAY_CARD
    revealTimeoutRef.current = setTimeout(() => {
      if (!cancelled) setCardRevealed(true)
      revealTimeoutRef.current = null
    }, delay)
    return () => {
      cancelled = true
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current)
        revealTimeoutRef.current = null
      }
    }
  }, [post, prefersReducedMotion])

  // After card entrance ends (2s), reveal shadow + "View original post" button together
  useEffect(() => {
    if (!cardRevealed || prefersReducedMotion) return
    phase2TimeoutRef.current = setTimeout(() => {
      setPhase2Revealed(true)
      phase2TimeoutRef.current = null
    }, SHARE_PHASE2_DELAY_MS)
    return () => {
      if (phase2TimeoutRef.current) {
        clearTimeout(phase2TimeoutRef.current)
        phase2TimeoutRef.current = null
      }
    }
  }, [cardRevealed, prefersReducedMotion])

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center gap-4 animate-in fade-in zoom-in"
        style={{
          color: theme.textSecondary,
          transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}`,
        }}
      >
        <AnimatedHandMetal size={40} />
        <span className="text-sm font-medium">Vibin&apos; &amp; cookin&apos;…</span>
      </div>
    )
  }
  if (error) {
    return (
      <div
        className="text-sm font-medium"
        style={{
          color: theme.error,
          transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}`,
        }}
      >
        {error}
      </div>
    )
  }
  if (!post) return null

  return (
    <div
      className={cardRevealed ? 'share-card-entrance' : undefined}
      style={
        cardRevealed
          ? undefined
          : {
              opacity: 0,
              transform: 'translateY(100vh)',
            }
      }
    >
      <InteractivePostCard
        post={post}
        settings={settings}
        onSettingsChange={setSettings}
        sourceUrl={sourceUrl ?? undefined}
        lockLayout
        sharePhase2Revealed={phase2Revealed}
        sharePhase2DurationMs={SHARE_PHASE2_DURATION_MS}
      />
    </div>
  )
}

/**
 * Client-only share page. Reads query from window.location.search so we never suspend
 * (useSearchParams can leave the page stuck on the Suspense fallback). Parses url + settings
 * and renders SharePageContent.
 */
export default function InteractiveSharePage() {
  const pathname = usePathname()
  const [parsed, setParsed] = useState<{
    sourceUrl: string | null
    initialSettings: CardSettings
  } | null>(null)

  // Read query after paint and when pathname is /share (client with real URL; handles soft nav).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const apply = () => setParsed(parseShareSearch(window.location.search))
    const raf = requestAnimationFrame(apply)
    return () => cancelAnimationFrame(raf)
  }, [pathname])

  // Fallback: re-read after load in case the URL wasn't ready on first paint.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const onLoad = () => setParsed((prev) => prev === null ? parseShareSearch(window.location.search) : prev)
    if (document.readyState === 'complete') {
      onLoad()
      return undefined
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  // Re-read on back/forward.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onPopState = () => setParsed(parseShareSearch(window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Footer uses URL theme (parsed?.initialSettings?.theme) so it matches the share page
  const footerTheme = getThemeStyles(parsed?.initialSettings?.theme ?? 'light')

  if (parsed === null) {
    return (
      <>
        <div
          className="flex flex-col items-center gap-4 animate-in fade-in zoom-in"
          style={{
            color: 'var(--share-muted, #666)',
            transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}`,
          }}
        >
          <AnimatedHandMetal size={40} />
          <span className="text-sm font-medium">Vibin&apos; &amp; cookin&apos;…</span>
        </div>
        <SharePageFooter theme={footerTheme} />
      </>
    )
  }

  return (
    <>
      <SharePageContent sourceUrl={parsed.sourceUrl} initialSettings={parsed.initialSettings} />
      <SharePageFooter theme={footerTheme} />
    </>
  )
}

/** Footer (fade plate + privacy note) using share page theme. */
function SharePageFooter({ theme }: { theme: ReturnType<typeof getThemeStyles> }) {
  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none z-[40]"
        style={{
          height: FOOTER_FADE_HEIGHT,
          background: `linear-gradient(to top, ${hexToRgba(theme.appBg, FOOTER_FADE_OPACITY)} 0%, ${hexToRgba(theme.appBg, FOOTER_FADE_OPACITY)} ${FOOTER_FADE_STOP * 100}%, ${hexToRgba(theme.appBg, 0)} 100%)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            maskImage: `linear-gradient(to top, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to top, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
            pointerEvents: 'none',
          }}
        />
      </div>
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap z-[50]"
        style={{
          color: theme.textTertiary,
          opacity: 0.6,
          transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, opacity ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
          pointerEvents: 'none',
        }}
      >
        No login. No tracking. We don&apos;t store your posts. Public posts only.
      </div>
    </>
  )
}
