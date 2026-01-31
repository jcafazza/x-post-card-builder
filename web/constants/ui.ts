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

/** Theme transition: use same duration + easing everywhere so theme changes feel unified */
export const THEME_TRANSITION_MS = ANIMATION_DELIBERATE

/** Extended animations: Page entrances, value indicators */
export const ANIMATION_EXTENDED = 1000

/** Duration for successful "Imported" state feedback */
export const SUCCESS_STATE_DURATION = 800

/** Minimum time to show loading state on share page (ms) */
export const SHARE_LOADING_MIN_MS = 1500

/** Share page phase 2: delay after card lands (ms). Must match .share-card-entrance duration in app/globals.css. */
export const SHARE_PHASE2_DELAY_MS = 2800

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

/** Single transition string for theme-driven properties; use everywhere for identical timing so theme changes feel unified. */
export const THEME_TRANSITION = `background-color ${THEME_TRANSITION_MS}ms ${EASING_ELEGANT}, color ${THEME_TRANSITION_MS}ms ${EASING_ELEGANT}, border-color ${THEME_TRANSITION_MS}ms ${EASING_ELEGANT}, opacity ${THEME_TRANSITION_MS}ms ${EASING_ELEGANT}, filter ${THEME_TRANSITION_MS}ms ${EASING_ELEGANT}, box-shadow ${THEME_TRANSITION_MS}ms ${EASING_ELEGANT}`

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

/** Padding for input button (right side) in pixels */
export const INPUT_BUTTON_PADDING_RIGHT = 58

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

/** Extra padding below card/button so they can scroll fully behind the footer on small viewports. Used with FOOTER_FADE_HEIGHT. */
export const FOOTER_SCROLL_CLEAR_EXTRA = 64

/** Padding around modal content (matches Tailwind p-6). Used for left/right and bottom edge spacing. */
export const MODAL_CONTENT_PADDING = 24

/** Small spacing (matches Tailwind p-3 / space-3). Used for modal content top extra, tight gaps. */
export const SPACING_SMALL = 12
