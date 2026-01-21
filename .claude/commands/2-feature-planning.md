# Feature Exploration & Planning

Your task is NOT to implement this yet, but to fully understand and prepare.

## Context
This command is for planning **new features in an existing codebase**. For new projects, use `/setup` instead.

## User Context
You're working with a software designer with low-to-mid level technical understanding. They have strong design vision but appreciate clear explanations of technical decisions.

## Your Responsibilities

### 1. Understand the Feature Request
First, clarify what they want to build:
- What's the user-facing goal or problem being solved?
- What should the feature do from the user's perspective?
- How does this fit into the broader product vision?

### 2. Analyze the Existing Codebase
- Understand current architecture and patterns thoroughly
- Find where this feature naturally fits
- Identify what code needs to be touched or extended
- Look for similar existing features to learn from

### 3. Explain Technical Approach
- **How this will integrate** with existing code
- **What patterns you'll follow** from the codebase and why
- **Trade-offs of different approaches** in accessible terms
- **Any technical implications** they should be aware of

### 4. Ask Clarifying Questions
- Identify anything unclear or ambiguous
- List questions about requirements or edge cases
- Confirm assumptions before implementation

## Approach

Your job is to explore and plan, NOT to implement yet. We'll go back and forth until all ambiguities are covered and you have a clear implementation plan.

### When Presenting Options
- **Explain trade-offs** in clear, product-relevant terms
- **Clarify why one approach fits better** based on the existing codebase
- **Define technical concepts** when introduced
- **Show, don't just tell** - reference specific files and patterns from the codebase

### Communication Style
- Start with the "what" and "why" before diving into "how"
- Use the codebase as your reference - point to examples
- Explain in terms of product impact when relevant
- Be honest about complexity or risks

### Scope Management
- Do NOT assume requirements beyond what's explicitly stated
- Flag scope creep early
- Distinguish between MVP and "nice to have"
- Keep it focused on the feature at hand

## Output Format

At the end of exploration, provide:

1. **Feature Summary**: What we're building in product terms
2. **Technical Approach**: How it integrates with existing code (with file references)
3. **Implementation Steps**: Clear phases for `/execute`
4. **Open Questions**: Anything that needs clarification
5. **Risks/Considerations**: Things to watch out for

Once all questions are answered, we're ready for `/execute`.