/**
 * Utility functions for formatting and data manipulation.
 * 
 * @module lib/utils
 */

/**
 * Converts a hex color to rgba with the given opacity.
 * Handles #RGB and #RRGGBB formats.
 */
export function hexToRgba(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#')) return hex || '#000000'
  let r: number, g: number, b: number
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16)
    g = parseInt(hex.slice(3, 5), 16)
    b = parseInt(hex.slice(5, 7), 16)
  } else {
    return hex
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Formats an ISO timestamp into a human-readable date and time string.
 * Example: "Jan 22, 2026, 4:37 PM"
 * 
 * @param timestamp - ISO 8601 date string
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    // Fix hydration mismatches: server and browser may be in different timezones.
    // Using a fixed timezone makes the rendered string deterministic.
    timeZone: 'UTC',
  }).format(date)
}

import { BorderRadius } from '@/types/post'

const VALID_RADII: BorderRadius[] = ['0', '8', '16', '20', '24']

/**
 * Type guard to ensure a value is a valid BorderRadius.
 * Validates against our semantic radius scale (0, 8, 16, 20, 24).
 * 
 * @param value - The value to check
 * @returns True if value is a valid BorderRadius, false otherwise
 * 
 * @example
 * ```ts
 * if (isBorderRadius('20')) {
 *   // TypeScript knows value is BorderRadius here
 *   setRadius(value) // OK
 * }
 * ```
 */
export function isBorderRadius(value: any): value is BorderRadius {
  return VALID_RADII.includes(value)
}
