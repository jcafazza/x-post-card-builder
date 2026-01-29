import { Suspense } from 'react'
import InteractiveSharePage from './share-client'
import AnimatedHandMetal from '@/components/AnimatedHandMetal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { getThemeStyles } from '@/lib/themes'
import { ANIMATION_DELIBERATE, EASING_ELEGANT, EASING_STANDARD } from '@/constants/ui'

/**
 * Share Preview Page
 *
 * A minimal, interactive page for viewing and tinkering with shared X post cards.
 * Accepts design settings via URL search parameters.
 */
export default function SharePage() {
  // Fallback loader uses the default theme (light) since we can't read search params here.
  const theme = getThemeStyles('light')

  return (
    <div
      className="min-h-screen flex items-center justify-center p-12"
      style={{
        transition: `background-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
        // Use CSS variables so the client component can update the share page theme
        // after reading URL params, while keeping a sensible server-rendered fallback.
        backgroundColor: `var(--share-bg, ${theme.appBg})`,
        color: `var(--share-text, ${theme.appText})`,
      }}
    >
      <ErrorBoundary theme="light">
        <Suspense
          fallback={
            <div
              className="flex flex-col items-center gap-4 animate-in fade-in zoom-in"
              style={{
                color: `var(--share-muted, ${theme.textSecondary})`,
                transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}`,
                animationDuration: `${ANIMATION_DELIBERATE}ms`,
              }}
            >
              <AnimatedHandMetal size={40} />
              <span className="text-sm font-medium">Vibin&apos; &amp; cookin&apos;…</span>
            </div>
          }
        >
          <InteractiveSharePage />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
