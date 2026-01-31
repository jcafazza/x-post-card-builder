'use client'

import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import Image from 'next/image'
import InteractivePostCard from '@/components/InteractivePostCard'
import Toolbar from '@/components/Toolbar'
import URLInput from '@/components/URLInput'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import SnippetModal from '@/components/SnippetModal'
import { buildSnippet } from '@/lib/snippet'
import { PostData, CardSettings } from '@/types/post'
import { getDefaultPlaceholder } from '@/lib/placeholder'
import { getThemeStyles } from '@/lib/themes'
import { hexToRgba } from '@/lib/utils'
import {
  ANIMATION_STANDARD,
  ANIMATION_DELIBERATE,
  ANIMATION_EXTENDED,
  EASING_STANDARD,
  EASING_BOUNCE,
  THEME_TRANSITION,
  ENTRANCE_DELAY_HEADER,
  ENTRANCE_DELAY_TOOLBAR,
  ENTRANCE_DELAY_CARD,
  CONTENT_VERTICAL_SPACING,
  TOOLBAR_CARD_SPACING,
  FOOTER_FADE_HEIGHT,
  TOOLBAR_FADE_ZONE,
  FOOTER_FADE_OPACITY,
  FOOTER_FADE_STOP,
  FOOTER_SCROLL_CLEAR_EXTRA,
} from '@/constants/ui'

const INITIAL_SETTINGS: CardSettings = {
  theme: 'light',
  borderRadius: '20',
  shadowIntensity: 'floating',
  showDate: false,
  cardWidth: 500,
  customBorderRadius: 20,
}

export default function Home() {
  const [post, setPost] = useState<PostData | null>(() => getDefaultPlaceholder())
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [settings, setSettings] = useState<CardSettings>(INITIAL_SETTINGS)
  const [logoAnimation, setLogoAnimation] = useState(false)
  const [toolbarOpacity, setToolbarOpacity] = useState(1)
  const [snippetDrawerOpen, setSnippetDrawerOpen] = useState(false)
  const [snippetModalKey, setSnippetModalKey] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  const openSnippetModal = () => {
    setSnippetModalKey((k) => k + 1)
    setSnippetDrawerOpen(true)
  }
  const mainRef = useRef<HTMLElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const handleReset = () => {
    setPost(getDefaultPlaceholder())
    setSourceUrl(null)
    setUrlInput('')
    setSettings(INITIAL_SETTINGS)
  }

  const theme = getThemeStyles(settings.theme)

  // Header is fixed at top-6 (24px) with height 68px (44px input + 12px top padding + 12px bottom padding)
  // Header bottom edge: 24px (top) + 68px (height) = 92px
  const HEADER_BOTTOM = 24 + 68
  // Toolbar top margin: header bottom + spacing (for scrollable content)
  const TOOLBAR_TOP_MARGIN = HEADER_BOTTOM + CONTENT_VERTICAL_SPACING

  // Track scroll position to fade toolbar in/out
  useEffect(() => {
    const main = mainRef.current
    const toolbar = toolbarRef.current
    if (!main || !toolbar || prefersReducedMotion) return

    const handleScroll = () => {
      try {
        const toolbarRect = toolbar.getBoundingClientRect()
        const toolbarTop = toolbarRect.top
        const toolbarBottom = toolbarRect.bottom
        const viewportHeight = window.innerHeight
        const fadeZone = TOOLBAR_FADE_ZONE

        if (toolbarBottom < -fadeZone || toolbarTop > viewportHeight + fadeZone) {
          setToolbarOpacity(0)
        } else if (toolbarTop < -fadeZone) {
          const progress = Math.min(1, Math.max(0, (toolbarTop + fadeZone) / fadeZone))
          setToolbarOpacity(1 - progress)
        } else if (toolbarBottom > viewportHeight + fadeZone) {
          const progress = Math.min(1, Math.max(0, (toolbarBottom - viewportHeight) / fadeZone))
          setToolbarOpacity(1 - progress)
        } else {
          setToolbarOpacity(1)
        }
      } catch {
        // Safari/WebKit can throw during scroll events
      }
    }

    main.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      main.removeEventListener('scroll', handleScroll)
    }
  }, [prefersReducedMotion])

  return (
    <div
      className="min-h-screen font-sans selection:bg-neutral-500/30 flex flex-col overflow-hidden relative"
      style={{
        transition: THEME_TRANSITION,
        backgroundColor: theme.appBg,
        color: theme.appText
      }}
    >
      {/* Top fade plate: solid color + mask so background-color transitions in sync with theme */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none z-[45]"
        style={{ height: FOOTER_FADE_HEIGHT }}
      >
        {/* Color layer (transitions); mask creates the fade shape */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: hexToRgba(theme.appBg, FOOTER_FADE_OPACITY),
            transition: prefersReducedMotion ? 'none' : THEME_TRANSITION,
            maskImage: `linear-gradient(to bottom, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            maskImage: `linear-gradient(to bottom, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Header UI Plate - Houses Logo and URLInput */}
      <header
        className={prefersReducedMotion ? "fixed top-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 px-3 py-3 border rounded-full z-50 isolate" : "fixed top-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 px-3 py-3 border rounded-full z-50 isolate animate-in fade-in slide-in-from-top-4"}
        style={{
          ...(prefersReducedMotion ? {} : {
            animationDuration: `${ANIMATION_EXTENDED}ms`,
            animationTimingFunction: EASING_STANDARD,
            animationDelay: `${ENTRANCE_DELAY_HEADER}ms`,
          }),
          transition: prefersReducedMotion ? 'none' : THEME_TRANSITION,
          backgroundColor: theme.headerBg,
          borderColor: theme.headerOuterStroke,
          borderWidth: '1px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo Outside of Input */}
        <button
          type="button"
          aria-label="X logo"
          className="flex items-center justify-center w-11 h-11 rounded-full overflow-hidden gap-0 bg-transparent border-0 p-0 cursor-pointer"
          style={{
            backgroundColor: theme.appText,
            transition: prefersReducedMotion ? 'none' : THEME_TRANSITION,
          }}
          onDoubleClick={() => {
            if (!prefersReducedMotion) {
              setLogoAnimation(true)
              setTimeout(() => setLogoAnimation(false), ANIMATION_STANDARD)
            }
          }}
        >
          <Image
            src="/assets/xLogo.svg"
            alt=""
            width={16}
            height={16}
            style={{
              width: 16,
              height: 16,
              objectFit: 'contain',
              transition: prefersReducedMotion ? 'none' : THEME_TRANSITION + `, transform ${ANIMATION_STANDARD}ms ${EASING_BOUNCE}`,
              filter: theme.appBg === '#FAFAFA' ? 'invert(1)' : 'none',
              transform: logoAnimation ? 'rotate(360deg) scale(1.2)' : 'rotate(0deg) scale(1)',
            }}
          />
        </button>
        
        {/* URL Input Pill */}
        <div className="w-[480px]">
          <URLInput 
            onPostLoad={setPost} 
            onSourceUrlChange={setSourceUrl}
            onClear={handleReset}
            theme={theme}
            url={urlInput}
            onUrlChange={setUrlInput}
          />
        </div>
      </header>

      {/* Content Area - Scrollable */}
      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="min-h-full flex flex-col items-center">
          {/* Scrollable Toolbar - Fades in/out based on scroll position */}
          <div 
            ref={toolbarRef}
            className={prefersReducedMotion ? "relative w-full flex justify-center z-40" : "relative w-full flex justify-center z-40 animate-in fade-in slide-in-from-bottom-2"}
            style={{
              marginTop: `${TOOLBAR_TOP_MARGIN}px`,
              opacity: prefersReducedMotion ? 1 : toolbarOpacity,
              transition: prefersReducedMotion ? 'none' : THEME_TRANSITION,
              ...(prefersReducedMotion ? {} : { 
                animationDuration: `${ANIMATION_STANDARD}ms`,
                animationTimingFunction: EASING_STANDARD,
                animationDelay: `${ENTRANCE_DELAY_TOOLBAR}ms`,
              }),
            }}
          >
            <Toolbar
              settings={settings}
              onSettingsChange={setSettings}
              currentTheme={theme}
              onReset={handleReset}
              cardWidth={settings.cardWidth}
              sourceUrl={sourceUrl}
              onCopySnippetClick={openSnippetModal}
            />
          </div>

          {/* Preview Container - Scrollable, positioned below toolbar */}
          <div 
            className={prefersReducedMotion ? "relative w-full flex justify-center" : "relative w-full flex justify-center animate-in fade-in slide-in-from-bottom-6"}
            style={{ 
              marginTop: `${TOOLBAR_CARD_SPACING}px`, // Spacing relative to toolbar, not absolute from top
              paddingBottom: `${FOOTER_FADE_HEIGHT + FOOTER_SCROLL_CLEAR_EXTRA}px`, // So card + "View original post" can scroll fully behind footer
              ...(prefersReducedMotion ? {} : { 
                animationDuration: `${ANIMATION_DELIBERATE}ms`,
                animationTimingFunction: EASING_STANDARD,
                animationDelay: `${ENTRANCE_DELAY_CARD}ms`,
              }),
            }}
          >
            {post && (
              <ErrorBoundary theme={settings.theme}>
                <InteractivePostCard
                  post={post}
                  settings={settings}
                  onSettingsChange={setSettings}
                  sourceUrl={sourceUrl ?? undefined}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </main>

      {/* Bottom fade plate: solid color + mask so background-color transitions in sync with theme */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none z-[40]"
        style={{ height: FOOTER_FADE_HEIGHT }}
      >
        {/* Color layer (transitions); mask creates the fade shape */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: hexToRgba(theme.appBg, FOOTER_FADE_OPACITY),
            transition: prefersReducedMotion ? 'none' : THEME_TRANSITION,
            maskImage: `linear-gradient(to top, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to top, black 0%, black ${FOOTER_FADE_STOP * 100}%, transparent 100%)`,
          }}
        />
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

      {/* Snippet modal: key resets on each open so entrance animation runs fresh every time */}
      <SnippetModal
        key={snippetModalKey}
        isOpen={snippetDrawerOpen}
        onClose={() => setSnippetDrawerOpen(false)}
        snippet={buildSnippet(settings, sourceUrl)}
        theme={theme}
      />

      {/* Privacy note */}
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap z-[50]"
        style={{
          color: theme.textTertiary,
          opacity: 0.6,
          transition: THEME_TRANSITION,
          pointerEvents: 'none',
        }}
      >
        No login. No tracking. We don’t store your posts. Public posts only.
      </div>
    </div>
  )
}
