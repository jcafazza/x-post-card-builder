'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import InteractivePostCard from '@/components/InteractivePostCard'
import { fetchPostData } from '@/lib/api'
import { getThemeStyles } from '@/lib/themes'
import { isShadow, isTheme } from '@/types/post'
import type { CardSettings, PostData, ShadowIntensity, Theme } from '@/types/post'
import { ANIMATION_DELIBERATE, EASING_ELEGANT, EASING_STANDARD } from '@/constants/ui'
import {
  CARD_DEFAULT_RADIUS,
  CARD_DEFAULT_WIDTH,
  CARD_MAX_RADIUS,
  CARD_MAX_WIDTH,
  CARD_MIN_WIDTH,
} from '@/constants/card'

/**
 * Client-only share page logic.
 *
 * This component uses `useSearchParams()` which requires a Suspense boundary
 * in Next.js. The server `page.tsx` wraps this component in `<Suspense />`.
 */
export default function InteractiveSharePage() {
  const searchParams = useSearchParams()
  const sourceUrl = searchParams.get('url')

  // Parse initial settings from URL or fall back to defaults
  const initialSettings: CardSettings = useMemo(() => {
    const themeParam = searchParams.get('theme')
    const shadowParam = searchParams.get('shadow')
    const showDateParam = searchParams.get('showDate')
    const cardWidthParam = searchParams.get('cardWidth')
    const radiusParam = searchParams.get('radius')

    const theme: Theme = isTheme(themeParam) ? themeParam : 'light'
    const shadowIntensity: ShadowIntensity = isShadow(shadowParam) ? shadowParam : 'floating'
    const showDate = showDateParam !== '0'

    const rawWidth = Number(cardWidthParam ?? CARD_DEFAULT_WIDTH)
    const cardWidth = Number.isFinite(rawWidth)
      ? Math.max(CARD_MIN_WIDTH, Math.min(CARD_MAX_WIDTH, Math.round(rawWidth / 2) * 2))
      : CARD_DEFAULT_WIDTH

    const rawRadius = Number(radiusParam ?? CARD_DEFAULT_RADIUS)
    const customBorderRadius = Number.isFinite(rawRadius)
      ? Math.max(0, Math.min(CARD_MAX_RADIUS, rawRadius))
      : CARD_DEFAULT_RADIUS

    return {
      theme,
      borderRadius: '20',
      shadowIntensity,
      showDate,
      cardWidth,
      customBorderRadius,
    }
  }, [searchParams])

  const [settings, setSettings] = useState<CardSettings>(initialSettings)

  // Synchronize state if URL parameters change (e.g., via browser navigation)
  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const theme = getThemeStyles(settings.theme)

  // Keep the *page* background in sync with the chosen theme (not just the card).
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

  // Fetch post data based on the provided source URL
  useEffect(() => {
    let cancelled = false

    async function loadPost() {
      if (!sourceUrl) {
        setError('Missing URL.')
        setPost(null)
        return
      }

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
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadPost()

    return () => {
      cancelled = true
    }
  }, [sourceUrl])

  if (isLoading) {
    // Keep the server fallback visible while loading.
    return null
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

  return <InteractivePostCard post={post} settings={settings} onSettingsChange={setSettings} />
}

