import { CardSettings } from '@/types/post'

const PLACEHOLDER_URL = 'https://x.com/username/status/123'

/**
 * Escapes a string for safe interpolation inside a double-quoted JavaScript string.
 * Prevents broken or injected code when the snippet is pasted elsewhere.
 */
function escapeForDoubleQuotedJS(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/**
 * Builds the embed snippet for the x-post-card-visualizer NPM package using current settings.
 * All interpolated strings are escaped so the generated code is always valid and safe to paste.
 */
export function buildSnippet(settings: CardSettings, sourceUrl: string | null): string {
  const url = sourceUrl ?? PLACEHOLDER_URL
  const radius = settings.customBorderRadius ?? parseInt(settings.borderRadius, 10)

  return `npm install x-post-card-visualizer
import { XCard } from 'x-post-card-visualizer'

function MyComponent() {
  return (
    <XCard
      url="${escapeForDoubleQuotedJS(url)}"
      theme="${escapeForDoubleQuotedJS(settings.theme)}"
      shadow="${escapeForDoubleQuotedJS(settings.shadowIntensity)}"
      width={${settings.cardWidth}}
      radius={${radius}}
    />
  )
}`
}
