'use client'

import { useEffect, useRef, useState } from 'react'
import { PostData, ThemeStyles } from '@/types/post'
import { fetchPostData } from '@/lib/api'
import { ANIMATION_STANDARD, EASING_STANDARD, INPUT_BUTTON_PADDING_RIGHT } from '@/constants/ui'
import { Check, Loader2, AlertCircle } from 'lucide-react'

interface URLInputProps {
  onPostLoad: (post: PostData) => void
  onSourceUrlChange?: (sourceUrl: string) => void
  onClear?: () => void
  theme: ThemeStyles
  url: string
  onUrlChange: (url: string) => void
}

const SUCCESS_STATE_DURATION_MS = 800

/**
 * Normalizes error messages to a maximum of 2 words, user-friendly.
 */
function normalizeErrorMessage(message: string): string {
  const lower = message.toLowerCase().trim()
  
  // Map common API errors to friendly 2-word messages
  if (lower.includes('url') && (lower.includes('required') || lower.includes('enter'))) {
    return 'URL required'
  }
  if (lower.includes('invalid') || lower.includes('valid')) {
    return 'Invalid URL'
  }
  if (lower.includes('unavailable') || lower.includes('could not') || lower.includes('cannot')) {
    return 'Post unavailable'
  }
  if (lower.includes('failed') || lower.includes('error') || lower.includes('http')) {
    return 'Load failed'
  }
  
  // Fallback: take first 2 words if message is longer
  const words = message.split(/\s+/).filter(w => w.length > 0)
  if (words.length <= 2) return message
  return `${words[0]} ${words[1]}`
}

export default function URLInput({ onPostLoad, onSourceUrlChange, onClear, theme, url, onUrlChange }: URLInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [justImported, setJustImported] = useState(false)
  const [hasImported, setHasImported] = useState(false)
  const [buttonWidth, setButtonWidth] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const successTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [])

  // Measure button width to adjust input mask
  useEffect(() => {
    const updateButtonWidth = () => {
      if (buttonRef.current) {
        const width = buttonRef.current.getBoundingClientRect().width
        setButtonWidth(width)
      }
    }

    // Use ResizeObserver for reliable width tracking
    let resizeObserver: ResizeObserver | null = null
    if (buttonRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateButtonWidth()
      })
      resizeObserver.observe(buttonRef.current)
    }

    // Also update immediately and after a short delay to catch initial render
    updateButtonWidth()
    const timeoutId = setTimeout(updateButtonWidth, 50)
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updateButtonWidth)
    })

    return () => {
      if (resizeObserver) resizeObserver.disconnect()
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)
    }
  }, [isLoading, justImported, error, hasImported, url])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const sourceUrl = url.trim()
    if (!sourceUrl) {
      setError('URL required')
      return
    }

    setIsLoading(true)
    setIsFocused(false) // Explicitly remove focus state on submit
    inputRef.current?.blur() // Remove keyboard focus
    setError(null)
    setJustImported(false)
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }

    try {
      const postData = await fetchPostData(sourceUrl)
      onPostLoad(postData)
      onSourceUrlChange?.(sourceUrl)

      setError(null)
      setJustImported(true)
      setHasImported(true)
      successTimerRef.current = setTimeout(() => {
        setJustImported(false)
        successTimerRef.current = null
      }, SUCCESS_STATE_DURATION_MS)
    } catch (err) {
      // Normalize error message to max 2 words
      const rawMessage = err instanceof Error ? err.message : 'Load failed'
      const normalized = normalizeErrorMessage(rawMessage)
      setError(normalized)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
      setHasImported(false)
      setError(null)
      setJustImported(false)
    }
  }

  // Focus ring color based on theme
  const getFocusRingColor = () => {
    if (theme.headerOuterStroke.includes('rgba(0, 0, 0')) {
      return 'rgba(0, 0, 0, 0.12)'
    }
    return 'rgba(255, 255, 255, 0.12)'
  }

  // Determine button state and content
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} aria-hidden="true" />
          <span>Loading…</span>
        </>
      )
    }
    if (justImported) {
      return (
        <>
          <Check className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
          <span>Imported</span>
        </>
      )
    }
    if (error) {
      return (
        <>
          <AlertCircle className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
          <span style={{ color: theme.error }}>{error}</span>
        </>
      )
    }
    if (hasImported && onClear) {
      return <span>clear</span>
    }
    return <span>return</span>
  }

  const isButtonClickable = () => {
    if (isLoading) return false
    if (error) return false // Error state is informational only
    if (hasImported && onClear) return true // Clear button is clickable
    return url.trim().length > 0 // Return button is clickable when there's text
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full border rounded-full p-1"
      style={{
        transition: `border-color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}, box-shadow ${ANIMATION_STANDARD}ms ${EASING_STANDARD}`,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderColor: theme.headerOuterStroke,
        borderWidth: '1px',
        height: '44px',
        boxSizing: 'border-box',
        boxShadow: isFocused ? `0 0 0 2px ${getFocusRingColor()}` : 'none',
      }}
    >
      <div className="flex-1 relative flex items-center overflow-hidden">
        <label htmlFor="post-url" className="sr-only">
          X post URL
        </label>
        <input
          ref={inputRef}
          id="post-url"
          type="text"
          value={url}
          onChange={(e) => {
            onUrlChange(e.target.value)
            // Clear error when user starts typing
            if (error) setError(null)
            // Reset imported state if input is cleared
            if (hasImported && !e.target.value.trim()) {
              setHasImported(false)
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste X post URL…"
          disabled={isLoading}
          name="post-url"
          autoComplete="url"
          className="w-full bg-transparent border-none py-1.5 pl-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-offset-2 placeholder:opacity-40 font-normal"
          style={{ 
            transition: `color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}, background-color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}, border-color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}`,
            color: theme.appText,
            paddingRight: `${INPUT_BUTTON_PADDING_RIGHT}px`,
            WebkitMaskImage: url.trim().length > 0
              ? buttonWidth > 0
                ? `linear-gradient(to right, black 0%, black calc(100% - ${buttonWidth + 40}px), rgba(0,0,0,0.98) calc(100% - ${buttonWidth + 32}px), rgba(0,0,0,0.9) calc(100% - ${buttonWidth + 24}px), rgba(0,0,0,0.7) calc(100% - ${buttonWidth + 16}px), rgba(0,0,0,0.5) calc(100% - ${buttonWidth + 10}px), rgba(0,0,0,0.3) calc(100% - ${buttonWidth + 6}px), rgba(0,0,0,0.1) calc(100% - ${buttonWidth + 2}px), transparent calc(100% - ${buttonWidth}px))`
                : 'linear-gradient(to right, black 0%, black calc(100% - 80px), rgba(0,0,0,0.9) calc(100% - 72px), rgba(0,0,0,0.7) calc(100% - 64px), rgba(0,0,0,0.5) calc(100% - 56px), rgba(0,0,0,0.3) calc(100% - 48px), rgba(0,0,0,0.1) calc(100% - 40px), transparent calc(100% - 32px))'
              : 'none',
            maskImage: url.trim().length > 0
              ? buttonWidth > 0
                ? `linear-gradient(to right, black 0%, black calc(100% - ${buttonWidth + 40}px), rgba(0,0,0,0.98) calc(100% - ${buttonWidth + 32}px), rgba(0,0,0,0.9) calc(100% - ${buttonWidth + 24}px), rgba(0,0,0,0.7) calc(100% - ${buttonWidth + 16}px), rgba(0,0,0,0.5) calc(100% - ${buttonWidth + 10}px), rgba(0,0,0,0.3) calc(100% - ${buttonWidth + 6}px), rgba(0,0,0,0.1) calc(100% - ${buttonWidth + 2}px), transparent calc(100% - ${buttonWidth}px))`
                : 'linear-gradient(to right, black 0%, black calc(100% - 80px), rgba(0,0,0,0.9) calc(100% - 72px), rgba(0,0,0,0.7) calc(100% - 64px), rgba(0,0,0,0.5) calc(100% - 56px), rgba(0,0,0,0.3) calc(100% - 48px), rgba(0,0,0,0.1) calc(100% - 40px), transparent calc(100% - 32px))'
              : 'none',
          }}
        />
        
        <div className="absolute right-1 flex items-center">
          <button
            ref={buttonRef}
            type={hasImported && onClear && !error ? 'button' : 'submit'}
            onClick={hasImported && onClear && !error ? handleClear : undefined}
            disabled={!isButtonClickable()}
            aria-label={isLoading ? 'Loading' : justImported ? 'Imported' : error ? error : hasImported && onClear ? 'Clear input' : 'Submit URL'}
            className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center gap-1.5"
            style={{
              minHeight: '32px', // Ensure minimum touch target (form container is 44px, button needs adequate size)
              transition: `background-color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}, color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}, border-color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}, transform ${ANIMATION_STANDARD}ms ${EASING_STANDARD}`,
              backgroundColor: theme.headerBg,
              color: error ? theme.error : theme.appText,
              border: `1px solid ${theme.buttonBorderDefault}`,
              boxShadow: (!url.trim() && !hasImported && !error) ? 'none' : theme.shadowShallow,
            }}
            onMouseEnter={(e) => {
              if (isButtonClickable() && !error) {
                e.currentTarget.style.borderColor = theme.buttonBorderHover
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.buttonBorderDefault
            }}
          >
            {getButtonContent()}
          </button>
        </div>
      </div>
    </form>
  )
}
