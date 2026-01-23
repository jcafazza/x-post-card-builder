'use client'

import { useState, useRef, useEffect } from 'react'
import PostCard from './PostCard'
import { PostData, CardSettings } from '@/types/post'
import { getThemeStyles } from '@/lib/themes'
import { ANIMATION_MICRO, ANIMATION_EXTENDED, EASING_STANDARD } from '@/constants/ui'
import { 
  CARD_MIN_WIDTH, 
  CARD_MAX_WIDTH, 
  CARD_MAX_RADIUS, 
  CARD_CORNER_ZONE, 
  CARD_HANDLE_LENGTH 
} from '@/constants/card'
import { isBorderRadius } from '@/lib/utils'

interface InteractivePostCardProps {
  post: PostData
  settings: CardSettings
  onSettingsChange: (settings: CardSettings) => void
}

export default function InteractivePostCard({ post, settings, onSettingsChange }: InteractivePostCardProps) {
  const [isResizingWidth, setIsResizingWidth] = useState(false)
  const [isResizingRadius, setIsResizingRadius] = useState(false)
  const [hoveredCorner, setHoveredCorner] = useState<string | null>(null)
  const [indicatorValue, setIndicatorValue] = useState<string | null>(null)
  const [isIndicatorVisible, setIsIndicatorVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const startRadiusRef = useRef<number>(0)
  const indicatorFadeOutTimerRef = useRef<NodeJS.Timeout | null>(null)

  const theme = getThemeStyles(settings.theme)

  const setGlobalCursor = (cursor: string) => {
    // Safari can ignore body cursor changes during active drags; setting on <html>
    // tends to be more reliable across browsers.
    document.documentElement.style.cursor = cursor
    document.body.style.cursor = cursor
  }

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingWidth) {
        setGlobalCursor('ew-resize')
        const deltaX = e.clientX - startXRef.current
        let rawWidth: number

        if (resizeTypeRef.current === 'width-left') {
          // Resizing from left: width decreases as we move left (deltaX is negative)
          rawWidth = startWidthRef.current - deltaX
        } else {
          // Resizing from right: width increases as we move right (deltaX is positive)
          rawWidth = startWidthRef.current + deltaX
        }

        // Snap to 2px increments (only even numbers) and clamp to bounds
        const snappedWidth = Math.max(CARD_MIN_WIDTH, Math.min(CARD_MAX_WIDTH, Math.round(rawWidth / 2) * 2))

        onSettingsChange({ ...settings, cardWidth: snappedWidth })
        setIndicatorValue(`width: ${snappedWidth}px`)
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

        // Calculate distance from corner to determine border radius
        const corners = {
          'top-left': { x: cardRect.left, y: cardRect.top },
          'top-right': { x: cardRect.right, y: cardRect.top },
          'bottom-left': { x: cardRect.left, y: cardRect.bottom },
          'bottom-right': { x: cardRect.right, y: cardRect.bottom },
        }

        const corner = corners[hoveredCorner as keyof typeof corners]
        if (!corner) return

        // Calculate Euclidean distance from mouse to corner
        const distance = Math.sqrt(
          Math.pow(e.clientX - corner.x, 2) + Math.pow(e.clientY - corner.y, 2)
        )
        
        // Radius is proportional to distance from corner (accounting for the corner zone offset)
        const rawRadius = Math.max(0, Math.min(CARD_MAX_RADIUS, Math.max(0, distance - CARD_CORNER_ZONE)))
        // Snap to 4px increments for a tactical, notched feel
        const snappedRadius = Math.round(rawRadius / 4) * 4
        onSettingsChange({ ...settings, customBorderRadius: snappedRadius })
        setIndicatorValue(`radius: ${snappedRadius}px`)
      }
    }

    const handleMouseUp = () => {
      setIsResizingWidth(false)
      setIsResizingRadius(false)
      resizeTypeRef.current = null
      setHoveredCorner(null)
      setGlobalCursor('default')
      
      // Smooth fade-out for indicator using framework timing
      if (indicatorFadeOutTimerRef.current) {
        clearTimeout(indicatorFadeOutTimerRef.current)
      }
      // Start fade-out transition, then hide after animation completes
      indicatorFadeOutTimerRef.current = setTimeout(() => {
        setIsIndicatorVisible(false)
        indicatorFadeOutTimerRef.current = null
      }, ANIMATION_EXTENDED)
    }

    if (isResizingWidth || isResizingRadius) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    // Always return cleanup to prevent memory leaks
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingWidth, isResizingRadius, hoveredCorner, settings, onSettingsChange])

  const handleMouseDown = (e: React.MouseEvent, type: 'width-left' | 'width-right' | 'corner', corner?: string) => {
    e.preventDefault()
    e.stopPropagation()

    setIsIndicatorVisible(true)

    if (type === 'width-left' || type === 'width-right') {
      setGlobalCursor('ew-resize')
      setIsResizingWidth(true)
      resizeTypeRef.current = type
      startXRef.current = e.clientX
      // Ensure starting width is snapped to 2px increment
      const snappedStartWidth = Math.round(settings.cardWidth / 2) * 2
      startWidthRef.current = snappedStartWidth
      setIndicatorValue(`width: ${snappedStartWidth}px`)
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
      setIndicatorValue(`radius: ${settings.customBorderRadius}px`)
    }
  }

  // Store resize type for proper width calculation
  const resizeTypeRef = useRef<'width-left' | 'width-right' | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (indicatorFadeOutTimerRef.current) {
        clearTimeout(indicatorFadeOutTimerRef.current)
        indicatorFadeOutTimerRef.current = null
      }
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizingWidth || isResizingRadius) return

    const cardRect = cardRef.current?.getBoundingClientRect()
    if (!cardRect) return

    const { clientX, clientY } = e
    const { left, right, top, bottom } = cardRect

    // Check if near corners within the defined interaction zone
    const cornerZones = {
      'top-left': { x: left, y: top, zone: CARD_CORNER_ZONE },
      'top-right': { x: right, y: top, zone: CARD_CORNER_ZONE },
      'bottom-left': { x: left, y: bottom, zone: CARD_CORNER_ZONE },
      'bottom-right': { x: right, y: bottom, zone: CARD_CORNER_ZONE },
    }

    let nearCorner: string | null = null
    for (const [corner, pos] of Object.entries(cornerZones)) {
      // Euclidean distance check for corner hit detection
      const distance = Math.sqrt(Math.pow(clientX - pos.x, 2) + Math.pow(clientY - pos.y, 2))
      if (distance <= pos.zone) {
        nearCorner = corner
        break
      }
    }

    if (nearCorner) {
      setHoveredCorner(nearCorner)
      // Set cursor based on corner
      const cursorMap: Record<string, string> = {
        'top-left': 'nwse-resize',
        'top-right': 'nesw-resize',
        'bottom-left': 'nesw-resize',
        'bottom-right': 'nwse-resize',
      }
      setGlobalCursor(cursorMap[nearCorner] || 'default')
      setHoveredCorner(nearCorner)
    } else if (Math.abs(clientX - left) < 8 || Math.abs(clientX - right) < 8) {
      // Near left or right edge (but not corner)
      setGlobalCursor('ew-resize')
      setHoveredCorner(null)
    } else {
      setGlobalCursor('default')
      setHoveredCorner(null)
    }
  }

  const handleMouseLeave = () => {
    if (!isResizingWidth && !isResizingRadius) {
      setGlobalCursor('default')
      setHoveredCorner(null)
    }
  }

  return (
    <div className="relative inline-block">
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

      {/* Card Container */}
      <div
        ref={cardRef}
        className="relative"
        style={{
          width: `${settings.cardWidth}px`,
          transition: `width ${ANIMATION_MICRO}ms ${EASING_STANDARD}`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Corner Indicators - L-shaped matching edge handle style */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const isHovered = hoveredCorner === corner
          const isActive = isResizingRadius

          // Show on all corners when actively resizing, or just the hovered corner when hovering
          if (!isActive && !isHovered) return null

          const handleStyle: React.CSSProperties = {
            backgroundColor: theme.textTertiary,
            opacity: 0.3,
            borderRadius: '2px', // Slightly more rounded for visual refinement
          }

          const cornerConfigs: Record<string, { horizontal: React.CSSProperties; vertical: React.CSSProperties }> = {
            'top-left': {
              horizontal: {
                position: 'absolute',
                left: '-8px',
                top: '0px',
                width: `${CARD_HANDLE_LENGTH}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                left: '0px',
                top: '-8px',
                width: '2px',
                height: `${CARD_HANDLE_LENGTH}px`,
                ...handleStyle,
              },
            },
            'top-right': {
              horizontal: {
                position: 'absolute',
                right: '-8px',
                top: '0px',
                width: `${CARD_HANDLE_LENGTH}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                right: '0px',
                top: '-8px',
                width: '2px',
                height: `${CARD_HANDLE_LENGTH}px`,
                ...handleStyle,
              },
            },
            'bottom-left': {
              horizontal: {
                position: 'absolute',
                left: '-8px',
                bottom: '0px',
                width: `${CARD_HANDLE_LENGTH}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                left: '0px',
                bottom: '-8px',
                width: '2px',
                height: `${CARD_HANDLE_LENGTH}px`,
                ...handleStyle,
              },
            },
            'bottom-right': {
              horizontal: {
                position: 'absolute',
                right: '-8px',
                bottom: '0px',
                width: `${CARD_HANDLE_LENGTH}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                right: '0px',
                bottom: '-8px',
                width: '2px',
                height: `${CARD_HANDLE_LENGTH}px`,
                ...handleStyle,
              },
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

        {/* Interactive Zones */}
        {/* Left Edge Zone */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-10"
          style={{ left: '-8px' }}
          onMouseDown={(e) => handleMouseDown(e, 'width-left')}
        />

        {/* Right Edge Zone */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-10"
          style={{ right: '-8px' }}
          onMouseDown={(e) => handleMouseDown(e, 'width-right')}
        />

        {/* Corner Zones */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const cursorMap: Record<string, string> = {
            'top-left': 'nwse-resize',
            'top-right': 'nesw-resize',
            'bottom-left': 'nesw-resize',
            'bottom-right': 'nwse-resize',
          }

          return (
            <div
              key={corner}
              className="absolute z-10 pointer-events-auto"
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

        {/* Post Card */}
        <PostCard
          post={post}
          settings={{
            ...settings,
            borderRadius: isBorderRadius(String(Math.round(settings.customBorderRadius))) 
              ? String(Math.round(settings.customBorderRadius)) as any 
              : '20',
          }}
        />

        {/* Value Indicator Label */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 mt-5 top-full px-3 py-1.5 rounded-full border text-xs font-medium pointer-events-none whitespace-nowrap z-50 ${
            isIndicatorVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
          }`}
          style={{
            transition: `all ${ANIMATION_EXTENDED}ms ${EASING_STANDARD}`,
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.textSecondary,
            boxShadow: theme.shadowMedium,
          }}
        >
          {indicatorValue}
        </div>
      </div>
    </div>
  )
}
