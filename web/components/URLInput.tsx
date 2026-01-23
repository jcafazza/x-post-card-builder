'use client'

import { useEffect, useRef, useState } from 'react'
import { PostData, ThemeStyles } from '@/types/post'
import { fetchPostData } from '@/lib/api'
import { ANIMATION_STANDARD, ANIMATION_DELIBERATE, ANIMATION_MICRO, EASING_STANDARD } from '@/constants/ui'
import { Check, Loader2 } from 'lucide-react'

interface URLInputProps {
  onPostLoad: (post: PostData) => void
  onSourceUrlChange?: (sourceUrl: string) => void
  theme: ThemeStyles
  url: string
  onUrlChange: (url: string) => void
}

const SUCCESS_STATE_DURATION_MS = 800

export default function URLInput({ onPostLoad, onSourceUrlChange, theme, url, onUrlChange }: URLInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [justImported, setJustImported] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const successTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const sourceUrl = url.trim()
    if (!sourceUrl) {
      setError('Required')
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
      successTimerRef.current = setTimeout(() => {
        setJustImported(false)
        successTimerRef.current = null
      }, SUCCESS_STATE_DURATION_MS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  // Focus ring color based on theme
  const getFocusRingColor = () => {
    if (theme.headerOuterStroke.includes('rgba(0, 0, 0')) {
      return 'rgba(0, 0, 0, 0.12)'
    }
    return 'rgba(255, 255, 255, 0.12)'
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
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste X post URL..."
          disabled={isLoading}
          className="w-full bg-transparent border-none py-1.5 pl-2 pr-24 text-base outline-none placeholder:opacity-40 font-normal"
          style={{ 
            transition: `all ${ANIMATION_STANDARD}ms ${EASING_STANDARD}`,
            color: theme.appText,
            WebkitMaskImage: url.trim().length > 0 
              ? 'linear-gradient(to right, black 0%, black calc(100% - 80px), transparent 100%)'
              : 'none',
            maskImage: url.trim().length > 0 
              ? 'linear-gradient(to right, black 0%, black calc(100% - 80px), transparent 100%)'
              : 'none',
          }}
        />
        
        <div className="absolute right-1 flex items-center gap-2">
          {error && (
            <span
              className="text-xs font-medium animate-in fade-in slide-in-from-right-1"
              style={{ color: theme.error }}
            >
              {error}
            </span>
          )}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 flex items-center gap-1.5"
            style={{
              transition: `all ${ANIMATION_STANDARD}ms ${EASING_STANDARD}`,
              backgroundColor: theme.headerBg,
              color: theme.appText,
              border: `1px solid ${theme.buttonBorderDefault}`,
              boxShadow: url.trim() ? theme.shadowShallow : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isLoading && url.trim()) {
                e.currentTarget.style.borderColor = theme.buttonBorderHover
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.buttonBorderDefault
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
                <span>Loading...</span>
              </>
            ) : justImported ? (
              <>
                <Check className="w-3 h-3" strokeWidth={2} />
                <span>Imported</span>
              </>
            ) : (
              <span>↵ return</span>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
