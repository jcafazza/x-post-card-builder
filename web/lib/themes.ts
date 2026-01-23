import { Theme } from '@/types/post'

export const themeConfig = {
  light: {
    bg: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#E6E6E6',
    appBg: '#FAFAFA',
    appText: '#171717',
    headerBg: '#FFFFFF',
    headerBorder: '#E5E5E5',
    headerBorderSubtle: 'rgba(229, 229, 229, 0.25)',
    headerOuterStroke: 'rgba(0, 0, 0, 0.08)',
    imageInnerStroke: 'rgba(0, 0, 0, 0.08)', // Inner stroke for images
    toolbarBg: 'rgba(255, 255, 255, 0.8)',
    buttonBorderDefault: 'rgba(229, 229, 229, 0.9)',
    buttonBorderHover: 'rgba(229, 229, 229, 0.8)',
    // Semantic colors
    error: '#DC2626',
    errorBg: 'rgba(220, 38, 38, 0.08)',
    errorShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
    accent: '#1D9BF0',
    // Focus ring (greyscale)
    focusRing: 'rgba(0, 0, 0, 0.4)',
    // Shadow hierarchy (3 depths)
    shadowShallow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    shadowMedium: '0 2px 8px rgba(0, 0, 0, 0.08)',
    shadowDeep: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  dim: {
    bg: '#15202B',
    textPrimary: '#F2F2F2',
    textSecondary: '#8899A6',
    textTertiary: '#6E767D',
    border: '#38444D',
    appBg: '#10171E',
    appText: '#F7F9F9',
    headerBg: '#15202B',
    headerBorder: '#38444D',
    headerBorderSubtle: 'rgba(56, 68, 77, 0.25)',
    headerOuterStroke: 'rgba(255, 255, 255, 0.08)',
    imageInnerStroke: 'rgba(255, 255, 255, 0.08)', // Inner stroke for images
    toolbarBg: 'rgba(21, 32, 43, 0.8)',
    buttonBorderDefault: 'rgba(56, 68, 77, 0.4)',
    buttonBorderHover: 'rgba(56, 68, 77, 0.8)',
    // Semantic colors
    error: '#F87171',
    errorBg: 'rgba(248, 113, 113, 0.12)',
    errorShadow: '0 4px 12px rgba(248, 113, 113, 0.2)',
    accent: '#1D9BF0',
    // Focus ring (greyscale)
    focusRing: 'rgba(255, 255, 255, 0.4)',
    // Shadow hierarchy (3 depths)
    shadowShallow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    shadowMedium: '0 2px 8px rgba(0, 0, 0, 0.25)',
    shadowDeep: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  dark: {
    bg: '#000000',
    textPrimary: '#FFFFFF',
    textSecondary: '#71767B',
    textTertiary: '#71767B',
    border: '#2F3336',
    appBg: '#0A0A0A',
    appText: '#E7E9EA',
    headerBg: '#000000',
    headerBorder: '#2F3336',
    headerBorderSubtle: 'rgba(47, 51, 54, 0.25)',
    headerOuterStroke: 'rgba(255, 255, 255, 0.08)',
    imageInnerStroke: 'rgba(255, 255, 255, 0.08)', // Inner stroke for images
    toolbarBg: 'rgba(0, 0, 0, 0.8)',
    buttonBorderDefault: 'rgba(47, 51, 54, 0.4)',
    buttonBorderHover: 'rgba(47, 51, 54, 0.8)',
    // Semantic colors
    error: '#F87171',
    errorBg: 'rgba(248, 113, 113, 0.12)',
    errorShadow: '0 4px 12px rgba(248, 113, 113, 0.2)',
    accent: '#1D9BF0',
    // Focus ring (greyscale)
    focusRing: 'rgba(255, 255, 255, 0.4)',
    // Shadow hierarchy (3 depths)
    shadowShallow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    shadowMedium: '0 2px 8px rgba(0, 0, 0, 0.35)',
    shadowDeep: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
}

export function getThemeStyles(theme: Theme) {
  return themeConfig[theme]
}
