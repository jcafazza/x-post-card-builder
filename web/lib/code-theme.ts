/**
 * Token types for syntax highlighting.
 * CodeBlock uses these with theme.accent and theme.textPrimary for coloring.
 */
export type CodeTokenType = 'keyword' | 'string' | 'number' | 'attribute' | 'type' | 'property' | 'comment' | 'punctuation'

export interface CodeSegment {
  start: number
  end: number
  type: CodeTokenType
  text: string
}

/**
 * Tokenizes snippet text into segments for syntax highlighting.
 * Handles: keywords, strings (single/double), numbers, JSX tags, prop names.
 */
export function tokenizeSnippet(text: string): CodeSegment[] {
  const segments: CodeSegment[] = []
  const keywords = /\b(import|from|function|return|npm|install)\b/g
  const componentNames = /\b(XCard|MyComponent)\b/g
  const propNames = /\b(url|theme|shadow|width|radius)\b/g
  const doubleStrings = /"([^"]*)"/g
  const singleStrings = /'([^']*)'/g
  const numbers = /\b(\d+)\b/g

  type Match = { start: number; end: number; type: CodeTokenType; text: string }
  const matches: Match[] = []

  let m
  while ((m = keywords.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, type: 'keyword', text: m[0] })
  }
  while ((m = componentNames.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, type: 'type', text: m[0] })
  }
  while ((m = propNames.exec(text)) !== null) {
    // Only color as property if it looks like a prop (e.g. url= or "url")
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 2)
    if (after.startsWith('=') || after.startsWith('"')) {
      matches.push({ start: m.index, end: m.index + m[0].length, type: 'attribute', text: m[0] })
    }
  }
  while ((m = doubleStrings.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, type: 'string', text: m[0] })
  }
  while ((m = singleStrings.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, type: 'string', text: m[0] })
  }
  while ((m = numbers.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, type: 'number', text: m[0] })
  }

  // Sort by start; drop any match that overlaps an earlier one
  matches.sort((a, b) => a.start - b.start)
  const merged: Match[] = []
  for (const match of matches) {
    const overlaps = merged.some((existing) => match.start < existing.end && match.end > existing.start)
    if (!overlaps) merged.push(match)
  }

  // Build segments: fill gaps with 'punctuation' (default)
  let pos = 0
  merged.sort((a, b) => a.start - b.start)
  for (const match of merged) {
    if (match.start > pos) {
      segments.push({
        start: pos,
        end: match.start,
        type: 'punctuation',
        text: text.slice(pos, match.start),
      })
    }
    segments.push({
      start: match.start,
      end: match.end,
      type: match.type,
      text: match.text,
    })
    pos = match.end
  }
  if (pos < text.length) {
    segments.push({
      start: pos,
      end: text.length,
      type: 'punctuation',
      text: text.slice(pos),
    })
  }

  return segments.length > 0 ? segments : [{ start: 0, end: text.length, type: 'punctuation', text }]
}
