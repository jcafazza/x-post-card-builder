# Code Review

Perform thorough code review of recent changes or specific files.

## User Context
You're working with a software designer with low-to-mid level technical understanding. When identifying issues, explain WHY they matter and what the implications are.

## Scope

By default, review uncommitted changes. User can specify:
- Specific files or directories
- Commit range (e.g., last 3 commits)
- Branch comparison

## Review Checklist

### 1. Code Quality
- **Readability**: Clear naming, appropriate comments where needed
- **Simplicity**: No over-engineering or unnecessary abstractions
- **Consistency**: Follows existing code patterns and conventions
- **DRY**: Avoid duplication, but don't force abstractions

### 2. Correctness
- **Logic errors**: Off-by-one, null checks, edge cases
- **Type safety**: Proper types, no unsafe casts
- **Error handling**: Appropriate for the context (avoid over-engineering)
- **Testing**: Are tests needed? Do existing tests cover changes?

### 3. Security
- **Input validation**: At system boundaries only
- **SQL injection**: Parameterized queries
- **XSS**: Proper escaping/sanitization
- **Authentication/Authorization**: Proper checks
- **Secrets**: No hardcoded credentials or API keys

### 4. Performance
- **Obvious inefficiencies**: N+1 queries, unnecessary loops
- **Resource leaks**: Unclosed connections, memory leaks
- **Scalability concerns**: Only if relevant to the change

### 5. Maintainability
- **Breaking changes**: Impact on existing code
- **Dead code**: Remove unused code completely
- **Dependencies**: New deps justified and necessary

## Output Format

```
## Summary
[Brief overview of changes reviewed]

## Issues Found
### Critical 🔴
- [Issues that must be fixed]

### Important 🟡
- [Issues that should be fixed]

### Suggestions 🔵
- [Nice-to-have improvements]

## Positive Notes ✅
- [Things done well]
```

## Rules

✅ Be specific with file paths and line numbers
✅ **Explain WHY something is an issue** - what problems could it cause?
✅ **Clarify the impact** - security risk, performance issue, maintainability concern, etc.
✅ Suggest concrete fixes in accessible terms
✅ Acknowledge good practices

❌ Don't nitpick formatting (unless inconsistent)
❌ Don't suggest changes for hypothetical futures
❌ Don't recommend over-engineering
❌ Don't use jargon without explanation
