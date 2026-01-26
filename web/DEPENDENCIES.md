# Dependencies

This document explains why each dependency is included in the project.

## Production Dependencies

### Core Framework

- **`next@^15.1.6`** - React framework with App Router, server components, and API routes
  - Used for: Main application framework, routing, server-side rendering
  - Why: Provides built-in API routes, excellent developer experience, optimized production builds

- **`react@^19.0.0`** - UI library
  - Used for: Component architecture
  - Why: Core dependency of Next.js

- **`react-dom@^19.0.0`** - React DOM renderer
  - Used for: Client-side rendering
  - Why: Required by Next.js for React components

### Styling

- **`tailwindcss@^4.0.0`** - Utility-first CSS framework
  - Used for: All styling throughout the application
  - Why: Rapid development, consistent design system, small bundle size

- **`@tailwindcss/postcss@^4.0.0`** - PostCSS plugin for Tailwind
  - Used for: Processing Tailwind CSS
  - Why: Required for Tailwind CSS v4

- **`autoprefixer@^10.4.20`** - PostCSS plugin for vendor prefixes
  - Used for: Automatic vendor prefixing
  - Why: Ensures cross-browser compatibility

- **`postcss@^8.4.49`** - CSS processor
  - Used for: Processing CSS (Tailwind, autoprefixer)
  - Why: Required by Tailwind CSS

### UI Components

- **`@base-ui/react@^1.1.0`** - Unstyled UI primitives
  - Used for: Base component primitives (used by bloom-menu)
  - Why: Dependency of bloom-menu

- **`bloom-menu@^0.1.0`** - Menu component
  - Used for: Dropdown menu in toolbar (theme, shadow, share options)
  - Why: Provides accessible, styled menu component

- **`lucide-react@^0.562.0`** - Icon library
  - Used for: All icons throughout the application
  - Why: Consistent icon set, tree-shakeable, TypeScript support

### Animation

- **`framer-motion@^12.29.0`** - Animation library
  - Used for: Hand icon animation on share page
  - Why: Smooth, performant animations with reduced motion support

### Export

- **`html2canvas@^1.4.1`** - HTML to canvas converter
  - Used for: PNG export functionality
  - Why: Reliable client-side image generation from DOM

### Code Highlighting (Unused - Phase 2)

- **`prism-react-renderer@^2.4.1`** - Syntax highlighting
  - Used for: (Currently unused - planned for Phase 2 "Copy snippet" feature)
  - Why: Will be used to highlight generated code snippets
  - Note: Can be removed if Phase 2 is not planned

### Type Definitions

- **`@types/node@^22.10.5`** - TypeScript types for Node.js
  - Used for: TypeScript support for Node.js APIs in API routes
  - Why: Type safety for server-side code

- **`@types/react@^19.0.6`** - TypeScript types for React
  - Used for: TypeScript support for React
  - Why: Type safety for React components

- **`@types/react-dom@^19.0.2`** - TypeScript types for React DOM
  - Used for: TypeScript support for React DOM
  - Why: Type safety for React DOM APIs

### TypeScript

- **`typescript@^5.7.3`** - TypeScript compiler
  - Used for: Type checking and compilation
  - Why: Type safety, better developer experience, catch errors early

## Development Dependencies

None currently. All dependencies are production dependencies.

## Optional Dependencies

### Vercel CLI (for deployment)

- **`vercel@^50.4.8`** - Vercel deployment CLI
  - Used for: Deploying to Vercel
  - Why: Official deployment tool for Vercel
  - Note: Can be installed globally or as dev dependency

## Package Overrides

These overrides are included to resolve dependency conflicts:

- **`path-to-regexp@^6.3.0`** - URL path matching
  - Why: Resolves Next.js dependency conflicts

- **`undici@^6.22.1`** - HTTP client
  - Why: Resolves Node.js fetch implementation conflicts

- **`tar@^7.5.4`** - Tarball utilities
  - Why: Security updates for nested dependencies

## Bundle Size Considerations

### Large Dependencies

- **`framer-motion`** (~50KB gzipped) - Only used for one animation
  - Consider: Replacing with CSS animations if bundle size is a concern
  - Current: Kept for smooth animation and reduced motion support

- **`html2canvas`** (~100KB gzipped) - Required for PNG export
  - Consider: This is essential functionality, no alternative

### Unused Dependencies

- **`prism-react-renderer`** - Currently unused (Phase 2 feature)
  - Action: Can be removed if Phase 2 is not planned

## Security

All dependencies are regularly updated. Run `npm audit` to check for security vulnerabilities:

```bash
cd web
npm audit
```

## Updating Dependencies

To update dependencies:

```bash
cd web
npm update
```

To update to latest versions (may include breaking changes):

```bash
cd web
npm install package@latest
```

## License Compatibility

All dependencies are compatible with the MIT license of this project.
