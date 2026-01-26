/**
 * UI Animation and Interaction Constants
 *
 * A unified animation framework that creates cohesive, intentional motion
 * throughout the application. Each timing tier serves a specific purpose
 * in the interaction hierarchy.
 *
 * TEMPORAL HIERARCHY
 * ──────────────────
 * Micro (300ms)     → Instant feedback, button presses, hover states
 * Standard (500ms)  → Common state changes, color transitions
 * Deliberate (600ms)→ Layout shifts, resize operations, theme changes
 * Extended (1000ms) → Page entrances, major value indicators
 *
 * EASING CURVES
 * ─────────────
 * Standard  → Default for most interactions (ease-out)
 *             Use for: hover states, border color changes, general transitions
 * 
 * Elegant   → Theme transitions, cinematic color shifts
 *             Use for: background color changes, theme switches, major color transitions
 *             Creates a buttery smooth, premium feel
 * 
 * Bounce    → Playful press feedback (use sparingly)
 *             Use for: button press animations only
 *             Adds personality without being distracting
 */

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION DURATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Micro-interactions: Button clicks, hovers, instant feedback */
export const ANIMATION_MICRO = 300

/** Standard transitions: State changes, common interactions */
export const ANIMATION_STANDARD = 500

/** Deliberate transitions: Layout changes, card resizing, theme shifts */
export const ANIMATION_DELIBERATE = 600

/** Extended animations: Page entrances, value indicators */
export const ANIMATION_EXTENDED = 1000

/** Duration for successful "Imported" state feedback */
export const SUCCESS_STATE_DURATION = 800

// ─────────────────────────────────────────────────────────────────────────────
// EASING CURVES
// ─────────────────────────────────────────────────────────────────────────────

/** Standard easing - natural deceleration for most animations */
export const EASING_STANDARD = 'ease-out'

/**
 * Elegant easing for color/theme transitions.
 * A gentle, cinematic curve with gradual acceleration and deceleration.
 * Creates a buttery smooth feel for background and color changes.
 */
export const EASING_ELEGANT = 'cubic-bezier(0.45, 0, 0.15, 1)'

/**
 * Bounce easing for playful press feedback.
 * Use sparingly - only for button presses where personality is desired.
 */
export const EASING_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

// ─────────────────────────────────────────────────────────────────────────────
// UI TIMING
// ─────────────────────────────────────────────────────────────────────────────

/** Duration for error messages before auto-hiding */
export const ERROR_MESSAGE_DISPLAY_DURATION = 5000

/** Duration for tooltips before auto-hiding */
export const TOOLTIP_DISPLAY_DURATION = 1500

// ─────────────────────────────────────────────────────────────────────────────
// ENTRANCE ANIMATION DELAYS
// Staggered sequence creates an elegant page load choreography
// ─────────────────────────────────────────────────────────────────────────────

export const ENTRANCE_DELAY_HEADER = 0
export const ENTRANCE_DELAY_TOOLBAR = 200
export const ENTRANCE_DELAY_CARD = 400

// ─────────────────────────────────────────────────────────────────────────────
// SPACING CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Standard button size for touch targets (WCAG minimum: 44x44px) */
export const BUTTON_SIZE = 44

/** Padding for input button (right side) in pixels */
export const INPUT_BUTTON_PADDING_RIGHT = 65

/** Top padding for main content area below header (in pixels) */
export const HEADER_CONTENT_PADDING_TOP = 148

/** Spacing between header input and toolbar (in pixels) */
export const CONTENT_VERTICAL_SPACING = 40

/** Spacing between toolbar and card preview (in pixels) */
export const TOOLBAR_CARD_SPACING = 20

/** Height of footer fade gradient (in pixels) */
export const FOOTER_FADE_HEIGHT = 120

/** Fade zone distance for toolbar scroll fade (in pixels) */
export const TOOLBAR_FADE_ZONE = 80

/** Footer fade opacity at bottom (0-1) */
export const FOOTER_FADE_OPACITY = 0.9

/** Footer fade gradient stop position (0-1, where 0.25 = 75% from top) */
export const FOOTER_FADE_STOP = 0.25
