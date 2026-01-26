import { PostData } from '@/types/post'

/**
 * Fetches post data from the server-side scraping API.
 * 
 * @param url - The X (Twitter) post URL to scrape (e.g., "https://x.com/username/status/123456")
 * @returns Promise that resolves to PostData containing author, content, and timestamp
 * @throws Error with user-friendly 2-word message if scraping fails
 * 
 * @example
 * ```ts
 * try {
 *   const post = await fetchPostData('https://x.com/elonmusk/status/123456')
 *   console.log(post.author.name) // "Elon Musk"
 * } catch (error) {
 *   console.error(error.message) // "Load failed" or "Invalid URL"
 * }
 * ```
 */
export async function fetchPostData(url: string): Promise<PostData> {
  const response = await fetch('/api/scrape-post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    try {
      const error = await response.json()
      // API returns normalized 2-word errors; pass through
      throw new Error(error.error || 'Load failed')
    } catch (e) {
      // If response isn't JSON, use generic 2-word message
      if (e instanceof Error && !e.message.includes('Load failed')) {
        throw e
      }
      throw new Error('Load failed')
    }
  }

  return response.json()
}
