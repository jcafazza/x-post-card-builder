/**
 * Card Dimension and Interaction Constants
 * 
 * Standard values for the post card's physical properties and 
 * interactive boundaries.
 */

/** Minimum allowed width for the card in pixels */
export const CARD_MIN_WIDTH = 350

/** Maximum allowed width for the card in pixels */
export const CARD_MAX_WIDTH = 700

/** Default card width when initialized or reset */
export const CARD_DEFAULT_WIDTH = 500

/** Default border radius for the card in pixels */
export const CARD_DEFAULT_RADIUS = 20

/** Maximum allowed border radius for the card in pixels */
export const CARD_MAX_RADIUS = 48

/** The size of the interactive "hit zone" for corner resizing in pixels */
export const CARD_CORNER_ZONE = 24

/** Length of the resize handles in pixels */
export const CARD_HANDLE_LENGTH = 12

/** Maximum overshoot distance for rubberband effect when dragging beyond max width (in pixels) */
export const RUBBERBAND_MAX_OVERSHOOT = 30

/** Spacing below the card for the "View original post" button (in pixels) */
export const CARD_BOTTOM_MARGIN = 20
