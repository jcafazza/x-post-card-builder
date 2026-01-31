'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import type { XCardProps, PostData, Theme, ShadowIntensity } from './types'
import { getThemeStyles } from './themes'
import { PostCard, PostCardSkeleton } from './PostCard'

/**
 * Default API endpoint for fetching post data.
 * Deploy the web app (this repo's `web` folder) to Vercel with project name "x-post-card-visualizer",
 * or pass `apiUrl` to XCard with your deployment URL.
 */
export const DEFAULT_API_URL = 'https://x-post-card-visualizer.vercel.app/api/scrape-post'

/** Valid theme values */
const VALID_THEMES: Theme[] = ['light', 'dim', 'dark']

/** Valid shadow values */
const VALID_SHADOWS: ShadowIntensity[] = ['flat', 'raised', 'floating', 'elevated']

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Validate and normalize theme prop */
function normalizeTheme(theme: string): Theme {
  return VALID_THEMES.includes(theme as Theme) ? (theme as Theme) : 'light'
}

/** Validate and normalize shadow prop */
function normalizeShadow(shadow: string): ShadowIntensity {
  return VALID_SHADOWS.includes(shadow as ShadowIntensity) ? (shadow as ShadowIntensity) : 'floating'
}

/** Default error display */
function ErrorDisplay({
  error,
  width,
  radius,
}: {
  error: Error
  width: number
  radius: number
}) {
  return (
    <div
      style={{
        width,
        padding: 24,
        borderRadius: radius,
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        fontSize: 14,
        textAlign: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <p style={{ margin: 0, fontWeight: 500 }}>Failed to load post</p>
      <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: 13 }}>{error.message}</p>
    </div>
  )
}

/**
 * XCard - Embed beautifully styled X (Twitter) post cards in your React app.
 *
 * @example
 * ```tsx
 * import { XCard } from 'x-post-card-visualizer'
 *
 * function MyComponent() {
 *   return (
 *     <XCard
 *       url="https://x.com/elonmusk/status/123456789"
 *       theme="dark"
 *       shadow="floating"
 *       width={450}
 *       radius={20}
 *     />
 *   )
 * }
 * ```
 */
export function XCard({
  url,
  theme = 'light',
  shadow = 'floating',
  width = 450,
  radius = 20,
  apiUrl = DEFAULT_API_URL,
  className,
  fallback,
  onError,
  onLoad,
}: XCardProps) {
  const [post, setPost] = useState<PostData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  // Refs for callbacks to avoid re-fetching when parent doesn't memoize them
  const onErrorRef = useRef(onError)
  const onLoadRef = useRef(onLoad)
  useEffect(() => {
    onErrorRef.current = onError
    onLoadRef.current = onLoad
  })

  // Normalize and clamp props to valid ranges
  const normalizedTheme = normalizeTheme(theme)
  const normalizedShadow = normalizeShadow(shadow)
  const clampedWidth = clamp(width, 350, 700)
  const clampedRadius = clamp(radius, 0, 24)

  // Get theme styles with validated theme
  const themeStyles = getThemeStyles(normalizedTheme)

  useEffect(() => {
    let cancelled = false

    async function fetchPost() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch post (${response.status})`)
        }

        const data = await response.json()

        if (cancelled) return

        setPost(data)
        onLoadRef.current?.(data)
      } catch (err) {
        if (cancelled) return

        const error = err instanceof Error ? err : new Error('Unknown error occurred')
        setError(error)
        onErrorRef.current?.(error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPost()

    return () => {
      cancelled = true
    }
  }, [url, apiUrl])

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        {fallback || <PostCardSkeleton width={clampedWidth} radius={clampedRadius} />}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <ErrorDisplay error={error} width={clampedWidth} radius={clampedRadius} />
      </div>
    )
  }

  // Success state
  if (post) {
    return (
      <div className={className}>
        <PostCard
          post={post}
          theme={themeStyles}
          shadow={normalizedShadow}
          width={clampedWidth}
          radius={clampedRadius}
        />
      </div>
    )
  }

  return null
}
