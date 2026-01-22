'use client'

import { useState, useRef, useEffect } from 'react'
import PostCard from './PostCard'
import { PostData, CardSettings } from '@/types/post'
import { getThemeStyles } from '@/lib/themes'

interface InteractivePostCardProps {
  post: PostData
  settings: CardSettings
  onSettingsChange: (settings: CardSettings) => void
}

const CORNER_ZONE = 24
const MIN_WIDTH = 350
const MAX_WIDTH = 700
const MAX_RADIUS = 40

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

  const theme = getThemeStyles(settings.theme)

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingWidth) {
        const deltaX = e.clientX - startXRef.current
        let newWidth: number

        if (resizeTypeRef.current === 'width-left') {
          // Resizing from left: width decreases as we move left (deltaX is negative)
          newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidthRef.current - deltaX))
        } else {
          // Resizing from right: width increases as we move right (deltaX is positive)
          newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidthRef.current + deltaX))
        }

        onSettingsChange({ ...settings, cardWidth: newWidth })
        setIndicatorValue(`width: ${Math.round(newWidth)}px`)
      } else if (isResizingRadius) {
        const cardRect = cardRef.current?.getBoundingClientRect()
        if (!cardRect) return

        // Calculate distance from corner
        const corners = {
          'top-left': { x: cardRect.left, y: cardRect.top },
          'top-right': { x: cardRect.right, y: cardRect.top },
          'bottom-left': { x: cardRect.left, y: cardRect.bottom },
          'bottom-right': { x: cardRect.right, y: cardRect.bottom },
        }

        const corner = corners[hoveredCorner as keyof typeof corners]
        if (!corner) return

        // Calculate distance from mouse to corner
        const distance = Math.sqrt(
          Math.pow(e.clientX - corner.x, 2) + Math.pow(e.clientY - corner.y, 2)
        )

        // Radius is proportional to distance from corner (accounting for the corner zone)
        const rawRadius = Math.max(0, Math.min(MAX_RADIUS, Math.max(0, distance - CORNER_ZONE)))
        // Snap to 4px increments
        const snappedRadius = Math.round(rawRadius / 4) * 4
        onSettingsChange({ ...settings, customBorderRadius: snappedRadius })
        setIndicatorValue(`radius: ${snappedRadius}px`)
      }
    }

    const handleMouseUp = () => {
      setIsResizingWidth(false)
      setIsResizingRadius(false)
      resizeTypeRef.current = null
      setIsIndicatorVisible(false)
      setHoveredCorner(null)
      document.body.style.cursor = 'default'
    }

    if (isResizingWidth || isResizingRadius) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

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
      setIsResizingWidth(true)
      resizeTypeRef.current = type
      startXRef.current = e.clientX
      startWidthRef.current = settings.cardWidth
      setIndicatorValue(`width: ${Math.round(settings.cardWidth)}px`)
    } else if (type === 'corner' && corner) {
      setIsResizingRadius(true)
      setHoveredCorner(corner)
      startRadiusRef.current = settings.customBorderRadius
      setIndicatorValue(`radius: ${settings.customBorderRadius}px`)
    }
  }

  // Store resize type for proper width calculation
  const resizeTypeRef = useRef<'width-left' | 'width-right' | null>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizingWidth || isResizingRadius) return

    const cardRect = cardRef.current?.getBoundingClientRect()
    if (!cardRect) return

    const { clientX, clientY } = e
    const { left, right, top, bottom } = cardRect

    // Check if near corners (24px zone)
    const cornerZones = {
      'top-left': { x: left, y: top, zone: CORNER_ZONE },
      'top-right': { x: right, y: top, zone: CORNER_ZONE },
      'bottom-left': { x: left, y: bottom, zone: CORNER_ZONE },
      'bottom-right': { x: right, y: bottom, zone: CORNER_ZONE },
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
      // Set cursor based on corner
      const cursorMap: Record<string, string> = {
        'top-left': 'nwse-resize',
        'top-right': 'nesw-resize',
        'bottom-left': 'nesw-resize',
        'bottom-right': 'nwse-resize',
      }
      document.body.style.cursor = cursorMap[nearCorner] || 'default'
    } else if (Math.abs(clientX - left) < 8 || Math.abs(clientX - right) < 8) {
      // Near left or right edge (but not corner)
      document.body.style.cursor = 'ew-resize'
      setHoveredCorner(null)
    } else {
      document.body.style.cursor = 'default'
      setHoveredCorner(null)
    }
  }

  const handleMouseLeave = () => {
    if (!isResizingWidth && !isResizingRadius) {
      document.body.style.cursor = 'default'
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
        style={{ width: `${settings.cardWidth}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Corner Indicators - L-shaped matching edge handle style */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const isHovered = hoveredCorner === corner
          const isActive = isResizingRadius

          // Show on all corners when actively resizing, or just the hovered corner when hovering
          if (!isActive && !isHovered) return null

          const handleLength = 12 // Match edge handle length
          const handleStyle: React.CSSProperties = {
            backgroundColor: theme.textTertiary,
            opacity: 0.3,
            borderRadius: '1px', // Rounded caps
          }

          const cornerConfigs: Record<string, { horizontal: React.CSSProperties; vertical: React.CSSProperties }> = {
            'top-left': {
              horizontal: {
                position: 'absolute',
                left: '-8px',
                top: '0px',
                width: `${handleLength}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                left: '0px',
                top: '-8px',
                width: '2px',
                height: `${handleLength}px`,
                ...handleStyle,
              },
            },
            'top-right': {
              horizontal: {
                position: 'absolute',
                right: '-8px',
                top: '0px',
                width: `${handleLength}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                right: '0px',
                top: '-8px',
                width: '2px',
                height: `${handleLength}px`,
                ...handleStyle,
              },
            },
            'bottom-left': {
              horizontal: {
                position: 'absolute',
                left: '-8px',
                bottom: '0px',
                width: `${handleLength}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                left: '0px',
                bottom: '-8px',
                width: '2px',
                height: `${handleLength}px`,
                ...handleStyle,
              },
            },
            'bottom-right': {
              horizontal: {
                position: 'absolute',
                right: '-8px',
                bottom: '0px',
                width: `${handleLength}px`,
                height: '2px',
                ...handleStyle,
              },
              vertical: {
                position: 'absolute',
                right: '0px',
                bottom: '-8px',
                width: '2px',
                height: `${handleLength}px`,
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
                [corner.includes('left') ? 'left' : 'right']: `-${CORNER_ZONE}px`,
                [corner.includes('top') ? 'top' : 'bottom']: `-${CORNER_ZONE}px`,
                width: `${CORNER_ZONE * 2}px`,
                height: `${CORNER_ZONE * 2}px`,
                cursor: cursorMap[corner],
              }}
              onMouseDown={(e) => handleMouseDown(e, 'corner', corner)}
            />
          )
        })}

        {/* Post Card */}
        <PostCard
          post={post}
          settings={{
            ...settings,
            borderRadius: String(Math.round(settings.customBorderRadius)) as any,
          }}
        />

        {/* Value Indicator Label */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 mt-[20px] top-full px-3 py-1.5 rounded-full border text-[10px] font-medium transition-all duration-1000 ease-in-out pointer-events-none whitespace-nowrap z-50 ${
            isIndicatorVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
          }`}
          style={{
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.textSecondary,
            boxShadow: `0 2px 10px rgba(0, 0, 0, ${settings.theme === 'light' ? '0.04' : '0.2'})`,
          }}
        >
          {indicatorValue}
        </div>
      </div>
    </div>
  )
}
