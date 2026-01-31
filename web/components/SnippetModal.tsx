'use client'

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { ThemeStyles } from '@/types/post'
import {
  THEME_TRANSITION,
  FOOTER_FADE_HEIGHT,
  FOOTER_FADE_OPACITY,
  FOOTER_FADE_STOP,
  MODAL_CONTENT_PADDING,
  SPACING_SMALL,
} from '@/constants/ui'
import { hexToRgba } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import CodeBlock from '@/components/CodeBlock'

const INSTALLATION_CODE = 'npm install x-post-card-visualizer'

const API_PROPS = [
  { prop: 'url', type: 'string', default: '(required)', description: 'The X post URL to display' },
  { prop: 'theme', type: "'light' | 'dim' | 'dark'", default: "'light'", description: 'Color theme' },
  { prop: 'shadow', type: "'flat' | 'raised' | 'floating' | 'elevated'", default: "'floating'", description: 'Shadow intensity' },
  { prop: 'width', type: 'number', default: '450', description: 'Card width in pixels (350–700)' },
  { prop: 'radius', type: 'number', default: '20', description: 'Border radius in pixels (0–24)' },
  { prop: 'apiUrl', type: 'string', default: '(hosted)', description: 'Custom API endpoint' },
  { prop: 'className', type: 'string', default: '—', description: 'Custom wrapper className' },
  { prop: 'fallback', type: 'ReactNode', default: 'skeleton', description: 'Loading placeholder' },
  { prop: 'onError', type: '(error: Error) => void', default: '—', description: 'Error callback' },
  { prop: 'onLoad', type: '(post: PostData) => void', default: '—', description: 'Load success callback' },
] as const

interface SnippetModalProps {
  isOpen: boolean
  onClose: () => void
  snippet: string
  theme: ThemeStyles
  onCopy?: (text: string) => Promise<void>
}

/**
 * Modal that slides in from the bottom to display the NPM package snippet.
 * Copy-to-clipboard, close on Escape or backdrop click. Returns focus to the
 * trigger element when closed.
 */
export default function SnippetModal({
  isOpen,
  onClose,
  snippet,
  theme,
  onCopy,
}: SnippetModalProps) {
  const [copiedAnatomy, setCopiedAnatomy] = useState(false)
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(true)
  const timerAnatomyRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerInstallRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const savedFocusRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (isOpen) savedFocusRef.current = document.activeElement as HTMLElement | null
  }, [isOpen])

  const updateFadeVisibility = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollTop, clientHeight, scrollHeight } = el
    const threshold = 2
    setShowTopFade(scrollTop > threshold)
    setShowBottomFade(scrollTop + clientHeight < scrollHeight - threshold)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const el = scrollRef.current
    if (!el) return
    updateFadeVisibility()
    const ro = new ResizeObserver(updateFadeVisibility)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isOpen, snippet, updateFadeVisibility])

  const copyToClipboard = async (text: string, type: 'anatomy' | 'install') => {
    const doCopy = onCopy ?? (async (val: string) => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(val)
        return
      }
      const el = document.createElement('textarea')
      el.value = val
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })

    await doCopy(text)

    if (type === 'anatomy') {
      setCopiedAnatomy(true)
      if (timerAnatomyRef.current) clearTimeout(timerAnatomyRef.current)
      timerAnatomyRef.current = setTimeout(() => setCopiedAnatomy(false), 2000)
    } else {
      setCopiedInstall(true)
      if (timerInstallRef.current) clearTimeout(timerInstallRef.current)
      timerInstallRef.current = setTimeout(() => setCopiedInstall(false), 2000)
    }
  }

  const requestClose = useCallback(() => {
    if (prefersReducedMotion) {
      savedFocusRef.current?.focus()
      onClose()
      return
    }
    setIsExiting(true)
  }, [onClose, prefersReducedMotion])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') requestClose()
    },
    [isOpen, requestClose]
  )

  const handlePanelAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.animationName === 'snippet-modal-panel-exit' && isExiting) {
        savedFocusRef.current?.focus()
        onClose()
      }
    },
    [isExiting, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timerAnatomyRef.current) clearTimeout(timerAnatomyRef.current)
      if (timerInstallRef.current) clearTimeout(timerInstallRef.current)
    }
  }, [handleKeyDown])

  if (!isOpen) return null

  const iconButtonBase = "w-8 h-8 rounded-full flex items-center justify-center border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all active:scale-95"

  const backdropClass = isExiting ? 'snippet-modal-backdrop-exit' : 'snippet-modal-backdrop-enter'
  const panelClass = isExiting ? 'snippet-modal-panel-exit' : 'snippet-modal-panel-enter'

  /* Initial "from" state for entrance so first paint is correct on every open (avoids glitch on re-open). */
  const backdropEnterStyle = !isExiting
    ? {
        backgroundColor: theme.appBg,
        opacity: 0,
        backdropFilter: 'blur(0)',
        WebkitBackdropFilter: 'blur(0)',
        transition: THEME_TRANSITION,
      }
    : { backgroundColor: theme.appBg, transition: THEME_TRANSITION }

  const panelEnterStyle = !isExiting
    ? {
        backgroundColor: theme.bg,
        borderColor: theme.border,
        boxShadow: theme.shadowDeep,
        transition: THEME_TRANSITION,
        opacity: 0,
        transform: 'translateY(100vh)',
      }
    : {
        backgroundColor: theme.bg,
        borderColor: theme.border,
        boxShadow: theme.shadowDeep,
        transition: THEME_TRANSITION,
      }

  return (
    <>
      {/* Backdrop: animated dim + blur (entrance/exit choreography) */}
      <div
        role="presentation"
        className={`fixed inset-0 z-[1000] ${backdropClass}`}
        style={backdropEnterStyle}
        onClick={requestClose}
        aria-hidden="true"
      />

      {/* Centering wrapper: equal space above and below the modal */}
      <div
        className="fixed inset-0 z-[1001] flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Embed code snippet"
          className={`${panelClass} pointer-events-auto flex flex-col w-[calc(100%-2rem)] max-w-2xl h-[80vh] rounded-3xl border overflow-hidden relative`}
          style={panelEnterStyle}
          onClick={(e) => e.stopPropagation()}
          onAnimationEnd={handlePanelAnimationEnd}
        >
        {/* Top fade plate: fixed to top edge of modal; visible only when scrolled */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-40 transition-opacity duration-200"
          style={{
            height: FOOTER_FADE_HEIGHT,
            opacity: showTopFade ? 1 : 0,
            transition: prefersReducedMotion ? 'none' : THEME_TRANSITION,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: hexToRgba(theme.bg, FOOTER_FADE_OPACITY),
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
        {/* Bottom fade plate: fixed to bottom edge of modal; hidden when scrolled to bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-40 transition-opacity duration-200"
          style={{
            height: FOOTER_FADE_HEIGHT,
            opacity: showBottomFade ? 1 : 0,
            transition: prefersReducedMotion ? 'none' : THEME_TRANSITION,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: hexToRgba(theme.bg, FOOTER_FADE_OPACITY),
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
        {/* Floating Close Button — above fade plates */}
        <button
          type="button"
          onClick={requestClose}
          className="absolute top-4 right-4 z-[60] w-11 h-11 rounded-full flex items-center justify-center border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-105 active:scale-95 transition-all"
          style={{
            backgroundColor: theme.toolbarBg,
            borderColor: theme.buttonBorderDefault,
            color: theme.textSecondary,
            boxShadow: theme.shadowMedium,
            transition: THEME_TRANSITION,
          }}
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={1.8} />
        </button>

        {/* Sections: Installation, Anatomy, API Reference — scrollbar hidden */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto scrollbar-hidden"
          onScroll={updateFadeVisibility}
        >
          <div
            className="p-6 space-y-10"
            style={{
              paddingTop: MODAL_CONTENT_PADDING + SPACING_SMALL,
              paddingBottom: MODAL_CONTENT_PADDING,
            }}
          >
            {/* Installation */}
            <section>
              <h3 className="text-sm font-medium mb-4" style={{ color: theme.textSecondary, transition: THEME_TRANSITION }}>
                Installation
              </h3>
              <div className="relative group">
                <CodeBlock code={INSTALLATION_CODE} showLineNumbers={false} theme={theme} />
                <button
                  type="button"
                  onClick={() => copyToClipboard(INSTALLATION_CODE, 'install')}
                  className={`${iconButtonBase} absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100`}
                  style={{
                    backgroundColor: theme.toolbarBg,
                    borderColor: theme.buttonBorderDefault,
                    color: theme.textSecondary,
                    boxShadow: theme.shadowMedium,
                  }}
                  aria-label="Copy Installation Command"
                >
                  {copiedInstall ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>

            {/* Anatomy */}
            <section>
              <h3 className="text-sm font-medium mb-4" style={{ color: theme.textSecondary, transition: THEME_TRANSITION }}>
                Anatomy
              </h3>
              <div className="relative group">
                <CodeBlock code={snippet} showLineNumbers theme={theme} />
                <button
                  type="button"
                  onClick={() => copyToClipboard(snippet, 'anatomy')}
                  className={`${iconButtonBase} absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100`}
                  style={{
                    backgroundColor: theme.toolbarBg,
                    borderColor: theme.buttonBorderDefault,
                    color: theme.textSecondary,
                    boxShadow: theme.shadowMedium,
                  }}
                  aria-label="Copy Code Snippet"
                >
                  {copiedAnatomy ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>

            {/* API Reference */}
            <section>
              <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary, transition: THEME_TRANSITION }}>
                API Reference
              </h3>
              <div
                className="rounded-lg border overflow-hidden text-xs overflow-x-auto scrollbar-hidden"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.appBg,
                  transition: THEME_TRANSITION,
                }}
              >
                <table className="w-full border-collapse min-w-max" style={{ borderColor: theme.border }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <th
                        className="text-left py-3 px-3 font-medium align-middle sticky left-0 z-[1] relative"
                        style={{
                          color: theme.textSecondary,
                          background: `linear-gradient(to right, ${theme.appBg} 0%, ${theme.appBg} calc(100% - 24px), transparent 100%)`,
                        }}
                      >
                        Prop
                        <div
                          className="absolute top-0 right-0 bottom-0 w-6 pointer-events-none z-[2]"
                          style={{
                            background: `linear-gradient(to right, ${theme.appBg} 0%, transparent 100%)`,
                          }}
                          aria-hidden="true"
                        />
                      </th>
                      <th
                        className="text-left py-3 px-3 font-medium align-middle whitespace-nowrap"
                        style={{ color: theme.textSecondary }}
                      >
                        Type
                      </th>
                      <th className="text-left py-3 px-3 font-medium align-middle" style={{ color: theme.textSecondary }}>
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {API_PROPS.map((row, i) => (
                      <tr
                        key={row.prop}
                        style={{
                          borderBottom: i < API_PROPS.length - 1 ? `1px solid ${theme.border}` : undefined,
                        }}
                      >
                        <td
                          className="py-3 px-3 align-middle sticky left-0 z-[1] relative"
                          style={{
                            background: `linear-gradient(to right, ${theme.appBg} 0%, ${theme.appBg} calc(100% - 24px), transparent 100%)`,
                          }}
                        >
                          <span
                            className="px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: hexToRgba(theme.border, 0.4),
                              color: theme.textPrimary,
                            }}
                          >
                            {row.prop}
                          </span>
                          <div
                            className="absolute top-0 right-0 bottom-0 w-6 pointer-events-none z-[2]"
                            style={{
                              background: `linear-gradient(to right, ${theme.appBg} 0%, transparent 100%)`,
                            }}
                            aria-hidden="true"
                          />
                        </td>
                        <td className="py-3 px-3 align-middle whitespace-nowrap min-w-max">
                          <span
                            className="px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: hexToRgba(theme.border, 0.4),
                              color: theme.textSecondary,
                            }}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans leading-relaxed align-middle" style={{ color: theme.textSecondary }}>
                          {row.description}
                          {row.default !== '—' && row.default !== '(required)' && (
                            <span className="block mt-1 opacity-60">
                              (default: {row.default})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
