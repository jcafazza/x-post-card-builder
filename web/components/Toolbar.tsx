'use client'

import { CardSettings, Theme, ShadowIntensity } from '@/types/post'
import { exportElementToPNG } from '@/lib/export'
import { useState } from 'react'
import { 
  Sun, 
  SunMoon, 
  Moon, 
  Layers2, 
  RotateCcw, 
  Calendar, 
  Download, 
  Loader2 
} from 'lucide-react'

interface ToolbarProps {
  settings: CardSettings
  onSettingsChange: (settings: CardSettings) => void
  currentTheme: any
  onReset: () => void
}

export default function Toolbar({ settings, onSettingsChange, currentTheme, onReset }: ToolbarProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [clickedButton, setClickedButton] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setClickedButton('export')
    setTimeout(() => setClickedButton(null), 200)
    try {
      await exportElementToPNG('card-preview', 'x-post-card.png')
    } catch (error) {
      console.error('Export failed:', error)
      const message = error instanceof Error ? error.message : 'Failed to export PNG'
      setExportError(message)
      // Auto-hide error after 5 seconds
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  const cycleTheme = () => {
    setClickedButton('theme')
    setTimeout(() => setClickedButton(null), 200)
    const themes: Theme[] = ['light', 'dim', 'dark']
    const currentIndex = themes.indexOf(settings.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    onSettingsChange({ ...settings, theme: themes[nextIndex] })
  }

  const cycleShadow = () => {
    setClickedButton('shadow')
    setTimeout(() => setClickedButton(null), 200)
    const intensities: ShadowIntensity[] = ['none', 'light', 'medium', 'strong']
    const currentIndex = intensities.indexOf(settings.shadowIntensity)
    const nextIndex = (currentIndex + 1) % intensities.length
    onSettingsChange({ ...settings, shadowIntensity: intensities[nextIndex] })
  }

  const handleReset = () => {
    setClickedButton('reset')
    setTimeout(() => setClickedButton(null), 200)
    onReset()
  }

  const handleDateToggle = () => {
    setClickedButton('date')
    setTimeout(() => setClickedButton(null), 200)
    onSettingsChange({ ...settings, showDate: !settings.showDate })
  }

  const iconClasses = "w-5 h-5"
  const buttonBase = "w-10 h-10 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border active:scale-95"
  
  const getButtonStyle = (isActive = false) => ({
    backgroundColor: isActive 
      ? (settings.theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)')
      : currentTheme.toolbarBg,
    borderColor: currentTheme.headerBorder,
    color: isActive ? currentTheme.textPrimary : currentTheme.textSecondary,
    transform: clickedButton ? 'scale(0.95)' : 'scale(1)',
    boxShadow: `0 2px 8px rgba(0, 0, 0, ${settings.theme === 'light' ? '0.04' : '0.2'})`,
  })

  return (
    <div className="relative flex items-center gap-3">
      {/* Export Error Message */}
      {exportError && (
        <div
          className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            backgroundColor: currentTheme.bg,
            borderColor: '#EF4444',
            color: '#EF4444',
            boxShadow: `0 4px 12px rgba(239, 68, 68, 0.2)`,
          }}
        >
          {exportError}
        </div>
      )}

      {/* Theme Cycle Button */}
      <button
        onClick={cycleTheme}
        className={`${buttonBase} ${clickedButton === 'theme' ? 'scale-90' : ''}`}
        style={getButtonStyle(true)}
        aria-label="Cycle Theme"
      >
        {settings.theme === 'light' && <Sun className={iconClasses} strokeWidth={1.5} />}
        {settings.theme === 'dim' && <SunMoon className={iconClasses} strokeWidth={1.5} />}
        {settings.theme === 'dark' && <Moon className={iconClasses} strokeWidth={1.5} />}
      </button>

      {/* Shadow Cycle Button */}
      <button
        onClick={cycleShadow}
        className={`${buttonBase} ${clickedButton === 'shadow' ? 'scale-90' : ''}`}
        style={getButtonStyle(true)}
        aria-label="Cycle Shadow"
      >
        <Layers2
          className={iconClasses}
          strokeWidth={1.5}
          style={{
            opacity: settings.shadowIntensity === 'none' ? 0.5 : settings.shadowIntensity === 'light' ? 0.75 : 1
          }}
        />
      </button>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className={`${buttonBase} ${clickedButton === 'reset' ? 'scale-90' : ''}`}
        style={getButtonStyle()}
        aria-label="Reset to Default"
      >
        <RotateCcw className={iconClasses} strokeWidth={1.5} />
      </button>

      {/* Display Date Toggle */}
      <button
        onClick={handleDateToggle}
        className={`${buttonBase} ${clickedButton === 'date' ? 'scale-90' : ''}`}
        style={getButtonStyle(settings.showDate)}
        aria-label="Toggle Date"
      >
        <Calendar className={iconClasses} strokeWidth={1.5} />
      </button>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`${buttonBase} ${clickedButton === 'export' ? 'scale-90' : ''}`}
        style={getButtonStyle()}
        aria-label="Download PNG"
      >
        {isExporting ? (
          <Loader2 className={`${iconClasses} animate-spin`} strokeWidth={1.5} />
        ) : (
          <Download className={iconClasses} strokeWidth={1.5} />
        )}
      </button>
    </div>
  )
}