import { PostData } from '@/types/post'

/**
 * Default placeholder post - Brad Radius
 * Used when no post has been imported yet.
 */
const defaultPlaceholder: PostData = {
  author: {
    name: 'Brad Radius',
    handle: '@bradradius',
    avatar: '/avatars/avatarBrad.png',
    verified: false,
  },
  content: {
    text: 'Just spent 45 minutes adjusting the border radius on a button by 0.5px and honestly? Chef\'s kiss. This is what separates us from the animals.',
    images: [],
  },
  timestamp: '2026-01-22T23:37:00Z',
}

/**
 * Returns the default placeholder post data.
 */
export function getDefaultPlaceholder(): PostData {
  return defaultPlaceholder
}
