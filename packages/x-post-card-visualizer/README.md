# x-post-card-visualizer

Embed beautifully styled X (Twitter) post cards in your React app.

## Installation

```bash
npm install x-post-card-visualizer
```

## Hosted API (default)

`XCard` uses a default endpoint to fetch post data: `https://x-post-card-visualizer.vercel.app/api/scrape-post`.  
Deploy the [web app](https://github.com/johncafazza/x-post-card-visualizer) (this repo’s `web` folder) to Vercel with project name **x-post-card-visualizer**, or pass `apiUrl` to `XCard` with your own deployment URL.

## Usage

```tsx
import { XCard } from 'x-post-card-visualizer'

function MyComponent() {
  return (
    <XCard
      url="https://x.com/elonmusk/status/123456789"
      theme="dark"
      shadow="floating"
      width={450}
      radius={20}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | (required) | The X post URL to display |
| `theme` | `'light' \| 'dim' \| 'dark'` | `'light'` | Color theme |
| `shadow` | `'flat' \| 'raised' \| 'floating' \| 'elevated'` | `'floating'` | Shadow intensity |
| `width` | `number` | `450` | Card width in pixels (350-700) |
| `radius` | `number` | `20` | Border radius in pixels (0-24) |
| `apiUrl` | `string` | (hosted API) | Custom API endpoint |
| `className` | `string` | - | Custom className for wrapper |
| `fallback` | `ReactNode` | Loading skeleton | Custom loading placeholder |
| `onError` | `(error: Error) => void` | - | Error callback |
| `onLoad` | `(post: PostData) => void` | - | Load success callback |

## Themes

### Light
The default theme with a clean white background.

### Dim
A muted dark theme inspired by X's dim mode.

### Dark
A true dark theme with deep blacks.

## Shadow Levels

- **flat**: No shadow
- **raised**: Subtle shadow for slight elevation
- **floating**: Medium shadow (default)
- **elevated**: Prominent shadow for maximum depth

## Advanced Usage

### Custom API Endpoint

If you're self-hosting the API, you can point to your own endpoint:

```tsx
<XCard
  url="https://x.com/user/status/123"
  apiUrl="https://your-api.com/api/scrape-post"
/>
```

### Custom Loading State

```tsx
<XCard
  url="https://x.com/user/status/123"
  fallback={<div>Loading...</div>}
/>
```

### Error Handling

```tsx
<XCard
  url="https://x.com/user/status/123"
  onError={(error) => console.error('Failed to load:', error)}
/>
```

### Using PostCard Directly

For advanced use cases, you can render the card directly with your own data:

```tsx
import { PostCard, getThemeStyles } from 'x-post-card-visualizer'

const post = {
  author: {
    name: 'John Doe',
    handle: '@johndoe',
    avatar: 'https://...',
    verified: true,
  },
  content: {
    text: 'Hello world!',
    images: [],
  },
  timestamp: new Date().toISOString(),
}

<PostCard
  post={post}
  theme={getThemeStyles('dark')}
  shadow="floating"
  width={450}
  radius={20}
/>
```

## License

MIT
