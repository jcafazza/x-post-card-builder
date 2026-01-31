'use client'

import { ThemeStyles } from '@/types/post'
import { tokenizeSnippet } from '@/lib/code-theme'
import { THEME_TRANSITION } from '@/constants/ui'

interface CodeBlockProps {
  code: string
  showLineNumbers?: boolean
  theme: ThemeStyles
  className?: string
}

/**
 * Code block styled with app theme only. Uses theme.appBg, theme.border,
 * theme.textPrimary / textSecondary / accent — no custom code palette.
 */
export default function CodeBlock({
  code,
  showLineNumbers = true,
  theme,
  className = '',
}: CodeBlockProps) {
  const lines = code.split('\n')

  const tokenColor = (type: string) => {
    switch (type) {
      case 'keyword':
      case 'number':
        return theme.accent
      default:
        return theme.textPrimary
    }
  }

  return (
    <div
      className={`rounded-lg overflow-hidden border text-xs overflow-x-auto ${className}`}
      style={{
        backgroundColor: theme.appBg,
        borderColor: theme.border,
        lineHeight: 1.6,
        transition: THEME_TRANSITION,
      }}
    >
      <div className="flex min-w-0 font-mono">
        {showLineNumbers && (
          <div
            className="shrink-0 py-3 pr-3 pl-4 select-none text-right border-r"
            style={{
              backgroundColor: theme.appBg,
              color: theme.textTertiary,
              borderColor: theme.border,
              minWidth: '2.5rem',
              transition: THEME_TRANSITION,
            }}
          >
            {lines.map((_, i) => (
              <div key={i} className="leading-[1.6]">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <pre
          className={`py-3 whitespace-pre flex-1 min-w-0 ${showLineNumbers ? 'pr-4 pl-3' : 'px-4'}`}
          style={{
            backgroundColor: theme.appBg,
            color: theme.textPrimary,
            transition: THEME_TRANSITION,
          }}
        >
          <code>
            {lines.map((line, lineIndex) => {
              const segments = tokenizeSnippet(line)
              return (
                <div key={lineIndex} className="leading-[1.6]">
                  {segments.map((seg, i) => (
                    <span
                      key={i}
                      style={{
                        color: tokenColor(seg.type),
                        transition: THEME_TRANSITION,
                      }}
                    >
                      {seg.text}
                    </span>
                  ))}
                </div>
              )
            })}
          </code>
        </pre>
      </div>
    </div>
  )
}
