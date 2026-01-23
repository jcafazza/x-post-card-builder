# CLAUDE.MD

This file provides context and guidelines for Claude Code when working on this project.

## Project Overview

**Project Name:** X Post Card Builder
**Type:** Next.js web application (UI + API routes)
**Purpose:** Transform X (Twitter) posts into beautiful, customizable visual cards for export and embedding

**User Context:** Software designer with low-to-mid level technical understanding
- Strong design thinking and product vision
- Growing technical skills in implementation
- Values clear explanations of technical decisions and trade-offs

## Product Context

**What we're building:**
A tool that scrapes X posts and renders them as customizable cards. Users can adjust design (colors, radius, spacing, shadows) and export as PNG (MVP) or copy embed code (Phase 2).

**Key differentiator:**
Unlike screenshot tools for social sharing, this focuses on giving designers granular control to create embeddable cards that match their website's aesthetic.

**Target users:**
Designers, content creators, and personal brand builders who want beautiful X post embeds on their websites.

**MVP scope (2-3 days):**
- Next.js app with live preview and customization controls
- Server-side scraping (no X API needed) via syndication endpoints
- PNG export using html2canvas
- Shareable, view-only links that preserve settings

**Phase 2:**
- Web component for embeds (`<x-card>`)
- Copy embed code functionality

## Project Structure

```
x-post-visualizer/
├── web/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scrape-post/route.ts # POST /api/scrape-post
│   │   │   └── image/route.ts      # GET  /api/image?url=...
│   │   ├── share/                  # Share page (URL-driven settings)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   └── types/
├── .claude/                    # Claude Code configuration
├── package.json                # Dependencies
├── README.md                   # Setup and usage instructions
├── PRODUCT.md                  # Full product specification
└── CLAUDE.md                   # This file
```

## Development Guidelines

### Code Style
- Follow language-specific best practices
- Keep code simple and maintainable
- Avoid over-engineering

### Git Workflow
- Use descriptive commit messages
- Branch naming: feature/, bugfix/, hotfix/
- Default branch: main

### Testing
- Write tests for new features
- Run tests before committing

## AI Assistant Preferences

### Communication Style
- Be concise and direct
- No unnecessary emojis
- Focus on technical accuracy
- **Explain technical decisions in accessible terms**
  - When making architectural choices, briefly explain why
  - Clarify trade-offs between different approaches
  - Define technical terms when first introduced
  - Assume design expertise, but explain implementation details

### Code Quality
- **Write expert-level code** - Don't compromise on quality
- Follow language-specific best practices
- Implement robust error handling and edge cases
- Use industry-standard patterns and conventions

### Code Changes
- Read files before modifying
- Avoid premature abstractions
- Only add what's requested
- Delete unused code completely

### Task Management
- Use TodoWrite for complex tasks
- Break down large changes
- Mark tasks complete immediately
- **Explain what each phase accomplishes** for visibility into progress

## Tech Stack

### Frontend (Next.js)
- App Router + React + TypeScript
- Tailwind CSS for styling
- Shared design constants for motion + theme

### Backend (Vercel Serverless)
- Node.js runtime
- Tokenized syndication fetch + HTML embed fallback (no API keys)
- Auto-scaling serverless functions
- Free tier suitable for MVP

**Why syndication endpoints (not Puppeteer):**
- Much faster and lighter than running a headless browser
- Better fit for serverless constraints
- Works without X API keys for most public posts

### Libraries
- `html2canvas` - client-side PNG export
- (No Puppeteer in production)

### Deployment
- Vercel (web app + API routes)
- CDN (Phase 2 web component) - jsDelivr or unpkg

## Dependencies

See `web/package.json`.

## Custom Commands - Product Development Workflow

Commands are organized in `.claude/commands/` following a natural development workflow.

### Phase 1: Project Initialization
**/product-discovery** - Product discovery and project initialization
- Help clarify product idea through thoughtful questions
- Understand problem, users, and core user journey
- Define MVP scope vs future features
- Recommend tech stack with explanations
- Initialize project with essential files
- Create PRODUCT.md with feature roadmap

### Phase 2: Feature Development
**/feature-planning** - Plan new features in existing codebase
- Understand feature request from product perspective
- Analyze how it fits into existing architecture
- Explain technical approach and trade-offs
- Reference specific files and patterns
- Ask clarifying questions
- Provide clear implementation plan

**/implement** - Implement planned features with tracking and documentation
- Write elegant, minimal, modular code
- Follow existing patterns and conventions
- Include clear comments and documentation
- Track progress dynamically

### Phase 3: Quality Assurance
**/test** - Run tests, analyze failures, and fix issues automatically
- Detect and run test framework
- Parse failures and identify root causes
- Fix implementation (not tests)
- Verify fixes

**/fix-bugs** - Systematic bug fixing workflow
- Reproduce and locate issues
- Identify root cause
- Apply minimal, targeted fixes
- Verify and document

**/code-review** - Perform thorough code review of changes
- Check code quality, correctness, security
- Provide prioritized feedback (Critical/Important/Suggestions)
- Include specific file paths and line numbers

### Phase 4: Collaboration & Learning
**/peer-review** - Get feedback from simulated team lead perspective
- Fresh eyes on implementation decisions
- Architectural and design feedback

**/document** - Update documentation after code changes
- Verify current implementation (read actual code)
- Update CHANGELOG.md
- Keep docs concise, practical, and accurate

**/learn** - Educational insights on code patterns
- Understand why patterns are used
- Learn best practices from codebase

### Usage
Commands follow a natural workflow but can be used independently.

**Typical workflow:**
1. `/product-discovery` - Start new project
2. `/feature-planning` - Plan next feature
3. `/implement` - Build it
4. `/test` - Test it
5. `/code-review` - Review it
6. `/document` - Document it

## Architecture Decisions

### Why Server-Side Scraping (Vercel API)?
- **CORS prevention**: Browser can't directly fetch X posts due to CORS
- **No API keys**: Scraping public HTML means no X API account needed
- **Rate limiting**: Control scraping rate to prevent abuse
- **Reliability**: Server has better control over requests and headers

### Why Stateless (No User Accounts)?
- **Zero friction**: Users can start immediately
- **Privacy**: No data collection or storage
- **Simplicity**: Easier to build and maintain
- **MVP speed**: Ship faster without auth complexity

### API Response Structure
The scraper returns structured JSON matching the card UI:
- `author` - Display name, handle, avatar, verified status
- `content` - Post text and image URLs
- `timestamp` - Post creation time

**Customization Options:**
- Theme: "light", "dim", "dark"
- Border Radius: "0px", "8px", "16px", "20px", "24px"
- Shadow Intensity: "flat", "raised", "floating", "elevated"
- Show Date: toggle

## Common Tasks

### Setup
```bash
cd web
npm install
npm run dev
```

### Deploy
Deploy the `web` directory as a Next.js project on Vercel (UI + API routes ship together).

## Known Limitations

### Scraping Brittleness
- X can change HTML structure at any time
- May need periodic maintenance
- Protected/private posts can't be scraped
- Only works for public posts

### Simplified MVP Scope
- No metrics display (removed from MVP)
- Focus on clean, customizable card design
- Three theme options instead of infinite color choices
- Fixed border radius values for consistency

### Rate Limiting
- No rate limiting implemented in MVP
- Consider adding if product goes public
- Vercel has request limits on free tier

## Next Steps After Setup

1. **Polish UI + motion**
2. **Harden scraping fallbacks**
3. **Deploy to Vercel**

## References

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Next.js App Router](https://nextjs.org/docs/app)
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [Product Spec](PRODUCT.md)
