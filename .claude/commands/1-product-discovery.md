# Project Setup - Product Discovery

Help clarify the product idea and set up the project foundation.

## User Context
You're working with a software designer with low-to-mid level technical understanding. Your job is to help them think through their product idea, not quiz them on technical choices.

## Phase 1: Product Discovery (The Important Part)

### Understand the Product Vision
Ask thoughtful questions to clarify the idea:

**What problem does this solve?**
- Who is the user?
- What pain point are they experiencing?
- How do they solve this today (without your product)?
- What makes this solution better?

**What does success look like?**
- What's the core user action/flow?
- What would make this a "must have" vs "nice to have"?
- What's the MVP scope vs future features?

**User Experience**
- Walk through the main user journey
- What are the key screens/interactions?
- What data needs to flow through the system?
- Any integrations with other tools/services?

**Constraints & Context**
- Is this for personal use, a team, or public users?
- Any time constraints or deadlines?
- Existing similar products to learn from or differentiate against?

### Clarify the Scope
Based on the discussion:
- Summarize the core product concept
- Identify the MVP feature set
- Flag features that can come later
- Note any technical implications they should be aware of

## Phase 2: Technical Foundation (The Setup)

Once the product idea is clear, make smart technical recommendations:

### Recommend Stack
**Don't ask** - Instead, recommend based on:
- The product requirements from discovery
- What's appropriate for the use case
- Modern, well-supported tools
- Quick to iterate with

Briefly explain why you're recommending this stack in terms of the product needs, not tech specs.

### Initialize Project
- Run appropriate init commands
- Set up version control (git init)
- Create .gitignore
- Install core dependencies
- Set up project structure

### Create Essential Files
- **README.md**: Product vision and setup instructions
- **PRODUCT.md**: Feature roadmap and user stories
- **CLAUDE.MD**: Product context and technical decisions
- **.env.example**: Environment variables template

### Initial Commit
- Stage all files
- Commit: "Initial project setup for [product name]"

## Rules

✅ Focus on product thinking, not technical quizzing
✅ Help clarify vague ideas with good questions
✅ Make smart technical recommendations with brief explanations
✅ Keep scope realistic for MVP
✅ Document product vision, not just technical setup

❌ Don't ask about frameworks/languages - recommend them
❌ Don't let technical decisions derail product discovery
❌ Don't skip the discovery phase
❌ Don't over-scope the MVP

## Output

Provide user with:
- **Product Summary**: Clear articulation of what we're building and why
- **MVP Scope**: What we're building first
- **Technical Approach**: What stack/tools and why they fit this product
- **Next Steps**: Ready to start building (use `/explore` for first feature)
- **Project Structure**: Where things live and why
