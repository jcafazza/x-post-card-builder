'use client'

import { useState } from 'react'
import InteractivePostCard from '@/components/InteractivePostCard'
import Toolbar from '@/components/Toolbar'
import URLInput from '@/components/URLInput'
import { PostData, CardSettings } from '@/types/post'
import { getRandomPlaceholder } from '@/lib/placeholder'
import { getThemeStyles } from '@/lib/themes'

export default function Home() {
  const [post, setPost] = useState<PostData | null>(getRandomPlaceholder())
  const [settings, setSettings] = useState<CardSettings>({
    theme: 'light',
    borderRadius: '20',
    shadowIntensity: 'medium',
    showDate: true,
    cardWidth: 500,
    customBorderRadius: 20,
  })

  const handleReset = () => {
    setSettings({
      ...settings,
      cardWidth: 500,
      customBorderRadius: 20,
    })
  }

  const theme = getThemeStyles(settings.theme)

  return (
    <div 
      className="min-h-screen font-sans selection:bg-neutral-500/30 flex flex-col overflow-hidden transition-colors duration-500 ease-in-out relative"
      style={{ backgroundColor: theme.appBg, color: theme.appText }}
    >
      {/* Header UI Plate - Houses Logo and URLInput */}
      <div 
        className="fixed top-[24px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 px-3 py-2 border rounded-[100px] z-50 animate-in fade-in slide-in-from-top-4 duration-1000 shadow-sm transition-all duration-500"
        style={{ 
          backgroundColor: theme.headerBg, 
          borderColor: theme.headerBorder,
          backdropBlur: '12px',
          boxShadow: `0 4px 20px rgba(0, 0, 0, ${theme.appBg === '#FAFAFA' ? '0.04' : '0.2'})`,
        }}
      >
        {/* Logo Outside of Input */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden transition-all duration-500" style={{ backgroundColor: theme.appText }}>
          <img 
            src="/assets/xLogo.svg" 
            alt="X Logo" 
            width={16} 
            height={16} 
            className="transition-all duration-500" 
            style={{ 
              filter: theme.appBg === '#FAFAFA' ? 'invert(1)' : 'none' 
            }}
          />
        </div>
        
        {/* URL Input Pill */}
        <div className="w-[480px]">
          <URLInput onPostLoad={setPost} theme={theme} />
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-auto relative">
        <div className="min-h-full p-12 pt-32 flex flex-col items-center justify-center gap-[40px]">
          {/* Floating Toolbar */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
            <Toolbar settings={settings} onSettingsChange={setSettings} currentTheme={theme} onReset={handleReset} />
          </div>

          {/* Preview Container */}
          <div className="relative">
            {post ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <InteractivePostCard post={post} settings={settings} onSettingsChange={setSettings} />
              </div>
            ) : (
              <div 
                className="w-[500px] aspect-[4/3] border rounded-xl flex flex-col items-center justify-center text-center p-8 transition-all duration-500"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-500"
                  style={{ backgroundColor: settings.theme === 'light' ? '#F5F5F5' : 'rgba(255,255,255,0.05)' }}
                >
                  <svg 
                    className="w-6 h-6 transition-colors duration-500" 
                    style={{ color: theme.textTertiary }}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>No post loaded</p>
                <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>Paste a URL above to preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
