// Main component and default API URL (for reference or custom tooling)
export { XCard, DEFAULT_API_URL } from './XCard'

// Sub-components for advanced usage
export { PostCard, PostCardSkeleton } from './PostCard'

// Theme utilities
export { getThemeStyles, getShadowForIntensity, themeConfig } from './themes'

// Types
export type {
  XCardProps,
  PostData,
  Author,
  Content,
  Theme,
  ShadowIntensity,
  ThemeStyles,
} from './types'
