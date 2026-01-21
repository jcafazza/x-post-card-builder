/**
 * API Fetcher Component for Framer
 *
 * This is a Framer code override that fetches X post data from your Vercel API
 *
 * HOW TO USE IN FRAMER:
 * 1. Create a new Code Override in Framer
 * 2. Copy this entire file content
 * 3. Apply the override to your URL input field
 * 4. The override will trigger API calls when the URL changes
 * 5. Store the result in Framer variables to display in your card
 */

import { useState, useEffect } from "react"
import type { ComponentType } from "react"

// Replace this with your deployed Vercel API URL
const API_ENDPOINT = "https://your-api.vercel.app/api/scrape-post"

export interface PostData {
    author: {
        name: string
        handle: string
        avatar: string
        verified: boolean
    }
    content: {
        text: string
        images: string[]
    }
    metrics: {
        likes: number
        retweets: number
        replies: number
    }
    timestamp: string
}

export interface FetchState {
    data: PostData | null
    loading: boolean
    error: string | null
}

/**
 * Override for Input field
 * Fetches post data when URL is entered
 */
export function withPostFetcher(Component): ComponentType {
    return (props) => {
        const [postUrl, setPostUrl] = useState("")
        const [fetchState, setFetchState] = useState<FetchState>({
            data: null,
            loading: false,
            error: null,
        })

        // Fetch post data whenever URL changes
        useEffect(() => {
            const fetchPost = async () => {
                if (!postUrl || postUrl.trim() === "") {
                    setFetchState({ data: null, loading: false, error: null })
                    return
                }

                // Validate URL format
                const xUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/i
                if (!xUrlPattern.test(postUrl)) {
                    setFetchState({
                        data: null,
                        loading: false,
                        error: "Invalid X post URL",
                    })
                    return
                }

                setFetchState({ data: null, loading: true, error: null })

                try {
                    const response = await fetch(API_ENDPOINT, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ url: postUrl }),
                    })

                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || "Failed to fetch post")
                    }

                    const data: PostData = await response.json()
                    setFetchState({ data, loading: false, error: null })
                } catch (error) {
                    setFetchState({
                        data: null,
                        loading: false,
                        error: error.message || "Network error",
                    })
                }
            }

            // Debounce the fetch (wait 500ms after user stops typing)
            const timeoutId = setTimeout(fetchPost, 500)
            return () => clearTimeout(timeoutId)
        }, [postUrl])

        // Pass fetch state and handlers to the component
        return (
            <Component
                {...props}
                value={postUrl}
                onValueChange={setPostUrl}
                // Expose state for use in other components
                data-post-data={JSON.stringify(fetchState.data)}
                data-loading={fetchState.loading}
                data-error={fetchState.error}
            />
        )
    }
}

/**
 * ALTERNATIVE: Use as a hook in a Code Component
 *
 * If you prefer to create a custom Code Component instead of an override:
 */

export function usePostFetcher(url: string): FetchState {
    const [fetchState, setFetchState] = useState<FetchState>({
        data: null,
        loading: false,
        error: null,
    })

    useEffect(() => {
        const fetchPost = async () => {
            if (!url || url.trim() === "") {
                setFetchState({ data: null, loading: false, error: null })
                return
            }

            const xUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/i
            if (!xUrlPattern.test(url)) {
                setFetchState({
                    data: null,
                    loading: false,
                    error: "Invalid X post URL",
                })
                return
            }

            setFetchState({ data: null, loading: true, error: null })

            try {
                const response = await fetch(API_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ url }),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to fetch post")
                }

                const data: PostData = await response.json()
                setFetchState({ data, loading: false, error: null })
            } catch (error) {
                setFetchState({
                    data: null,
                    loading: false,
                    error: error.message || "Network error",
                })
            }
        }

        const timeoutId = setTimeout(fetchPost, 500)
        return () => clearTimeout(timeoutId)
    }, [url])

    return fetchState
}

/**
 * USAGE EXAMPLES:
 *
 * 1. As an Override on Input Field:
 *    - Apply `withPostFetcher` to your URL input
 *    - Access data via props in other components
 *
 * 2. As a Hook in Code Component:
 *    ```tsx
 *    import { usePostFetcher } from "./APIFetcher"
 *
 *    export default function PostCard(props) {
 *        const { data, loading, error } = usePostFetcher(props.url)
 *
 *        if (loading) return <div>Loading...</div>
 *        if (error) return <div>Error: {error}</div>
 *        if (!data) return <div>Enter a URL</div>
 *
 *        return (
 *            <div>
 *                <h2>{data.author.name}</h2>
 *                <p>{data.content.text}</p>
 *            </div>
 *        )
 *    }
 *    ```
 *
 * 3. Store in Framer Variables:
 *    - Create variables: postData, isLoading, errorMessage
 *    - Update them using setVariable() in your override
 *    - Bind UI elements to these variables
 */
