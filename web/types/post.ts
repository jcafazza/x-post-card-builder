export interface Author {
  name: string
  handle: string
  avatar: string
  verified: boolean
}

export interface Content {
  text: string
  images: string[]
}

export interface PostData {
  author: Author
  content: Content
  timestamp: string
}

export type Theme = 'light' | 'dim' | 'dark'
export type BorderRadius = '0' | '8' | '16' | '20' | '24'
export type ShadowIntensity = 'flat' | 'raised' | 'floating' | 'elevated'

export const THEMES: Theme[] = ['light', 'dim', 'dark']
export const SHADOW_INTENSITIES: ShadowIntensity[] = ['flat', 'raised', 'floating', 'elevated']

export function isTheme(value: string | null): value is Theme {
  return THEMES.includes(value as Theme)
}

export function isShadow(value: string | null): value is ShadowIntensity {
  return SHADOW_INTENSITIES.includes(value as ShadowIntensity)
}

/**
 * Theme styles object returned by getThemeStyles()
 * Contains all color values for a given theme
 */
export interface ThemeStyles {
  bg: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  border: string
  appBg: string
  appText: string
  headerBg: string
  headerBorder: string
  headerBorderSubtle: string
  headerOuterStroke: string
  imageInnerStroke: string
  toolbarBg: string
  buttonBorderDefault: string
  buttonBorderHover: string
  // Semantic colors
  error: string
  errorBg: string
  errorShadow: string
  accent: string
  // Focus ring (greyscale)
  focusRing: string
  // Shadow hierarchy (3 depths)
  shadowShallow: string
  shadowMedium: string
  shadowDeep: string
}

export interface CardSettings {
  theme: Theme
  borderRadius: BorderRadius
  shadowIntensity: ShadowIntensity
  showDate: boolean
  cardWidth: number
  customBorderRadius: number
}
