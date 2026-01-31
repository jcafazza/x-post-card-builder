import html2canvas from 'html2canvas'

/** Export: 2x scale (retina), timeouts to avoid hangs. */
const EXPORT_SCALE = 2
const EXPORT_MIME_TYPE = 'image/png' as const
const EXPORT_TIMEOUT_MS = 15000
const IMAGE_LOAD_TIMEOUT_MS = 10000

/** Styles we re-apply on the clone so html2canvas output matches the live card. */
interface CapturedStyles {
  borderRadius: string
  boxShadow: string
  backgroundColor: string
  borderWidth: string
  borderStyle: string
  borderColor: string
}

function captureComputedStyles(element: HTMLElement): CapturedStyles {
  const computed = window.getComputedStyle(element)
  return {
    borderRadius: computed.borderRadius,
    boxShadow: computed.boxShadow,
    backgroundColor: computed.backgroundColor,
    borderWidth: computed.borderWidth,
    borderStyle: computed.borderStyle,
    borderColor: computed.borderColor,
  }
}

/** Resolves when all img elements in the subtree have loaded or errored (with timeout). */
function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'))
  if (images.length === 0) return Promise.resolve()
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          let timeoutId: ReturnType<typeof setTimeout> | null = null
          const onLoad = () => done()
          const done = () => {
            if (timeoutId != null) {
              clearTimeout(timeoutId)
              timeoutId = null
            }
            img.removeEventListener('load', onLoad)
            img.removeEventListener('error', onLoad)
            resolve()
          }
          img.addEventListener('load', onLoad)
          img.addEventListener('error', onLoad)
          timeoutId = setTimeout(done, IMAGE_LOAD_TIMEOUT_MS)
        })
    )
  ).then(() => {})
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

/**
 * Prepares the clone for html2canvas: author table layout, post images as background (object-fit workaround), preserve card/inset styles.
 */
function prepareCloneForCapture(
  cloned: HTMLElement,
  cardWidthPx: number,
  originalStyles: CapturedStyles
): void {
  cloned.style.overflow = 'visible'
  cloned.style.width = `${cardWidthPx}px`
  cloned.style.height = 'auto'
  cloned.style.borderRadius = originalStyles.borderRadius
  cloned.style.boxShadow = originalStyles.boxShadow
  cloned.style.backgroundColor = originalStyles.backgroundColor
  cloned.style.borderWidth = originalStyles.borderWidth
  cloned.style.borderStyle = originalStyles.borderStyle
  cloned.style.borderColor = originalStyles.borderColor

  // Author: table layout so html2canvas respects vertical alignment
  const authorSection = cloned.querySelector('[data-export="author-section"]') as HTMLElement | null
  if (authorSection) {
    authorSection.style.display = 'table'
    authorSection.style.width = '100%'
    authorSection.style.tableLayout = 'fixed'
    const avatarDiv = authorSection.querySelector('[data-export="author-avatar"]') as HTMLElement | null
    if (avatarDiv) {
      avatarDiv.style.display = 'table-cell'
      avatarDiv.style.verticalAlign = 'middle'
      avatarDiv.style.width = '48px'
      avatarDiv.style.height = '48px'
    }
    const textBlock = authorSection.querySelector('[data-export="author-text-block"]') as HTMLElement | null
    if (textBlock) {
      textBlock.style.display = 'table-cell'
      textBlock.style.verticalAlign = 'middle'
      textBlock.style.paddingLeft = '12px'
    }
  }

  // Post images: use background-image so aspect ratio is preserved (html2canvas ignores object-fit)
  const safeUrlScheme = (src: string) =>
    src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')
  const postImageContainers = cloned.querySelectorAll('[data-export="post-image-container"]')
  postImageContainers.forEach((container) => {
    const c = container as HTMLElement
    c.style.overflow = 'hidden'
    c.style.maxHeight = 'none'
    const img = c.querySelector('img') as HTMLImageElement | null
    if (img?.src && safeUrlScheme(img.src)) {
      c.style.backgroundImage = `url(${img.src})`
      c.style.backgroundSize = 'cover'
      c.style.backgroundPosition = 'center'
      img.style.display = 'none'
    }
  })
}

/**
 * Exports the card element to PNG. Waits for fonts/images, captures styles, clones off-screen, runs html2canvas, restores scroll, downloads.
 */
export async function exportElementToPNG(
  elementId: string,
  filename: string = 'x-post-card-visualizer.png'
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  const rect = element.getBoundingClientRect()
  const originalScrollX = window.scrollX
  const originalScrollY = window.scrollY

  const originalStyles = captureComputedStyles(element)
  await document.fonts.ready
  await waitForImages(element as HTMLElement)
  window.scrollTo(0, 0)
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

  // Clone off-screen so we can modify without affecting the visible page
  const wrapper = document.createElement('div')
  Object.assign(wrapper.style, {
    position: 'fixed',
    left: `${window.innerWidth + 2000}px`,
    top: '100px',
    padding: '0',
    margin: '0',
    overflow: 'visible',
    backgroundColor: 'transparent',
    zIndex: '999999',
    visibility: 'visible',
    opacity: '1',
  })

  const clone = element.cloneNode(true) as HTMLElement
  clone.id = `${element.id}-export-clone`
  Object.assign(clone.style, {
    width: `${rect.width}px`,
    height: 'auto',
    margin: '0',
    position: 'relative',
    overflow: 'visible',
    maxHeight: 'none',
  })

  clone.querySelectorAll('.truncate').forEach((el) => {
    el.classList.remove('truncate')
    el.classList.add('whitespace-normal', 'break-words')
  })

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  await waitForImages(clone)
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  try {
    const canvas = await withTimeout(
      html2canvas(clone, {
        backgroundColor: null,
        scale: EXPORT_SCALE,
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        removeContainer: true,
        imageTimeout: IMAGE_LOAD_TIMEOUT_MS,
        scrollX: 0,
        scrollY: 0,
        onclone: (_doc, clonedEl) => {
          prepareCloneForCapture(clonedEl as HTMLElement, rect.width, originalStyles)
        },
      }),
      EXPORT_TIMEOUT_MS,
      'Export timed out. The image may be too complex or large.'
    )

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
            URL.revokeObjectURL(url)
            resolve()
          } catch (e) {
            reject(e instanceof Error ? e : new Error('Failed to download image'))
          }
        },
        EXPORT_MIME_TYPE,
        1.0
      )
    })
  } finally {
    window.scrollTo(originalScrollX, originalScrollY)
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper)
    }
  }
}
