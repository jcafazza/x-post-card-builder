/**
 * Utility functions for formatting and data manipulation.
 * 
 * @module lib/utils
 */

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
