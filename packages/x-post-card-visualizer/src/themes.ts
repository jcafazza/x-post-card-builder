import type { Theme, ThemeStyles, ShadowIntensity } from './types'

/** Theme color configurations */
export const themeConfig: Record<Theme, ThemeStyles> = {
  light: {
    bg: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
    border: '#E6E6E6',
    accent: '#1D9BF0',
    imageInnerStroke: 'rgba(0, 0, 0, 0.08)',
    shadowShallow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    shadowMedium: '0 2px 8px rgba(0, 0, 0, 0.08)',
    shadowDeep: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  dim: {
    bg: '#15202B',
    textPrimary: '#F2F2F2',
    textSecondary: '#8899A6',
    border: '#38444D',
    accent: '#1D9BF0',
    imageInnerStroke: 'rgba(255, 255, 255, 0.08)',
    shadowShallow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    shadowMedium: '0 2px 8px rgba(0, 0, 0, 0.25)',
    shadowDeep: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  dark: {
    bg: '#000000',
    textPrimary: '#FFFFFF',
    textSecondary: '#71767B',
    border: '#2F3336',
    accent: '#1D9BF0',
    imageInnerStroke: 'rgba(255, 255, 255, 0.08)',
    shadowShallow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    shadowMedium: '0 2px 8px rgba(0, 0, 0, 0.35)',
    shadowDeep: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
}

/** Get theme styles for a given theme */
export function getThemeStyles(theme: Theme): ThemeStyles {
  return themeConfig[theme]
}

/** Get the appropriate shadow value for an intensity level */
export function getShadowForIntensity(
  theme: ThemeStyles,
  intensity: ShadowIntensity
): string {
  switch (intensity) {
    case 'flat':
      return 'none'
    case 'raised':
      return theme.shadowShallow
    case 'floating':
      return theme.shadowMedium
    case 'elevated':
      return theme.shadowDeep
    default:
      return theme.shadowMedium
  }
}
