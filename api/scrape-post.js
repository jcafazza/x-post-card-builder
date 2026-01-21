/**
 * X Post Scraper API
 * Serverless function that scrapes public X (Twitter) posts
 * Returns structured JSON data for card rendering
 */

import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // CORS headers - allow requests from Framer
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // Validate URL
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL parameter' });
  }

  // Validate it's an X/Twitter URL
  const xUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/i;
  if (!xUrlPattern.test(url)) {
    return res.status(400).json({ error: 'Invalid X/Twitter post URL' });
  }

  try {
    // Fetch the post HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Post not found or deleted' });
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract data from meta tags (Open Graph and Twitter Card)
    const postData = {
      author: {
        name: '',
        handle: '',
        avatar: '',
        verified: false,
      },
      content: {
        text: '',
        images: [],
      },
      metrics: {
        likes: 0,
        retweets: 0,
        replies: 0,
      },
      timestamp: '',
    };

    // Extract author info
    postData.author.name = $('meta[property="og:title"]').attr('content')?.split(' on X:')[0]?.trim() ||
                           $('meta[name="twitter:title"]').attr('content')?.split(' on X:')[0]?.trim() ||
                           '';

    // Extract handle from URL
    const handleMatch = url.match(/\/([\w]+)\/status/);
    if (handleMatch) {
      postData.author.handle = `@${handleMatch[1]}`;
    }

    // Extract avatar
    postData.author.avatar = $('meta[property="og:image"]').attr('content') ||
                             $('meta[name="twitter:image"]').attr('content') ||
                             '';

    // Extract post text
    postData.content.text = $('meta[property="og:description"]').attr('content') ||
                            $('meta[name="twitter:description"]').attr('content') ||
                            $('meta[name="description"]').attr('content') ||
                            '';

    // Extract images (look for twitter:image meta tags)
    $('meta[property="og:image"], meta[name="twitter:image"]').each((i, el) => {
      const imgUrl = $(el).attr('content');
      if (imgUrl && !postData.content.images.includes(imgUrl) && i > 0) {
        // Skip first image (usually the avatar)
        postData.content.images.push(imgUrl);
      }
    });

    // Extract timestamp (if available in meta)
    const timeString = $('meta[property="article:published_time"]').attr('content');
    if (timeString) {
      postData.timestamp = timeString;
    } else {
      // Fallback: current timestamp
      postData.timestamp = new Date().toISOString();
    }

    // Note: Metrics (likes, retweets, replies) are not easily available via meta tags
    // They require JavaScript rendering or API access
    // For MVP, we'll leave them as 0 or you can add Puppeteer for more robust scraping

    // Validate we got essential data
    if (!postData.author.name || !postData.content.text) {
      return res.status(500).json({
        error: 'Could not extract post data. Post may be protected or X structure has changed.',
        debug: {
          hasName: !!postData.author.name,
          hasText: !!postData.content.text,
        }
      });
    }

    return res.status(200).json(postData);

  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({
      error: 'Failed to scrape post',
      message: error.message
    });
  }
}
