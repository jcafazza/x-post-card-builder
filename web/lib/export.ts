import html2canvas from 'html2canvas'

/**
 * Export Configuration Constants
 * 
 * EXPORT_SCALE: Multiplier for export resolution (2x = retina quality)
 * EXPORT_MIME_TYPE: Output image format
 * EXPORT_TIMEOUT_MS: Maximum time allowed for export operation
 *                   Prevents indefinite hangs on complex/large cards
 */
const EXPORT_SCALE = 2
const EXPORT_MIME_TYPE = 'image/png' as const
const EXPORT_TIMEOUT_MS = 15000

/**
 * Wraps a promise with a timeout mechanism.
 * 
 * Prevents indefinite hangs by rejecting if the operation doesn't complete
 * within the specified duration. Useful for async operations that may stall.
 * 
 * @param promise - The promise to wrap with timeout protection
 * @param ms - Timeout duration in milliseconds
 * @param message - Error message to throw on timeout
 * @returns Promise that resolves/rejects based on wrapped promise or timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout])
}

/**
 * Exports an element to PNG with transparent background, trimmed to exact card edges.
 * Shadows are omitted from the export.
 * 
 * @param elementId - The ID of the element to export
 * @param filename - The filename for the downloaded PNG (default: 'x-post-card.png')
 * @returns Promise that resolves when export completes
 * @throws Error if element not found, export fails, or blob creation fails
 */
export async function exportElementToPNG(
  elementId: string,
  filename: string = 'x-post-card.png'
): Promise<void> {
  const element = document.getElementById(elementId)

  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  // Get actual rendered dimensions (respects user's custom width)
  const rect = element.getBoundingClientRect()
  
  // Create a wrapper container positioned off-screen but visible
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = `${window.innerWidth + 2000}px`
  wrapper.style.top = '100px'
  wrapper.style.padding = '0'
  wrapper.style.margin = '0'
  wrapper.style.overflow = 'visible'
  wrapper.style.backgroundColor = 'transparent'
  wrapper.style.zIndex = '999999'
  wrapper.style.width = 'auto'
  wrapper.style.height = 'auto'
  wrapper.style.visibility = 'visible'
  wrapper.style.opacity = '1'
  wrapper.style.display = 'block'
  
  // Clone the element deeply to preserve all content, structure, and classes
  const clonedElement = element.cloneNode(true) as HTMLElement
  clonedElement.id = `${element.id}-export-clone`
  
  // Preserve the exact width from the original (respects user's custom width)
  clonedElement.style.width = `${rect.width}px`
  clonedElement.style.height = 'auto' // Allow natural height to prevent clipping
  clonedElement.style.margin = '0'
  clonedElement.style.position = 'relative'
  clonedElement.style.overflow = 'visible'
  clonedElement.style.maxHeight = 'none' // Remove any maxHeight constraints
  
  // Remove box-shadow from the clone (omit shadows from export)
  clonedElement.style.boxShadow = 'none'
  
  // Remove truncate classes that might clip text in export
  const textElements = clonedElement.querySelectorAll('.truncate')
  textElements.forEach((el) => {
    el.classList.remove('truncate')
    el.classList.add('whitespace-normal', 'break-words')
  })
  
  // Remove overflow-hidden classes and maxHeight constraints that might clip content
  const overflowElements = clonedElement.querySelectorAll('.overflow-hidden')
  overflowElements.forEach((el) => {
    const elHtml = el as HTMLElement
    elHtml.classList.remove('overflow-hidden')
    elHtml.style.overflow = 'visible'
    // Remove maxHeight constraints that might clip content
    const computedStyle = window.getComputedStyle(elHtml)
    if (computedStyle.maxHeight && computedStyle.maxHeight !== 'none') {
      elHtml.style.maxHeight = 'none'
    }
  })
  
  // Append clone to wrapper and wrapper to body
  wrapper.appendChild(clonedElement)
  document.body.appendChild(wrapper)
  
  // Force a layout recalculation
  void wrapper.offsetHeight
  
  // Wait for layout to settle
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })

  try {
    // Generate canvas from cloned element - trimmed to exact card edges
    // No padding, no shadows - just the card itself
    // Wrapped with timeout to prevent indefinite hangs
    const canvas = await withTimeout(
      html2canvas(clonedElement, {
      backgroundColor: null, // Transparent background
      scale: EXPORT_SCALE, // 2x resolution
      logging: false,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      removeContainer: true,
      imageTimeout: 15000,
      onclone: (clonedDoc, clonedEl) => {
        // Ensure the cloned element has no shadow and no clipping
        const cloned = clonedEl as HTMLElement
        if (cloned) {
          cloned.style.boxShadow = 'none'
          cloned.style.overflow = 'visible'
          cloned.style.width = `${rect.width}px`
          cloned.style.height = 'auto' // Allow natural height
          
          // Process all descendants to remove shadows and clipping
          const allDescendants = cloned.querySelectorAll('*')
          allDescendants.forEach((desc) => {
            const descEl = desc as HTMLElement
            if (descEl.style) {
              // Remove shadows
              descEl.style.boxShadow = 'none'
              
              // Remove overflow constraints
              if (descEl.classList.contains('overflow-hidden')) {
                descEl.classList.remove('overflow-hidden')
              }
              descEl.style.overflow = 'visible'
              
              // Remove maxHeight constraints that might clip content
              const computedMaxHeight = window.getComputedStyle(descEl).maxHeight
              if (computedMaxHeight && computedMaxHeight !== 'none' && computedMaxHeight !== '100%') {
                descEl.style.maxHeight = 'none'
              }
              
              // Remove height constraints if they're causing clipping
              const computedHeight = window.getComputedStyle(descEl).height
              if (computedHeight === '0px') {
                descEl.style.height = 'auto'
              }
            }
          })
        }
      },
    }),
      EXPORT_TIMEOUT_MS,
      'Export timed out. The image may be too complex or large.'
    )

    // Convert to blob with proper error handling
    return new Promise<void>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          try {
            if (!blob) {
              reject(new Error('Failed to generate image blob'))
              return
            }

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.download = filename
            link.href = url
            link.click()

            // Cleanup
            URL.revokeObjectURL(url)
            resolve()
          } catch (error) {
            reject(error instanceof Error ? error : new Error('Failed to download image'))
          }
        },
        EXPORT_MIME_TYPE
      )
    })
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('Failed to export element to PNG')
  } finally {
    // Always clean up the hidden wrapper, even if export fails
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper)
    }
  }
}
