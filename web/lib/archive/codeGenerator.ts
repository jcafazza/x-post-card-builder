import { PostData, CardSettings, ShadowIntensity } from '@/types/post'
import { getThemeStyles } from '../themes'
import { formatTimestamp } from '../utils'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SHADOW CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Shadow intensity to CSS box-shadow mapping.
 * 
 * Matches the visual hierarchy defined in globals.css:
 * - flat: No shadow (ground level)
 * - raised: Subtle elevation (2px blur, 8px spread)
 * - floating: Medium elevation (4px blur, 16px spread)
 * - elevated: High elevation (8px blur, 32px spread)
 * 
 * These values must match --shadow-card-* CSS variables exactly
 * to ensure generated code matches the visual preview.
 */
const shadowMap: Record<ShadowIntensity, string> = {
  flat: 'none',
  raised: '0 2px 8px rgba(0, 0, 0, 0.08)',
  floating: '0 4px 16px rgba(0, 0, 0, 0.12)',
  elevated: '0 8px 32px rgba(0, 0, 0, 0.16)',
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UTILITIES
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Generate inline styles object for the card container
 */
function generateCardStyles(settings: CardSettings): Record<string, string> {
  const theme = getThemeStyles(settings.theme)
  const borderRadius = settings.customBorderRadius !== undefined
    ? `${settings.customBorderRadius}px`
    : `${settings.borderRadius}px`

  return {
    backgroundColor: theme.bg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.border,
    borderRadius: borderRadius,
    boxShadow: shadowMap[settings.shadowIntensity],
    padding: '24px',
    width: `${settings.cardWidth}px`,
    transition: 'all 0.3s ease',
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * REACT COMPONENT GENERATION
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Generate React/JSX code
 */
export function generateReactCode(post: PostData, settings: CardSettings): string {
  const theme = getThemeStyles(settings.theme)
  const cardStyles = generateCardStyles(settings)
  const stylesString = Object.entries(cardStyles)
    .map(([key, value]) => `    ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: '${value}',`)
    .join('\n')

  const verifiedBadge = post.author.verified
    ? `\n              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="#1D9BF0"
              >
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
              </svg>`
    : ''

  const avatarSection = post.author.avatar
    ? `<img
                src="${escapeHtml(post.author.avatar)}"
                alt="${escapeHtml(post.author.name)}"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />`
    : `<div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  backgroundColor: '${theme.border}',
                  color: '${theme.textSecondary}',
                  borderRadius: '50%',
                }}
              >
                ${escapeHtml(post.author.name.charAt(0))}
              </div>`

  const imagesSection = post.content.images.length > 0
    ? `
      {/* Images Section */}
      <div style={{ marginBottom: '16px', marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ 
          display: 'grid', 
          gap: '8px',
          gridTemplateColumns: post.content.images.length === 1 ? '1fr' : '1fr 1fr'
        }}>
          {post.content.images.map((image, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                borderRadius: '16px',
                aspectRatio: post.content.images.length === 1 ? '16/9' : '1',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '${theme.border}',
              }}
            >
              <img
                src={image}
                alt={\`Post image \${index + 1}\`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>
      </div>`
    : ''

  const timestampSection = settings.showDate
    ? `
      {/* Timestamp Section */}
      <div style={{ paddingTop: '12px', borderTop: \`1px solid ${theme.border}\` }}>
        <span style={{ fontSize: '14px', color: '${theme.textTertiary}' }}>
          ${escapeHtml(formatTimestamp(post.timestamp))}
        </span>
      </div>`
    : ''

  return `export function XPostCard() {
  const post = {
    author: {
      name: "${escapeHtml(post.author.name)}",
      handle: "${escapeHtml(post.author.handle)}",
      avatar: "${escapeHtml(post.author.avatar || '')}",
      verified: ${post.author.verified},
    },
    content: {
      text: ${JSON.stringify(post.content.text)},
      images: ${JSON.stringify(post.content.images)},
    },
    timestamp: "${post.timestamp}",
  }

  return (
    <div
      style={{
${stylesString}
      }}
    >
      {/* Author Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          position: 'relative',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          ${avatarSection}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontWeight: 'bold',
              fontSize: '16px',
              color: '${theme.textPrimary}',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {post.author.name}
            </span>${verifiedBadge}
          </div>
          <span style={{ fontSize: '14px', color: '${theme.textSecondary}' }}>
            {post.author.handle}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{
          fontSize: '16px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: '${theme.textPrimary}',
        }}>
          {post.content.text}
        </p>
      </div>${imagesSection}${timestampSection}
    </div>
  )
}`
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HTML/CSS GENERATION
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Generate HTML code
 */
export function generateHTMLCode(post: PostData, settings: CardSettings): string {
  const theme = getThemeStyles(settings.theme)
  const cardStyles = generateCardStyles(settings)
  const stylesString = Object.entries(cardStyles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join(' ')

  const verifiedBadge = post.author.verified
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1D9BF0" style="flex-shrink: 0;">
        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
      </svg>`
    : ''

  const avatarSection = post.author.avatar
    ? `<img
        src="${escapeHtml(post.author.avatar)}"
        alt="${escapeHtml(post.author.name)}"
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
      />`
    : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; background-color: ${theme.border}; color: ${theme.textSecondary}; border-radius: 50%;">
        ${escapeHtml(post.author.name.charAt(0))}
      </div>`

  const imagesSection = post.content.images.length > 0
    ? `
      <!-- Images Section -->
      <div style="margin-bottom: 16px; margin-left: -24px; margin-right: -24px; padding-left: 24px; padding-right: 24px;">
        <div style="display: grid; gap: 8px; grid-template-columns: ${post.content.images.length === 1 ? '1fr' : '1fr 1fr'};">
          ${post.content.images.map((image, index) => `
          <div style="position: relative; width: 100%; overflow: hidden; border-radius: 16px; aspect-ratio: ${post.content.images.length === 1 ? '16/9' : '1'}; border: 1px solid ${theme.border};">
            <img src="${escapeHtml(image)}" alt="Post image ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>`).join('')}
        </div>
      </div>`
    : ''

  const timestampSection = settings.showDate
    ? `
      <!-- Timestamp Section -->
      <div style="padding-top: 12px; border-top: 1px solid ${theme.border};">
        <span style="font-size: 14px; color: ${theme.textTertiary};">
          ${escapeHtml(formatTimestamp(post.timestamp))}
        </span>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>X Post Card</title>
</head>
<body>
  <div style="${stylesString}">
    <!-- Author Section -->
    <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
      <div style="position: relative; width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0;">
        ${avatarSection}
      </div>

      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-weight: bold; font-size: 16px; color: ${theme.textPrimary}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(post.author.name)}
          </span>
          ${verifiedBadge}
        </div>
        <span style="font-size: 14px; color: ${theme.textSecondary};">
          ${escapeHtml(post.author.handle)}
        </span>
      </div>
    </div>

    <!-- Content Section -->
    <div style="margin-bottom: 16px;">
      <p style="font-size: 16px; white-space: pre-wrap; word-break: break-word; color: ${theme.textPrimary};">
        ${escapeHtml(post.content.text)}
      </p>
    </div>${imagesSection}${timestampSection}
  </div>
</body>
</html>`
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * VUE COMPONENT GENERATION
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Generate Vue code
 */
export function generateVueCode(post: PostData, settings: CardSettings): string {
  const theme = getThemeStyles(settings.theme)
  const cardStyles = generateCardStyles(settings)
  const stylesString = Object.entries(cardStyles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: '${value}'`)
    .join(',\n        ')

  const verifiedBadge = post.author.verified
    ? `\n              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1D9BF0" style="flex-shrink: 0;">
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
              </svg>`
    : ''

  const avatarSection = post.author.avatar
    ? `<img
                :src="post.author.avatar"
                :alt="post.author.name"
                :style="avatarImageStyle"
              />`
    : `<div :style="avatarPlaceholderStyle">
                {{ post.author.name.charAt(0) }}
              </div>`

  const imagesSection = post.content.images.length > 0
    ? `
      <!-- Images Section -->
      <div style="margin-bottom: 16px; margin-left: -24px; margin-right: -24px; padding-left: 24px; padding-right: 24px;">
        <div :style="imagesGridStyle">
          <div
            v-for="(image, index) in post.content.images"
            :key="index"
            :style="imageContainerStyle"
          >
            <img :src="image" :alt="\`Post image \${index + 1}\`" :style="imageStyle" />
          </div>
        </div>
      </div>`
    : ''

  const timestampSection = settings.showDate
    ? `
      <!-- Timestamp Section -->
      <div :style="timestampContainerStyle">
        <span :style="timestampStyle">
          {{ formattedTimestamp }}
        </span>
      </div>`
    : ''

  return `<template>
  <div :style="cardStyle">
    <!-- Author Section -->
    <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
      <div style="position: relative; width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0;">
        ${avatarSection}
      </div>

      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <span :style="authorNameStyle">
            {{ post.author.name }}
          </span>${verifiedBadge}
        </div>
        <span :style="authorHandleStyle">
          {{ post.author.handle }}
        </span>
      </div>
    </div>

    <!-- Content Section -->
    <div style="margin-bottom: 16px;">
      <p :style="contentStyle">
        {{ post.content.text }}
      </p>
    </div>${imagesSection}${timestampSection}
  </div>
</template>

<script>
export default {
  name: 'XPostCard',
  data() {
    return {
      post: {
        author: {
          name: "${escapeHtml(post.author.name)}",
          handle: "${escapeHtml(post.author.handle)}",
          avatar: "${escapeHtml(post.author.avatar || '')}",
          verified: ${post.author.verified},
        },
        content: {
          text: ${JSON.stringify(post.content.text)},
          images: ${JSON.stringify(post.content.images)},
        },
        timestamp: "${post.timestamp}",
      },
      cardStyle: {
        ${stylesString}
      },
      authorNameStyle: {
        fontWeight: 'bold',
        fontSize: '16px',
        color: '${theme.textPrimary}',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      authorHandleStyle: {
        fontSize: '14px',
        color: '${theme.textSecondary}',
      },
      contentStyle: {
        fontSize: '16px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: '${theme.textPrimary}',
      },
      avatarImageStyle: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%',
      },
      avatarPlaceholderStyle: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        backgroundColor: '${theme.border}',
        color: '${theme.textSecondary}',
        borderRadius: '50%',
      },
      imageStyle: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
      timestampContainerStyle: {
        paddingTop: '12px',
        borderTop: \`1px solid ${theme.border}\`,
      },
      timestampStyle: {
        fontSize: '14px',
        color: '${theme.textTertiary}',
      },
    }
  },
  computed: {
    formattedTimestamp() {
      const date = new Date(this.post.timestamp)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date)
    },
    imagesGridStyle() {
      return {
        display: 'grid',
        gap: '8px',
        gridTemplateColumns: this.post.content.images.length === 1 ? '1fr' : '1fr 1fr',
      }
    },
    imageContainerStyle() {
      return {
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '16px',
        aspectRatio: this.post.content.images.length === 1 ? '16/9' : '1',
        border: \`1px solid ${theme.border}\`,
      }
    },
  },
}
</script>`
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * VANILLA JS GENERATION
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Generate Vanilla JavaScript code
 */
export function generateVanillaJSCode(post: PostData, settings: CardSettings): string {
  const theme = getThemeStyles(settings.theme)
  const cardStyles = generateCardStyles(settings)

  return `function createXPostCard() {
  const post = {
    author: {
      name: ${JSON.stringify(post.author.name)},
      handle: ${JSON.stringify(post.author.handle)},
      avatar: ${JSON.stringify(post.author.avatar || '')},
      verified: ${post.author.verified},
    },
    content: {
      text: ${JSON.stringify(post.content.text)},
      images: ${JSON.stringify(post.content.images)},
    },
    timestamp: ${JSON.stringify(post.timestamp)},
  }

  const theme = {
    bg: '${theme.bg}',
    textPrimary: '${theme.textPrimary}',
    textSecondary: '${theme.textSecondary}',
    textTertiary: '${theme.textTertiary}',
    border: '${theme.border}',
  }

  // Create card container
  const card = document.createElement('div')
  Object.assign(card.style, {
    backgroundColor: '${cardStyles.backgroundColor}',
    borderWidth: '${cardStyles.borderWidth}',
    borderStyle: '${cardStyles.borderStyle}',
    borderColor: '${cardStyles.borderColor}',
    borderRadius: '${cardStyles.borderRadius}',
    boxShadow: '${cardStyles.boxShadow}',
    padding: '${cardStyles.padding}',
    width: '${cardStyles.width}',
    transition: '${cardStyles.transition}',
  })

  // Author section
  const authorSection = document.createElement('div')
  authorSection.style.cssText = 'display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;'

  const avatarContainer = document.createElement('div')
  avatarContainer.style.cssText = 'position: relative; width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0;'

  if (post.author.avatar) {
    const avatarImg = document.createElement('img')
    avatarImg.src = post.author.avatar
    avatarImg.alt = post.author.name
    avatarImg.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;'
    avatarContainer.appendChild(avatarImg)
  } else {
    const avatarPlaceholder = document.createElement('div')
    avatarPlaceholder.textContent = post.author.name.charAt(0)
    avatarPlaceholder.style.cssText = \`width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; background-color: \${theme.border}; color: \${theme.textSecondary}; border-radius: 50%;\`
    avatarContainer.appendChild(avatarPlaceholder)
  }

  const authorInfo = document.createElement('div')
  authorInfo.style.cssText = 'flex: 1; min-width: 0;'

  const authorNameRow = document.createElement('div')
  authorNameRow.style.cssText = 'display: flex; align-items: center; gap: 4px;'

  const authorName = document.createElement('span')
  authorName.textContent = post.author.name
  authorName.style.cssText = \`font-weight: bold; font-size: 16px; color: \${theme.textPrimary}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\`

  authorNameRow.appendChild(authorName)

  if (post.author.verified) {
    const verifiedBadge = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    verifiedBadge.setAttribute('width', '16')
    verifiedBadge.setAttribute('height', '16')
    verifiedBadge.setAttribute('viewBox', '0 0 24 24')
    verifiedBadge.setAttribute('fill', '#1D9BF0')
    verifiedBadge.style.cssText = 'flex-shrink: 0;'
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z')
    verifiedBadge.appendChild(path)
    authorNameRow.appendChild(verifiedBadge)
  }

  const authorHandle = document.createElement('span')
  authorHandle.textContent = post.author.handle
  authorHandle.style.cssText = \`font-size: 14px; color: \${theme.textSecondary};\`

  authorInfo.appendChild(authorNameRow)
  authorInfo.appendChild(authorHandle)
  authorSection.appendChild(avatarContainer)
  authorSection.appendChild(authorInfo)
  card.appendChild(authorSection)

  // Content section
  const contentSection = document.createElement('div')
  contentSection.style.cssText = 'margin-bottom: 16px;'

  const contentText = document.createElement('p')
  contentText.textContent = post.content.text
  contentText.style.cssText = \`font-size: 16px; white-space: pre-wrap; word-break: break-word; color: \${theme.textPrimary};\`

  contentSection.appendChild(contentText)
  card.appendChild(contentSection)

  // Images section
  if (post.content.images.length > 0) {
    const imagesSection = document.createElement('div')
    imagesSection.style.cssText = 'margin-bottom: 16px; margin-left: -24px; margin-right: -24px; padding-left: 24px; padding-right: 24px;'

    const imagesGrid = document.createElement('div')
    imagesGrid.style.cssText = \`display: grid; gap: 8px; grid-template-columns: \${post.content.images.length === 1 ? '1fr' : '1fr 1fr'};\`

    post.content.images.forEach((image, index) => {
      const imageContainer = document.createElement('div')
      imageContainer.style.cssText = \`position: relative; width: 100%; overflow: hidden; border-radius: 16px; aspect-ratio: \${post.content.images.length === 1 ? '16/9' : '1'}; border: 1px solid \${theme.border};\`

      const imageEl = document.createElement('img')
      imageEl.src = image
      imageEl.alt = \`Post image \${index + 1}\`
      imageEl.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'

      imageContainer.appendChild(imageEl)
      imagesGrid.appendChild(imageContainer)
    })

    imagesSection.appendChild(imagesGrid)
    card.appendChild(imagesSection)
  }

  // Timestamp section
  ${settings.showDate ? `const timestampSection = document.createElement('div')
  timestampSection.style.cssText = \`padding-top: 12px; border-top: 1px solid \${theme.border};\`

  const timestamp = document.createElement('span')
  const date = new Date(post.timestamp)
  timestamp.textContent = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  timestamp.style.cssText = \`font-size: 14px; color: \${theme.textTertiary};\`

  timestampSection.appendChild(timestamp)
  card.appendChild(timestampSection)` : ''}

  return card
}

// Usage:
// const card = createXPostCard()
// document.body.appendChild(card)`
}

/**
 * Get installation instructions for a format
 */
export function getInstallationInstructions(format: 'react' | 'html' | 'vue' | 'vanilla'): string {
  switch (format) {
    case 'react':
      return `// No installation needed - just copy and paste the code above into your React component`
    case 'html':
      return `// Save the HTML code above as an .html file and open it in your browser`
    case 'vue':
      return `// Copy the component code above into a .vue file in your Vue project`
    case 'vanilla':
      return `// Include the JavaScript code above in your HTML file or as a separate .js file`
    default:
      return ''
  }
}

/**
 * Get API reference data
 */
export function getAPIReference(settings: CardSettings): Array<{ prop: string; type: string; description: string; currentValue: string }> {
  return [
    {
      prop: 'theme',
      type: "'light' | 'dim' | 'dark'",
      description: 'Color theme for the card',
      currentValue: settings.theme,
    },
    {
      prop: 'radius',
      type: 'number (px)',
      description: 'Border radius of the card',
      currentValue: settings.customBorderRadius !== undefined 
        ? `${settings.customBorderRadius}px` 
        : `${settings.borderRadius}px`,
    },
    {
      prop: 'shadow',
      type: "'flat' | 'raised' | 'floating' | 'elevated'",
      description: 'Shadow intensity',
      currentValue: settings.shadowIntensity,
    },
    {
      prop: 'width',
      type: 'number (px)',
      description: 'Card width',
      currentValue: `${settings.cardWidth}px`,
    },
    {
      prop: 'showDate',
      type: 'boolean',
      description: 'Show/hide timestamp',
      currentValue: settings.showDate ? 'true' : 'false',
    },
  ]
}
