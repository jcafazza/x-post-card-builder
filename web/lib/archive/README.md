# Archived Code

This directory contains code that is not currently used in the application but may be useful for future features.

## codeGenerator.ts

**Status:** Archived (Phase 2 feature - not implemented)

**Purpose:** Code generation functions for React, HTML, Vue, and Vanilla JS components. These were built for the "Copy snippet" feature that is planned for Phase 2.

**Why Archived:**
- The "Copy snippet" button in Toolbar.tsx is currently disabled with "Soon" label
- No imports or references to this file exist in the codebase
- Keeping for future implementation when Phase 2 is ready

**To Re-enable:**
1. Wire up the "Copy snippet" button in `web/components/Toolbar.tsx`
2. Import the appropriate generator function
3. Move this file back to `web/lib/` directory
