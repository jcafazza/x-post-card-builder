import * as React from 'react'
import type { PostData, ShadowIntensity, ThemeStyles } from './types'
import { getShadowForIntensity } from './themes'

interface PostCardProps {
  post: PostData
  theme: ThemeStyles
  shadow: ShadowIntensity
  width: number
  radius: number
}

/** Verified badge SVG icon */
function VerifiedBadge({ color }: { color: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
    </svg>
  )
}

/** Default loading skeleton */
export function PostCardSkeleton({ width, radius }: { width: number; radius: number }) {
  return (
    <div
      style={{
        width,
        padding: 24,
        borderRadius: radius,
        backgroundColor: '#f3f4f6',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: '60%',
              height: 16,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
              marginBottom: 8,
            }}
          />
          <div
            style={{
              width: '40%',
              height: 14,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: 60,
          borderRadius: 4,
          backgroundColor: '#e5e7eb',
        }}
      />
    </div>
  )
}

/** The styled post card component */
export function PostCard({ post, theme, shadow, width, radius }: PostCardProps) {
  const hasImages = post.content.images.length > 0

  // Nested radii for images (concentric with card corners)
  const CARD_PADDING = 24
  const nestedRadius = hasImages ? Math.max(0, radius - CARD_PADDING) : 16

  const boxShadow = getShadowForIntensity(theme, shadow)

  return (
    <div
      style={{
        width,
        padding: CARD_PADDING,
        backgroundColor: theme.bg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.border,
        borderRadius: radius,
        boxShadow,
        boxSizing: 'border-box',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Author Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            position: 'relative',
            width: 48,
            height: 48,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.border,
                color: theme.textSecondary,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {post.author.name.charAt(0)}
            </div>
          )}
          {/* Inner stroke overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              boxShadow: `inset 0 0 0 1px ${theme.imageInnerStroke}`,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Name and handle */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: theme.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {post.author.name}
            </span>
            {post.author.verified && <VerifiedBadge color={theme.accent} />}
          </div>
          <span
            style={{
              fontSize: 14,
              color: theme.textSecondary,
            }}
          >
            {post.author.handle}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: hasImages ? 16 : 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.5,
            color: theme.textPrimary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {post.content.text}
        </p>
      </div>

      {/* Images */}
      {hasImages && (
        <div style={{ marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}>
          <div
            style={{
              display: 'grid',
              gap: 8,
              gridTemplateColumns: post.content.images.length === 1 ? '1fr' : '1fr 1fr',
            }}
          >
            {post.content.images.map((image, index) => {
              const count = post.content.images.length
              const isThirdImage = count === 3 && index === 2

              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: nestedRadius,
                    aspectRatio: count === 1 ? '16/9' : isThirdImage ? '16/9' : '1',
                    gridColumn: isThirdImage ? 'span 2' : undefined,
                  }}
                >
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                  {/* Inner stroke overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: nestedRadius,
                      boxShadow: `inset 0 0 0 1px ${theme.imageInnerStroke}`,
                      pointerEvents: 'none',
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
