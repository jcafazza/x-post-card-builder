'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import InteractivePostCard from '@/components/InteractivePostCard'
import AnimatedHandMetal from '@/components/AnimatedHandMetal'
import { fetchPostData } from '@/lib/api'
import { getThemeStyles } from '@/lib/themes'
import { isShadow, isTheme } from '@/types/post'
import type { CardSettings, PostData, ShadowIntensity, Theme } from '@/types/post'
import { ANIMATION_DELIBERATE, EASING_ELEGANT, EASING_STANDARD } from '@/constants/ui'
import { 
  CARD_MIN_WIDTH, 
  CARD_MAX_WIDTH, 
  CARD_DEFAULT_WIDTH, 
  CARD_DEFAULT_RADIUS 
} from '@/constants/card'

/**
 * Share Preview Page
 * 
 * A minimal, interactive page for viewing and tinkering with shared X post cards.
 * Accepts design settings via URL search parameters.
 */
export default function SharePage() {
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
    const customBorderRadius = Number.isFinite(rawRadius) ? Math.max(0, Math.min(60, rawRadius)) : CARD_DEFAULT_RADIUS

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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-12"
      style={{
        transition: `background-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
        backgroundColor: theme.appBg,
        color: theme.appText,
      }}
    >
      {isLoading ? (
        <div
          className="flex flex-col items-center gap-4 animate-in fade-in zoom-in"
          style={{ 
            color: theme.textSecondary, 
            transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}`,
            animationDuration: `${ANIMATION_DELIBERATE}ms`
          }}
        >
          <AnimatedHandMetal size={40} />
          <span className="text-sm font-medium">Vibin&apos; &amp; cookin&apos;...</span>
        </div>
      ) : error ? (
        <div
          className="text-sm font-medium"
          style={{ color: theme.error, transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}` }}
        >
          {error}
        </div>
      ) : post ? (
        <InteractivePostCard post={post} settings={settings} onSettingsChange={setSettings} />
      ) : null}
    </div>
  )
}
