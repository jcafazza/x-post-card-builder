import { PostData } from '@/types/post'

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api/scrape-post'

export async function fetchPostData(url: string): Promise<PostData> {
  const response = await fetch(API_ENDPOINT, {
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
      // If response isn't JSON, throw a generic error with status code
      if (e instanceof Error && e.message.startsWith('HTTP')) {
        throw e
      }
      throw new Error(`Failed to fetch post data (${response.status})`)
    }
  }

  return response.json()
}
