import { PostData } from '@/types/post'

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
      throw new Error(error.error || `HTTP ${response.status}`)
    } catch (e) {
      // If response isn't JSON, try to surface a useful message.
      try {
        const text = await response.text()
        if (text) {
          throw new Error(`Failed to fetch post data (${response.status})`)
        }
      } catch {
        // ignore
      }

      // Fallback: generic error with status code
      if (e instanceof Error && e.message.startsWith('HTTP')) {
        throw e
      }
      throw new Error(`Failed to fetch post data (${response.status})`)
    }
  }

  return response.json()
}
