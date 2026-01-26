/**
 * Custom React hook to detect user's motion preference.
 * 
 * Returns `true` if the user prefers reduced motion (respects `prefers-reduced-motion` media query).
 * This is important for accessibility - some users experience motion sickness or vestibular disorders.
 * 
 * @returns `true` if user prefers reduced motion, `false` otherwise
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 * 
 * return (
 *   <div
 *     style={{
 *       transition: prefersReducedMotion ? 'none' : `opacity ${ANIMATION_STANDARD}ms ${EASING_ELEGANT}`
 *     }}
 *   >
 *     Content
 *   </div>
 * )
 * ```
 */
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // SSR safety check: window is undefined during server-side rendering
    if (typeof window === 'undefined') return

    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } catch (error) {
      // Fallback for browsers that don't support matchMedia
      // Default to false (no reduced motion) if API is unavailable
      // Browser compatibility warning - safe to log in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('prefers-reduced-motion not supported:', error)
      }
      return
    }
  }, [])

  return prefersReducedMotion
}
