'use client'

import { useState } from 'react'
import Image from 'next/image'
import InteractivePostCard from '@/components/InteractivePostCard'
import Toolbar from '@/components/Toolbar'
import URLInput from '@/components/URLInput'
import { PostData, CardSettings } from '@/types/post'
import { getRandomPlaceholder, getDefaultPlaceholder } from '@/lib/placeholder'
import { getThemeStyles } from '@/lib/themes'
import {
  ANIMATION_STANDARD,
  ANIMATION_DELIBERATE,
  ANIMATION_EXTENDED,
  EASING_STANDARD,
  EASING_ELEGANT,
  ENTRANCE_DELAY_HEADER,
  ENTRANCE_DELAY_TOOLBAR,
  ENTRANCE_DELAY_CARD
} from '@/constants/ui'

const INITIAL_SETTINGS: CardSettings = {
  theme: 'light',
  borderRadius: '20',
  shadowIntensity: 'floating',
  showDate: true,
  cardWidth: 500,
  customBorderRadius: 20,
}

export default function Home() {
  const [post, setPost] = useState<PostData | null>(() => getDefaultPlaceholder())
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [settings, setSettings] = useState<CardSettings>(INITIAL_SETTINGS)

  const handleReset = () => {
    setPost(getDefaultPlaceholder())
    setSourceUrl(null)
    setUrlInput('')
    setSettings(INITIAL_SETTINGS)
  }

  const theme = getThemeStyles(settings.theme)

  // Header height calculation: 24px (top) + 68px (content) + 24px (gap) = 116px
  // We use pt-[148px] to give the toolbar some extra breathing room below the header
  const CONTENT_PADDING_TOP = 'pt-[148px]'

  return (
    <div
      className="min-h-screen font-sans selection:bg-neutral-500/30 flex flex-col overflow-hidden relative"
      style={{
        transition: `background-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
        backgroundColor: theme.appBg,
        color: theme.appText
      }}
    >
      {/* Header UI Plate - Houses Logo and URLInput */}
      <header
        className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 px-3 py-3 border rounded-full z-50 animate-in fade-in slide-in-from-top-4"
        style={{
          animationDuration: `${ANIMATION_EXTENDED}ms`,
          animationTimingFunction: EASING_STANDARD,
          animationDelay: `${ENTRANCE_DELAY_HEADER}ms`,
          transition: `background-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, border-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
          backgroundColor: theme.headerBg,
          borderColor: theme.headerOuterStroke,
          borderWidth: '1px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo Outside of Input */}
        <div
          className="flex items-center justify-center w-11 h-11 rounded-full overflow-hidden gap-0"
          style={{
            backgroundColor: theme.appText,
            transition: `background-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
          }}
        >
          <Image
            src="/assets/xLogo.svg"
            alt="X Logo"
            width={16}
            height={16}
            style={{
              transition: `filter ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
              filter: theme.appBg === '#FAFAFA' ? 'invert(1)' : 'none'
            }}
          />
        </div>
        
        {/* URL Input Pill */}
        <div className="w-[480px]">
          <URLInput 
            onPostLoad={setPost} 
            onSourceUrlChange={setSourceUrl} 
            theme={theme}
            url={urlInput}
            onUrlChange={setUrlInput}
          />
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-auto relative">
        <div className={`min-h-full p-12 ${CONTENT_PADDING_TOP} flex flex-col items-center justify-center gap-8`}>
          {/* Floating Toolbar */}
          <div 
            className="relative z-[60] animate-in fade-in slide-in-from-bottom-2"
            style={{ 
              animationDuration: `${ANIMATION_STANDARD}ms`,
              animationTimingFunction: EASING_STANDARD,
              animationDelay: `${ENTRANCE_DELAY_TOOLBAR}ms`,
            }}
          >
            <Toolbar
              settings={settings}
              onSettingsChange={setSettings}
              currentTheme={theme}
              onReset={handleReset}
              cardWidth={settings.cardWidth}
              sourceUrl={sourceUrl}
            />
          </div>

          {/* Preview Container */}
          <div className="relative min-h-[400px]">
            {post && (
              <div 
                className="animate-in fade-in slide-in-from-bottom-6"
                style={{ 
                  animationDuration: `${ANIMATION_DELIBERATE}ms`,
                  animationTimingFunction: EASING_STANDARD,
                  animationDelay: `${ENTRANCE_DELAY_CARD}ms`,
                }}
              >
                <InteractivePostCard post={post} settings={settings} onSettingsChange={setSettings} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Privacy note */}
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap"
        style={{
          color: theme.textTertiary,
          opacity: 0.6,
          transition: `color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, opacity ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
          pointerEvents: 'none',
        }}
      >
        No login. No tracking. We don’t store your posts. Public posts only.
      </div>
    </div>
  )
}
