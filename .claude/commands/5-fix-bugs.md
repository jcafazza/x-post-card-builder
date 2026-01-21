# Bug Fixing Workflow

Systematic approach to identifying and fixing bugs.

## Workflow

### 1. Reproduce the Issue
- Understand the bug description
- Identify steps to reproduce
- Note expected vs actual behavior
- Check error messages, logs, stack traces

### 2. Locate the Problem
- Use error messages to find relevant files
- Search for related functions/components
- Read surrounding code for context
- Check recent changes (git log, git blame)

### 3. Identify Root Cause
- Trace execution flow
- Check assumptions and edge cases
- Look for:
  - Null/undefined values
  - Off-by-one errors
  - Type mismatches
  - Logic errors
  - Race conditions
  - Missing error handling

### 4. Develop Fix
- Create minimal, targeted fix
- Don't refactor unrelated code
- Preserve existing functionality
- Consider edge cases

### 5. Verify Fix
- Test the specific bug scenario
- Check for regressions
- Run relevant test suite
- Manual testing if applicable

### 6. Document
- Add comments if logic is non-obvious
- Update tests if needed
- Note the fix in commit message

## Common Bug Patterns

### Null/Undefined Issues
- Missing null checks
- Optional chaining needed
- Default values missing

### Logic Errors
- Wrong operators (&&/||, </<=)
- Incorrect conditionals
- State updates

### Async Issues
- Missing await
- Race conditions
- Unhandled promise rejections

### Type Issues
- Implicit type coercion
- Wrong type assumptions
- Missing type guards

## Rules

✅ Understand before fixing
✅ Make minimal changes
✅ Test the fix thoroughly
✅ Read code before modifying

❌ Don't guess at fixes
❌ Don't refactor while fixing bugs
❌ Don't add features while fixing bugs
❌ Don't skip testing

## Output

Report:
- Bug description
- Root cause identified
- Fix applied at [file:line]
- Testing performed
- Any related concerns
