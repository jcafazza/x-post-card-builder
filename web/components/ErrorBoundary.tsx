'use client'

import { Component, ReactNode } from 'react'
import { getThemeStyles } from '@/lib/themes'
import { ANIMATION_DELIBERATE, EASING_ELEGANT } from '@/constants/ui'

interface ErrorBoundaryProps {
  children: ReactNode
  theme?: 'light' | 'dim' | 'dark'
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component to catch React errors and display a fallback UI.
 * 
 * Prevents the entire app from crashing when a component throws an error.
 * Displays a user-friendly error message instead.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary theme="light">
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      const theme = getThemeStyles(this.props.theme || 'light')
      
      return (
        <div
          className="flex flex-col items-center justify-center p-8 rounded-lg border"
          style={{
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.textPrimary,
            transition: `background-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, border-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}, color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
          }}
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
            Something went wrong
          </h2>
          <p className="text-sm mb-4 text-center" style={{ color: theme.textSecondary }}>
            {process.env.NODE_ENV === 'development' && this.state.error
              ? this.state.error.message
              : 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              transition: `background-color ${ANIMATION_DELIBERATE}ms ${EASING_ELEGANT}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
