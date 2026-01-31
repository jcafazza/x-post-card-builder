/** Author information for a post */
export interface Author {
  name: string
  handle: string
  avatar: string
  verified: boolean
}

/** Content of a post */
export interface Content {
  text: string
  images: string[]
}

/** Complete post data structure */
export interface PostData {
  author: Author
  content: Content
  timestamp: string
}

/** Available color themes */
export type Theme = 'light' | 'dim' | 'dark'

/** Shadow intensity levels */
export type ShadowIntensity = 'flat' | 'raised' | 'floating' | 'elevated'

/** Theme style definitions */
export interface ThemeStyles {
  bg: string
  textPrimary: string
  textSecondary: string
  border: string
  accent: string
  imageInnerStroke: string
  shadowShallow: string
  shadowMedium: string
  shadowDeep: string
}

/** Props for the XCard component */
export interface XCardProps {
  /** The X post URL to display (required) */
  url: string

  /** Color theme (default: 'light') */
  theme?: Theme

  /** Shadow intensity (default: 'floating') */
  shadow?: ShadowIntensity

  /** Card width in pixels (default: 450, range: 350-700) */
  width?: number

  /** Border radius in pixels (default: 20, range: 0-24) */
  radius?: number

  /** API endpoint override (defaults to hosted API) */
  apiUrl?: string

  /** Custom className for the wrapper */
  className?: string

  /** Loading placeholder */
  fallback?: React.ReactNode

  /** Error callback */
  onError?: (error: Error) => void

  /** Load callback with post data */
  onLoad?: (post: PostData) => void
}
