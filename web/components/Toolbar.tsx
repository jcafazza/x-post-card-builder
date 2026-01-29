'use client'

import { CardSettings, ShadowIntensity, ThemeStyles, THEMES, SHADOW_INTENSITIES } from '@/types/post'
import { exportElementToPNG } from '@/lib/export'
import { useState, useRef, useEffect } from 'react'
import { Menu as BloomMenu } from 'bloom-menu'
import {
  Sun,
  SunMoon,
  Moon,
  Code,
  Layers2,
  RotateCcw,
  Download,
  Link,
  Share,
  Loader2,
  Check
} from 'lucide-react'
import {
  ANIMATION_MICRO,
  ANIMATION_DELIBERATE,
  EASING_BOUNCE,
  EASING_STANDARD,
  ERROR_MESSAGE_DISPLAY_DURATION
} from '@/constants/ui'

interface ToolbarProps {
  settings: CardSettings
  onSettingsChange: (settings: CardSettings) => void
  currentTheme: ThemeStyles
  onReset: () => void
  cardWidth: number
  sourceUrl: string | null
}

/**
 * Main Toolbar component providing customization controls and sharing actions.
 * Groups controls into Theme/Shadow (left) and Reset/Share (right).
 */
export default function Toolbar({ settings, onSettingsChange, currentTheme, onReset, cardWidth, sourceUrl }: ToolbarProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isExported, setIsExported] = useState(false)
  const [pressedButton, setPressedButton] = useState<{ id: string; token: number } | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [focusedButton, setFocusedButton] = useState<string | null>(null)
  const [resetRotation, setResetRotation] = useState(0)
  
  // Track all timers for proper cleanup
  const buttonAnimationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pressTokenRef = useRef(0)
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null)
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const exportTimerRef = useRef<NodeJS.Timeout | null>(null)

  const shareTriggerRef = useRef<HTMLButtonElement | null>(null)

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (buttonAnimationTimerRef.current) clearTimeout(buttonAnimationTimerRef.current)
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      if (exportTimerRef.current) clearTimeout(exportTimerRef.current)
    }
  }, [])

  /**
   * Unified button press animation handler.
   * Uses a token-based system to allow reliable re-triggering of CSS animations.
   */
  const animateButtonPress = (buttonId: string) => {
    const token = (pressTokenRef.current = pressTokenRef.current + 1)
    setPressedButton({ id: buttonId, token })
    if (buttonAnimationTimerRef.current) {
      clearTimeout(buttonAnimationTimerRef.current)
    }
    buttonAnimationTimerRef.current = setTimeout(() => {
      setPressedButton(null)
      buttonAnimationTimerRef.current = null
    }, ANIMATION_MICRO)
  }

  /**
   * Universal clipboard copy helper with fallback for non-secure contexts.
   */
  async function copyTextToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  /**
   * Handles the PNG export process with error handling and success state.
   */
  const handleExportAsPNG = async () => {
    setIsExporting(true)
    setExportError(null)

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current)
      errorTimerRef.current = null
    }

    animateButtonPress('share')

    try {
      await exportElementToPNG('card-preview', 'x-post-card.png')
      
      // Inline success feedback in the menu
      setIsExported(true)
      if (exportTimerRef.current) clearTimeout(exportTimerRef.current)
      exportTimerRef.current = setTimeout(() => {
        setIsExported(false)
        exportTimerRef.current = null
      }, 2000)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Export failed:', error)
      }
      const message = error instanceof Error ? error.message : 'Failed to export PNG'
      setExportError(message)

      errorTimerRef.current = setTimeout(() => {
        setExportError(null)
        errorTimerRef.current = null
      }, ERROR_MESSAGE_DISPLAY_DURATION)
    } finally {
      setIsExporting(false)
    }
  }

  const cycleTheme = () => {
    animateButtonPress('theme')
    const currentIndex = THEMES.indexOf(settings.theme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    onSettingsChange({ ...settings, theme: THEMES[nextIndex] })
  }

  const cycleShadow = () => {
    animateButtonPress('shadow')
    const currentIndex = SHADOW_INTENSITIES.indexOf(settings.shadowIntensity)
    const nextIndex = (currentIndex + 1) % SHADOW_INTENSITIES.length
    onSettingsChange({ ...settings, shadowIntensity: SHADOW_INTENSITIES[nextIndex] })
  }

  const handleReset = () => {
    animateButtonPress('reset')
    setResetRotation(prev => prev - 360)
    onReset()
  }

  const shadowOpacityMap: Record<ShadowIntensity, number> = {
    flat: 0.5,
    raised: 0.7,
    floating: 0.85,
    elevated: 1,
  }

  const iconClasses = "w-5 h-5"
  const buttonBase = "w-11 h-11 rounded-full cursor-pointer flex items-center justify-center border outline-none focus-visible:ring-2 focus-visible:ring-offset-2"

  // Share button style - parameters reserved for future hover/focus states
  const getShareButtonStyle = (_isHovered = false, _isFocused = false) => ({
    backgroundColor: 'transparent',
    border: 'none',
    color: currentTheme.textSecondary,
  })

  const menuItemBg = settings.theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'
  const menuText = settings.theme === 'light' ? 'text-neutral-900' : 'text-neutral-50'
  const menuHoverBg = settings.theme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/10'

  /**
   * Generates dynamic styles for toolbar buttons based on their current state.
   * @param isFocused - Reserved for future focus ring styling
   */
  const getButtonStyle = (buttonId: string, isActive = false, isHovered = false, _isFocused = false) => {
    const isPressed = pressedButton?.id === buttonId
    const bounceName =
      isPressed
        ? (pressedButton!.token % 2 === 0 ? 'toolbar-bounce-a' : 'toolbar-bounce-b')
        : undefined

    return {
      backgroundColor: isActive ? menuItemBg : currentTheme.toolbarBg,
      borderColor: isHovered ? currentTheme.buttonBorderHover : currentTheme.buttonBorderDefault,
      color: isActive ? currentTheme.textPrimary : currentTheme.textSecondary,
      boxShadow: currentTheme.shadowMedium,
      transition: `border-color ${ANIMATION_MICRO}ms ${EASING_STANDARD}, box-shadow ${ANIMATION_MICRO}ms ${EASING_STANDARD}`,
      animationName: bounceName,
      animationDuration: bounceName ? `${ANIMATION_MICRO}ms` : undefined,
      animationTimingFunction: bounceName ? EASING_BOUNCE : undefined,
      animationFillMode: bounceName ? 'both' : undefined,
      willChange: bounceName ? 'transform' : undefined,
    }
  }

  /**
   * Constructs the shareable URL with all current settings as query parameters.
   */
  const buildShareUrl = () => {
    if (!sourceUrl) return null
    const shareUrl = new URL('/share', window.location.origin)
    shareUrl.searchParams.set('url', sourceUrl)
    shareUrl.searchParams.set('theme', settings.theme)
    shareUrl.searchParams.set('shadow', settings.shadowIntensity)
    shareUrl.searchParams.set('cardWidth', String(settings.cardWidth))
    if (settings.customBorderRadius !== undefined) {
      shareUrl.searchParams.set('radius', String(settings.customBorderRadius))
    } else {
      shareUrl.searchParams.set('radius', String(settings.borderRadius))
    }
    return shareUrl.toString()
  }

  return (
    <div 
      className="relative z-40 flex items-center justify-between"
      style={{ width: `${cardWidth}px` }}
    >
        {/* Export Error Overlay */}
        {exportError && (
          <div
            className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap animate-in fade-in slide-in-from-bottom-2"
            style={{
              animationDuration: `${ANIMATION_MICRO}ms`,
              backgroundColor: currentTheme.errorBg,
              borderColor: currentTheme.error,
              color: currentTheme.error,
              boxShadow: currentTheme.errorShadow,
            }}
          >
            {exportError}
          </div>
        )}

        {/* Customization Group */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cycleTheme}
            onMouseEnter={() => setHoveredButton('theme')}
            onMouseLeave={() => setHoveredButton(null)}
            onFocus={() => setFocusedButton('theme')}
            onBlur={() => setFocusedButton(null)}
            className={buttonBase}
            style={getButtonStyle('theme', true, hoveredButton === 'theme', focusedButton === 'theme')}
            aria-label="Cycle Theme"
          >
            {settings.theme === 'light' && <Sun className={iconClasses} strokeWidth={1.5} aria-hidden="true" />}
            {settings.theme === 'dim' && <SunMoon className={iconClasses} strokeWidth={1.5} aria-hidden="true" />}
            {settings.theme === 'dark' && <Moon className={iconClasses} strokeWidth={1.5} aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={cycleShadow}
            onMouseEnter={() => setHoveredButton('shadow')}
            onMouseLeave={() => setHoveredButton(null)}
            onFocus={() => setFocusedButton('shadow')}
            onBlur={() => setFocusedButton(null)}
            className={buttonBase}
            style={getButtonStyle('shadow', true, hoveredButton === 'shadow', focusedButton === 'shadow')}
            aria-label="Cycle Shadow"
          >
            <Layers2
              className={iconClasses}
              strokeWidth={1.5}
              style={{ opacity: shadowOpacityMap[settings.shadowIntensity] }}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            onMouseEnter={() => setHoveredButton('reset')}
            onMouseLeave={() => setHoveredButton(null)}
            onFocus={() => setFocusedButton('reset')}
            onBlur={() => setFocusedButton(null)}
            className={buttonBase}
            style={getButtonStyle('reset', false, hoveredButton === 'reset', focusedButton === 'reset')}
            aria-label="Reset to Default"
          >
            <RotateCcw
              className={iconClasses}
              strokeWidth={1.5}
              style={{
                transform: `rotate(${resetRotation}deg)`,
                transition: `transform ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}`,
              }}
              aria-hidden="true"
            />
          </button>

          <BloomMenu.Root
            direction="bottom"
            anchor="end"
            open={isShareMenuOpen}
            onOpenChange={setIsShareMenuOpen}
          >
            <BloomMenu.Container
              buttonSize={44}
              menuWidth={240}
              menuRadius={16}
              style={{
                backgroundColor: isShareMenuOpen ? currentTheme.bg : currentTheme.toolbarBg,
                border: `1px solid ${
                  isShareMenuOpen 
                    ? currentTheme.border 
                    : (hoveredButton === 'share' ? currentTheme.buttonBorderHover : currentTheme.buttonBorderDefault)
                }`,
                boxShadow: isShareMenuOpen ? currentTheme.shadowDeep : currentTheme.shadowMedium,
                overflow: 'hidden',
                zIndex: 1001,
              }}
            >
              <BloomMenu.Trigger>
                  <button
                    type="button"
                    ref={shareTriggerRef}
                    onMouseEnter={() => setHoveredButton('share')}
                    onMouseLeave={() => setHoveredButton(null)}
                    onFocus={() => setFocusedButton('share')}
                    onBlur={() => setFocusedButton(null)}
                    className={buttonBase}
                    style={{
                      ...getShareButtonStyle(hoveredButton === 'share', focusedButton === 'share'),
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                    }}
                    aria-label="Share"
                  >
                  <Share className={iconClasses} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </BloomMenu.Trigger>

              <BloomMenu.Content className="p-2">
                <BloomMenu.Item
                  disabled={isExporting}
                  onSelect={handleExportAsPNG}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${menuText} ${menuHoverBg} disabled:opacity-50`}
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} aria-hidden="true" />
                  ) : isExported ? (
                    <Check className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <Download className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                  )}
                  <span className="flex-1">{isExported ? 'Exported!' : 'Export as PNG'}</span>
                </BloomMenu.Item>

                <BloomMenu.Item
                  disabled={!sourceUrl}
                  onSelect={async () => {
                    const urlToCopy = buildShareUrl()
                    if (!urlToCopy) return
                    await copyTextToClipboard(urlToCopy)
                    
                    // Visual feedback in the menu
                    setIsCopied(true)
                    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
                    copyTimerRef.current = setTimeout(() => {
                      setIsCopied(false)
                      copyTimerRef.current = null
                    }, 2000)
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${menuText} ${menuHoverBg} disabled:opacity-50`}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <Link className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                  )}
                  <span className="flex-1">{isCopied ? 'Copied!' : 'Share link'}</span>
                </BloomMenu.Item>

                <div className="h-px my-1 mx-1" style={{ backgroundColor: currentTheme.border, opacity: 0.6 }} />

                <BloomMenu.Item
                  disabled
                  onSelect={() => {}}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${menuText} ${menuHoverBg} opacity-50`}
                >
                  <Code className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                  <span className="flex-1">Copy snippet</span>
                  <span className="text-[11px] font-semibold opacity-60">Soon</span>
                </BloomMenu.Item>
              </BloomMenu.Content>
            </BloomMenu.Container>
          </BloomMenu.Root>
        </div>
      </div>
  )
}
