'use client'

import { PostData, CardSettings, ShadowIntensity } from '@/types/post'
import { getThemeStyles } from '@/lib/themes'
import { ANIMATION_DELIBERATE, ANIMATION_STANDARD, EASING_STANDARD } from '@/constants/ui'

interface PostCardProps {
  post: PostData
  settings: CardSettings
  /** Optional style overrides (e.g. for share page shadow reveal). Merged onto root. */
  styleOverride?: React.CSSProperties
}

export default function PostCard({ post, settings, styleOverride }: PostCardProps) {
  const theme = getThemeStyles(settings.theme)
  const hasImages = post.content.images.length > 0

  // Map shadow intensity to Tailwind classes - type-safe mapping
  const shadowClasses: Record<ShadowIntensity, string> = {
    flat: '',
    raised: 'shadow-card-raised',
    floating: 'shadow-card-floating',
    elevated: 'shadow-card-elevated',
  }

  // Map border radius to Tailwind classes
  const radiusClasses = {
    '0': 'rounded-card-0',
    '8': 'rounded-card-8',
    '16': 'rounded-card-16',
    '20': 'rounded-card-20',
    '24': 'rounded-card-24',
  }

  // Use customBorderRadius if available, otherwise fall back to preset
  const borderRadius = settings.customBorderRadius !== undefined 
    ? `${settings.customBorderRadius}px`
    : undefined

  // Nested radii for all image corners that touch the card content boundary (concentric with card corners)
  const CARD_PADDING = 24 // p-6
  const IMAGE_DEFAULT_RADIUS = 16 // rounded-2xl
  const cardRadiusPx = settings.customBorderRadius ?? parseInt(settings.borderRadius, 10)
  const nestedRadius = hasImages ? Math.max(0, cardRadiusPx - CARD_PADDING) : IMAGE_DEFAULT_RADIUS

  return (
    <div
      id="card-preview"
      className={`p-6 select-none cursor-default ${borderRadius ? '' : radiusClasses[settings.borderRadius]} ${shadowClasses[settings.shadowIntensity]}`}
      style={{
        backgroundColor: theme.bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: theme.border,
        borderRadius: borderRadius,
        transition: `height ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}, box-shadow ${ANIMATION_DELIBERATE}ms ${EASING_STANDARD}, border-color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}, background-color ${ANIMATION_STANDARD}ms ${EASING_STANDARD}`,
        ...styleOverride,
      }}
    >
      {/* Author Section */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full object-cover"
              draggable={false}
              loading="eager"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: theme.border, color: theme.textSecondary }}
            >
              {post.author.name.charAt(0)}
            </div>
          )}
          {/* Subtle inner stroke overlay (match post image treatment) */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: `inset 0 0 0 1px ${theme.imageInnerStroke}` }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col" style={{ rowGap: 2 }}>
            <div className="flex items-center gap-0.5">
            <span
              className="font-bold text-base truncate"
              style={{ color: theme.textPrimary }}
            >
              {post.author.name}
            </span>
            {post.author.verified && (
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill={theme.accent}
                aria-hidden="true"
              >
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
              </svg>
            )}
            </div>
            <span
              className="text-sm"
              style={{ color: theme.textSecondary }}
            >
              {post.author.handle}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={hasImages ? 'mb-4' : 'mb-0'}>
        <p
          className="text-base whitespace-pre-wrap break-words"
          style={{ color: theme.textPrimary }}
        >
          {post.content.text}
        </p>
      </div>

      {/* Images Section */}
      {hasImages && (
        <div className="-mx-6 px-6">
          <div className={`grid gap-2 ${post.content.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.content.images.map((image, index) => {
              const count = post.content.images.length
              const isThirdImage = count === 3 && index === 2
              // Every corner uses nested radius (concentric with card: inner = cardRadius - padding)
              const imageBorderRadius = `${nestedRadius}px`
              return (
                <div
                  key={index}
                  className={`relative w-full overflow-hidden ${isThirdImage ? 'col-span-2' : ''}`}
                  style={{
                    borderRadius: imageBorderRadius,
                    aspectRatio: count === 1 ? '16/9' : isThirdImage ? '16/9' : '1',
                    maxHeight: '180px',
                  }}
                >
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                    loading="eager"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle inner stroke overlay (matches wrapper radius) */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      borderRadius: imageBorderRadius,
                      boxShadow: `inset 0 0 0 1px ${theme.imageInnerStroke}`,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
