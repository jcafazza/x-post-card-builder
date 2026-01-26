# Contributing to X Post Card Builder

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/x-post-visualizer.git
   cd x-post-visualizer
   ```

3. **Install dependencies:**
   ```bash
   cd web
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Development Workflow

### Code Style

- **TypeScript**: We use strict TypeScript. All code must type-check.
- **Formatting**: Follow existing code style and patterns.
- **Imports**: Use absolute imports with `@/` prefix (configured in `tsconfig.json`).
- **Components**: Use functional components with TypeScript interfaces for props.

### Project Structure

```
web/
  app/              # Next.js App Router pages and API routes
  components/       # React components
  hooks/            # Custom React hooks
  lib/              # Utilities, themes, API client
  types/            # TypeScript type definitions
  constants/        # UI constants (animations, card settings)
```

### Making Changes

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bugfix-name
   ```

2. **Make your changes:**
   - Write clean, maintainable code
   - Follow existing patterns
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes:**
   - Ensure the app runs without errors
   - Test the feature you're adding/fixing
   - Check for TypeScript errors: `npm run lint`

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```
   
   **Commit message guidelines:**
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issue numbers if applicable: "Fix #123: Description"

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request:**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit the PR

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All TypeScript errors are resolved
- [ ] Changes are tested locally
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

### PR Description

Please include:
- **What** you changed and why
- **How** to test the changes
- **Screenshots** (if UI changes)
- **Related issues** (if any)

## Code Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## Reporting Issues

### Bug Reports

When reporting a bug, please include:
- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

### Feature Requests

For feature requests, please:
- Describe the feature clearly
- Explain the use case
- Discuss potential implementation approaches (optional)

## Development Tips

### Running Linter

```bash
cd web
npm run lint
```

### Building for Production

```bash
cd web
npm run build
```

### Type Checking

TypeScript will automatically type-check during development. For explicit checking:

```bash
cd web
npx tsc --noEmit
```

## Architecture Notes

### Key Design Decisions

- **No API Keys Required**: Uses X's public syndication endpoints
- **Stateless**: No user accounts or data storage
- **Server-Side Scraping**: Prevents CORS issues and enables reliable export
- **Image Proxy**: All images proxied through `/api/image` for same-origin loading

### Important Files

- `web/app/api/scrape-post/route.ts` - Main scraping logic
- `web/lib/themes.ts` - Theme configuration
- `web/constants/ui.ts` - Animation and UI constants
- `web/components/InteractivePostCard.tsx` - Main card component

## Questions?

If you have questions or need help:
- Open an issue for discussion
- Check existing issues and PRs
- Review the documentation in `README.md` and `PRODUCT.md`

Thank you for contributing! 🎉
