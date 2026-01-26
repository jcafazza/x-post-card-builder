'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import PostCard from './PostCard'
import { PostData, CardSettings } from '@/types/post'
import { getThemeStyles } from '@/lib/themes'
import { ANIMATION_MICRO, ANIMATION_STANDARD, ANIMATION_DELIBERATE, EASING_ELEGANT, EASING_STANDARD, EASING_BOUNCE } from '@/constants/ui'
import {
  CARD_MIN_WIDTH,
  CARD_MAX_WIDTH,
  CARD_MAX_RADIUS,
  CARD_CORNER_ZONE,
  CARD_HANDLE_LENGTH,
  RUBBERBAND_MAX_OVERSHOOT as RUBBERBAND_MAX_OVERSHOOT_PX,
  CARD_BOTTOM_MARGIN,
} from '@/constants/card'
import { isBorderRadius } from '@/lib/utils'

interface InteractivePostCardProps {
  post: PostData
  settings: CardSettings
  onSettingsChange: (settings: CardSettings) => void
  sourceUrl?: string
}

const VIEW_ORIGINAL_LABEL = 'View original post'

function useCrossfadeText(targetText: string) {
  const [fromText, setFromText] = useState<string | null>(null)
  const [toText, setToText] = useState<string>(targetText)
  const [showTo, setShowTo] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (targetText === toText && showTo) return

    // Crossfade: render both strings and fade from -> to.
    setFromText(toText)
    setToText(targetText)
    setShowTo(false)

    if (timerRef.current) clearTimeout(timerRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    rafRef.current = requestAnimationFrame(() => {
      setShowTo(true)
      rafRef.current = null
    })

    timerRef.current = setTimeout(() => {
      setFromText(null)
      timerRef.current = null
    }, ANIMATION_MICRO)
  }, [targetText, toText, showTo])

  return { fromText, toText, showTo }
}

export default function InteractivePostCard({ post, settings, onSettingsChange, sourceUrl }: InteractivePostCardProps) {
  const [isResizingWidth, setIsResizingWidth] = useState(false)
  const [isResizingRadius, setIsResizingRadius] = useState(false)
  const [hoveredCorner, setHoveredCorner] = useState<string | null>(null)
  const [valueLabel, setValueLabel] = useState<string | null>(null)
  const [visualWidth, setVisualWidth] = useState<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const cardRef = useRef<HTMLDivElement>(null)
  const resizeTypeRef = useRef<'width-left' | 'width-right' | null>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const startRadiusRef = useRef<number>(0)
  const labelResetTimerRef = useRef<NodeJS.Timeout | null>(null)

  const theme = getThemeStyles(settings.theme)

  // Button label + visibility behavior:
  // - If sourceUrl exists: button is always visible and clickable; label crossfades between
  //   "View original post" and the current px value.
  // - If sourceUrl does not exist: button appears only while resizing (px value),
  //   then fades out after the short delay.
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [buttonMinWidth, setButtonMinWidth] = useState<number | null>(null)
  const valueMeasureRef = useRef<HTMLSpanElement | null>(null)
  const [valueButtonMinWidth, setValueButtonMinWidth] = useState<number | null>(null)
  const [isValueButtonMounted, setIsValueButtonMounted] = useState(false)
  const [isValueButtonVisible, setIsValueButtonVisible] = useState(false)
  const valueButtonHideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const valueButtonShowRafRef = useRef<number | null>(null)

  const setGlobalCursor = (cursor: string) => {
    // Safari can ignore body cursor changes during active drags; setting on <html>
    // tends to be more reliable across browsers.
    document.documentElement.style.cursor = cursor
    document.body.style.cursor = cursor
  }

  // Global mouse move/up handling during active drags.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingWidth) {
        setGlobalCursor('ew-resize')
        const deltaX = e.clientX - startXRef.current
        let rawWidth: number

        if (resizeTypeRef.current === 'width-left') {
          rawWidth = startWidthRef.current - deltaX
        } else {
          rawWidth = startWidthRef.current + deltaX
        }

        // Rubberband effect: allow overshoot beyond max with resistance
        const RUBBERBAND_MAX_OVERSHOOT = RUBBERBAND_MAX_OVERSHOOT_PX
        const roundedRawWidth = Math.round(rawWidth / 2) * 2
        
        let visualWidthValue: number
        let clampedWidth: number

        if (roundedRawWidth > CARD_MAX_WIDTH) {
          // Beyond max: apply resistance and allow overshoot up to 30px
          const overshoot = Math.min(roundedRawWidth - CARD_MAX_WIDTH, RUBBERBAND_MAX_OVERSHOOT)
          // Resistance: reduce the effect of overshoot (50% resistance)
          visualWidthValue = CARD_MAX_WIDTH + overshoot * 0.5
          clampedWidth = CARD_MAX_WIDTH
        } else if (roundedRawWidth < CARD_MIN_WIDTH) {
          // Below min: clamp immediately (no rubberband on min)
          visualWidthValue = CARD_MIN_WIDTH
          clampedWidth = CARD_MIN_WIDTH
        } else {
          // Within bounds: normal behavior
          visualWidthValue = roundedRawWidth
          clampedWidth = roundedRawWidth
        }

        setVisualWidth(visualWidthValue)
        onSettingsChange({ ...settings, cardWidth: clampedWidth })
        setValueLabel(`${Math.round(visualWidthValue)}px`)
      } else if (isResizingRadius) {
        const cardRect = cardRef.current?.getBoundingClientRect()
        if (!cardRect) return

        const cursorMap: Record<string, string> = {
          'top-left': 'nwse-resize',
          'top-right': 'nesw-resize',
          'bottom-left': 'nesw-resize',
          'bottom-right': 'nwse-resize',
        }
        if (hoveredCorner) setGlobalCursor(cursorMap[hoveredCorner] || 'default')

        const corners = {
          'top-left': { x: cardRect.left, y: cardRect.top },
          'top-right': { x: cardRect.right, y: cardRect.top },
          'bottom-left': { x: cardRect.left, y: cardRect.bottom },
          'bottom-right': { x: cardRect.right, y: cardRect.bottom },
        }

        const corner = corners[hoveredCorner as keyof typeof corners]
        if (!corner) return

        const distance = Math.sqrt(Math.pow(e.clientX - corner.x, 2) + Math.pow(e.clientY - corner.y, 2))
        const rawRadius = Math.max(0, Math.min(CARD_MAX_RADIUS, Math.max(0, distance - CARD_CORNER_ZONE)))
        const snappedRadius = Math.round(rawRadius / 4) * 4

        onSettingsChange({ ...settings, customBorderRadius: snappedRadius })
        setValueLabel(`${snappedRadius}px`)
      }
    }

    const handleMouseUp = () => {
      // Rubberband snap-back: if visual width exceeds max, animate back to max
      if (isResizingWidth && visualWidth !== null && visualWidth > CARD_MAX_WIDTH) {
        // Snap back to max width with bounce animation
        setVisualWidth(CARD_MAX_WIDTH)
        // Update settings to ensure it's clamped
        onSettingsChange({ ...settings, cardWidth: CARD_MAX_WIDTH })
        // Clear visual width after animation completes
        setTimeout(() => {
          setVisualWidth(null)
        }, ANIMATION_STANDARD)
      } else {
        // Clear visual width immediately if no snap-back needed
        setVisualWidth(null)
      }

      setIsResizingWidth(false)
      setIsResizingRadius(false)
      resizeTypeRef.current = null
      setHoveredCorner(null)
      setGlobalCursor('default')

      if (labelResetTimerRef.current) clearTimeout(labelResetTimerRef.current)
      // Short, elegant hold before reverting the label.
      labelResetTimerRef.current = setTimeout(() => {
        setValueLabel(null)
        labelResetTimerRef.current = null
      }, ANIMATION_MICRO)
    }

    if (isResizingWidth || isResizingRadius) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingWidth, isResizingRadius, hoveredCorner, settings, onSettingsChange, visualWidth])

  useEffect(() => {
    return () => {
      if (labelResetTimerRef.current) clearTimeout(labelResetTimerRef.current)
    }
  }, [])

  const handleMouseDown = (
    e: React.MouseEvent,
    type: 'width-left' | 'width-right' | 'corner',
    corner?: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (labelResetTimerRef.current) {
      clearTimeout(labelResetTimerRef.current)
      labelResetTimerRef.current = null
    }

    if (type === 'width-left' || type === 'width-right') {
      setGlobalCursor('ew-resize')
      setIsResizingWidth(true)
      resizeTypeRef.current = type
      startXRef.current = e.clientX
      const snappedStartWidth = Math.round(settings.cardWidth / 2) * 2
      startWidthRef.current = snappedStartWidth
      setVisualWidth(null) // Reset visual width at start of drag
      setValueLabel(`${snappedStartWidth}px`)
    } else if (type === 'corner' && corner) {
      const cursorMap: Record<string, string> = {
        'top-left': 'nwse-resize',
        'top-right': 'nesw-resize',
        'bottom-left': 'nesw-resize',
        'bottom-right': 'nwse-resize',
      }
      setGlobalCursor(cursorMap[corner] || 'default')
      setIsResizingRadius(true)
      setHoveredCorner(corner)
      startRadiusRef.current = settings.customBorderRadius
      setValueLabel(`${settings.customBorderRadius}px`)
    }
  }

  const handleHoverMove = (e: React.MouseEvent) => {
    if (isResizingWidth || isResizingRadius) return

    const cardRect = cardRef.current?.getBoundingClientRect()
    if (!cardRect) return

    const { clientX, clientY } = e
    const { left, right, top, bottom } = cardRect

    const cornerZones = {
      'top-left': { x: left, y: top, zone: CARD_CORNER_ZONE },
      'top-right': { x: right, y: top, zone: CARD_CORNER_ZONE },
      'bottom-left': { x: left, y: bottom, zone: CARD_CORNER_ZONE },
      'bottom-right': { x: right, y: bottom, zone: CARD_CORNER_ZONE },
    }

    let nearCorner: string | null = null
    for (const [corner, pos] of Object.entries(cornerZones)) {
      const distance = Math.sqrt(Math.pow(clientX - pos.x, 2) + Math.pow(clientY - pos.y, 2))
      if (distance <= pos.zone) {
        nearCorner = corner
        break
      }
    }

    if (nearCorner) {
      setHoveredCorner(nearCorner)
      const cursorMap: Record<string, string> = {
        'top-left': 'nwse-resize',
        'top-right': 'nesw-resize',
        'bottom-left': 'nesw-resize',
        'bottom-right': 'nwse-resize',
      }
      setGlobalCursor(cursorMap[nearCorner] || 'default')
    } else if (Math.abs(clientX - left) < 8 || Math.abs(clientX - right) < 8) {
      setGlobalCursor('ew-resize')
      setHoveredCorner(null)
    } else {
      setGlobalCursor('default')
      setHoveredCorner(null)
    }
  }

  const handleHoverLeave = () => {
    if (!isResizingWidth && !isResizingRadius) {
      setGlobalCursor('default')
      setHoveredCorner(null)
    }
  }

  const buttonLabelTarget = valueLabel ?? VIEW_ORIGINAL_LABEL
  const { fromText, toText, showTo } = useCrossfadeText(buttonLabelTarget)
  const isShowingValueLabel = valueLabel !== null

  useLayoutEffect(() => {
    const meas = measureRef.current
    if (!meas) return

    const textWidth = meas.getBoundingClientRect().width
    // Our button uses px-4 (16px left/right) and a 1px border.
    // Keep a stable minimum width so "View original post" never wraps.
    setButtonMinWidth(Math.ceil(textWidth + 16 + 16 + 1 + 1))
  }, [])

  useLayoutEffect(() => {
    const meas = valueMeasureRef.current
    if (!meas) return

    const textWidth = meas.getBoundingClientRect().width
    // px-4 + 1px border on each side.
    setValueButtonMinWidth(Math.ceil(textWidth + 16 + 16 + 1 + 1))
  }, [])

  // If there's no source URL, mount/fade the value button while resizing.
  useEffect(() => {
    if (sourceUrl) return

    const shouldShow = valueLabel !== null

    if (shouldShow) {
      // Cancel any pending hide/unmount operations
      if (valueButtonHideTimerRef.current) {
        clearTimeout(valueButtonHideTimerRef.current)
        valueButtonHideTimerRef.current = null
      }

      // Mount the element first (at opacity 0)
      if (!isValueButtonMounted) {
        setIsValueButtonMounted(true)
      }

      // Use a small delay to ensure the element is fully painted before starting the fade-in
      // This creates a more elegant, deliberate entrance
      if (valueButtonShowRafRef.current) cancelAnimationFrame(valueButtonShowRafRef.current)
      valueButtonShowRafRef.current = requestAnimationFrame(() => {
        valueButtonShowRafRef.current = requestAnimationFrame(() => {
          // Small additional delay for a more graceful entrance
          setTimeout(() => {
            setIsValueButtonVisible(true)
            valueButtonShowRafRef.current = null
          }, 16) // ~1 frame delay for smoother transition
        })
      })
      return
    }

    // valueLabel is null → fade out gracefully, then unmount
    if (isValueButtonVisible) {
      setIsValueButtonVisible(false)
      // Wait for fade-out animation to complete before unmounting
      if (valueButtonHideTimerRef.current) clearTimeout(valueButtonHideTimerRef.current)
      valueButtonHideTimerRef.current = setTimeout(() => {
        setIsValueButtonMounted(false)
        valueButtonHideTimerRef.current = null
      }, ANIMATION_DELIBERATE)
    } else if (isValueButtonMounted) {
      // If already invisible but still mounted, unmount immediately
      setIsValueButtonMounted(false)
    }
  }, [sourceUrl, valueLabel, isValueButtonMounted, isValueButtonVisible])

  // Cleanup timers/raf for no-import value button
  useEffect(() => {
    return () => {
      if (valueButtonHideTimerRef.current) clearTimeout(valueButtonHideTimerRef.current)
      if (valueButtonShowRafRef.current) cancelAnimationFrame(valueButtonShowRafRef.current)
    }
  }, [])

  return (
    <div className="inline-flex flex-col items-center">
      <div
        ref={cardRef}
        className="relative"
        style={{
          width: `${visualWidth !== null ? visualWidth : settings.cardWidth}px`,
          transition: prefersReducedMotion
            ? 'none'
            : visualWidth !== null && visualWidth > CARD_MAX_WIDTH
            ? `width ${ANIMATION_STANDARD}ms ${EASING_BOUNCE}`
            : `width ${ANIMATION_MICRO}ms ${EASING_STANDARD}`,
        }}
        onMouseMove={handleHoverMove}
        onMouseLeave={handleHoverLeave}
      >
        {/* Left Handle */}
        <div
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-2 h-12 pointer-events-auto cursor-ew-resize flex items-center justify-end pr-1"
          style={{ left: '-8px' }}
          onMouseDown={(e) => handleMouseDown(e, 'width-left')}
          aria-label="Resize width left"
        >
          <div
            className="w-0.5 h-full rounded-full transition-opacity"
            style={{ backgroundColor: theme.textTertiary, opacity: 0.3 }}
          />
        </div>

        {/* Right Handle */}
        <div
          className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 w-2 h-12 pointer-events-auto cursor-ew-resize flex items-center justify-start pl-1"
          style={{ right: '-8px' }}
          onMouseDown={(e) => handleMouseDown(e, 'width-right')}
          aria-label="Resize width right"
        >
          <div
            className="w-0.5 h-full rounded-full transition-opacity"
            style={{ backgroundColor: theme.textTertiary, opacity: 0.3 }}
          />
        </div>

        {/* Corner Indicators - L-shaped */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const isHovered = hoveredCorner === corner
          const isActive = isResizingRadius
          if (!isActive && !isHovered) return null

          const handleStyle: React.CSSProperties = {
            backgroundColor: theme.textTertiary,
            opacity: 0.3,
            borderRadius: '2px',
          }

          const cornerConfigs: Record<string, { horizontal: React.CSSProperties; vertical: React.CSSProperties }> = {
            'top-left': {
              horizontal: { position: 'absolute', left: '-8px', top: '0px', width: `${CARD_HANDLE_LENGTH}px`, height: '2px', ...handleStyle },
              vertical: { position: 'absolute', left: '0px', top: '-8px', width: '2px', height: `${CARD_HANDLE_LENGTH}px`, ...handleStyle },
            },
            'top-right': {
              horizontal: { position: 'absolute', right: '-8px', top: '0px', width: `${CARD_HANDLE_LENGTH}px`, height: '2px', ...handleStyle },
              vertical: { position: 'absolute', right: '0px', top: '-8px', width: '2px', height: `${CARD_HANDLE_LENGTH}px`, ...handleStyle },
            },
            'bottom-left': {
              horizontal: { position: 'absolute', left: '-8px', bottom: '0px', width: `${CARD_HANDLE_LENGTH}px`, height: '2px', ...handleStyle },
              vertical: { position: 'absolute', left: '0px', bottom: '-8px', width: '2px', height: `${CARD_HANDLE_LENGTH}px`, ...handleStyle },
            },
            'bottom-right': {
              horizontal: { position: 'absolute', right: '-8px', bottom: '0px', width: `${CARD_HANDLE_LENGTH}px`, height: '2px', ...handleStyle },
              vertical: { position: 'absolute', right: '0px', bottom: '-8px', width: '2px', height: `${CARD_HANDLE_LENGTH}px`, ...handleStyle },
            },
          }

          const config = cornerConfigs[corner]
          return (
            <div key={corner} className="absolute inset-0 pointer-events-none">
              <div style={config.horizontal} />
              <div style={config.vertical} />
            </div>
          )
        })}

        {/* Interactive Zones - Large touch targets (44px minimum) for accessibility */}
        <button
          type="button"
          className="absolute left-0 top-0 bottom-0 w-11 cursor-ew-resize z-10 bg-transparent border-0 p-0"
          style={{ left: '-20px' }}
          onMouseDown={(e) => handleMouseDown(e, 'width-left')}
          aria-label="Resize width left"
        />
        <button
          type="button"
          className="absolute right-0 top-0 bottom-0 w-11 cursor-ew-resize z-10 bg-transparent border-0 p-0"
          style={{ right: '-20px' }}
          onMouseDown={(e) => handleMouseDown(e, 'width-right')}
          aria-label="Resize width right"
        />
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const cursorMap: Record<string, string> = {
            'top-left': 'nwse-resize',
            'top-right': 'nesw-resize',
            'bottom-left': 'nesw-resize',
            'bottom-right': 'nwse-resize',
          }
          return (
            <button
              key={corner}
              type="button"
              className="absolute z-10 pointer-events-auto bg-transparent border-0 p-0"
              style={{
                [corner.includes('left') ? 'left' : 'right']: `-${CARD_CORNER_ZONE}px`,
                [corner.includes('top') ? 'top' : 'bottom']: `-${CARD_CORNER_ZONE}px`,
                width: `${CARD_CORNER_ZONE * 2}px`,
                height: `${CARD_CORNER_ZONE * 2}px`,
                cursor: cursorMap[corner],
              }}
              onMouseDown={(e) => handleMouseDown(e, 'corner', corner)}
              aria-label={`Resize corner ${corner}`}
            />
          )
        })}

        <PostCard
          post={post}
          settings={{
            ...settings,
            borderRadius: isBorderRadius(String(Math.round(settings.customBorderRadius)))
              ? (String(Math.round(settings.customBorderRadius)) as any)
              : '20',
          }}
        />
      </div>

      {/* Button hidden when no source URL */}
      {sourceUrl && (
        <div className="flex justify-center" style={{ marginTop: CARD_BOTTOM_MARGIN }}>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-full border hover:brightness-105 active:scale-[0.99] whitespace-nowrap"
            style={{
              backgroundColor: theme.appBg,
              color: theme.textSecondary,
              borderColor: theme.buttonBorderDefault,
              boxShadow: theme.shadowShallow,
              // Match the fixed-width behavior of the "no source URL" px readout while resizing.
              minWidth: isShowingValueLabel
                ? valueButtonMinWidth
                  ? `${valueButtonMinWidth}px`
                  : undefined
                : buttonMinWidth
                  ? `${buttonMinWidth}px`
                  : undefined,
              // Intentionally avoid animating layout-affecting properties (like min-width).
              transition: [
                `background-color ${ANIMATION_MICRO}ms ${EASING_ELEGANT}`,
                `border-color ${ANIMATION_MICRO}ms ${EASING_ELEGANT}`,
                `color ${ANIMATION_MICRO}ms ${EASING_ELEGANT}`,
                `box-shadow ${ANIMATION_MICRO}ms ${EASING_ELEGANT}`,
                `filter ${ANIMATION_MICRO}ms ${EASING_ELEGANT}`,
              ].join(', '),
            }}
          >
            <span className="relative inline-flex">
              {fromText && (
                <span
                  className="absolute inset-0"
                  style={{
                    opacity: showTo ? 0 : 1,
                    transition: `opacity ${ANIMATION_MICRO}ms ${EASING_ELEGANT}`,
                  }}
                >
                  {fromText}
                </span>
              )}
              <span
                style={{
                  opacity: showTo ? 1 : 0,
                  transition: `opacity ${ANIMATION_MICRO}ms ${EASING_ELEGANT}`,
                }}
              >
                {toText}
              </span>
            </span>
          </a>
        </div>
      )}

      {/* If there's no source URL, show a temporary px readout button while resizing. */}
      {!sourceUrl && isValueButtonMounted && valueLabel && (
        <div className="flex justify-center" style={{ marginTop: CARD_BOTTOM_MARGIN }}>
          <div
            role="status"
            aria-live="polite"
            className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-full border whitespace-nowrap"
            style={{
              backgroundColor: theme.appBg,
              color: theme.textSecondary,
              borderColor: theme.buttonBorderDefault,
              boxShadow: theme.shadowShallow,
              minWidth: valueButtonMinWidth ? `${valueButtonMinWidth}px` : undefined,
              opacity: isValueButtonVisible ? 1 : 0,
              transition: `opacity ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
              pointerEvents: 'none',
            }}
          >
            {valueLabel}
          </div>

        </div>
      )}

      {/* Hidden measurers (always mounted so measurements are reliable). */}
      <span
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none whitespace-nowrap text-sm font-medium"
        style={{ left: -9999, top: -9999 }}
      >
        {VIEW_ORIGINAL_LABEL}
      </span>
      <span
        ref={valueMeasureRef}
        className="absolute opacity-0 pointer-events-none whitespace-nowrap text-sm font-medium"
        style={{ left: -9999, top: -9999 }}
      >
        {`${Math.max(CARD_MAX_WIDTH, CARD_MAX_RADIUS)}px`}
      </span>
    </div>
  )
}

