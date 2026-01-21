# Test Runner and Fixer

Run tests, analyze failures, and fix issues automatically.

## Workflow

### 1. Detect Test Framework
- Check for package.json scripts (npm test, npm run test, etc.)
- Identify testing framework: Jest, Vitest, Mocha, pytest, Go test, etc.
- Find test configuration files

### 2. Run Tests
- Execute the test command
- Capture output with full error details
- Parse failures and errors

### 3. Analyze Failures
For each failing test:
- Read the test file
- Read the implementation being tested
- Understand the expected vs actual behavior
- Identify root cause

### 4. Fix Issues
- Fix implementation bugs (NOT test bugs unless tests are clearly wrong)
- Preserve existing functionality
- Make minimal, targeted changes
- Avoid over-engineering

### 5. Verify Fix
- Re-run tests after each fix
- Confirm tests pass
- Check for new failures

## Rules

✅ Fix the implementation, not the tests (unless tests are genuinely incorrect)
✅ Run tests after every change
✅ Read code before modifying
✅ Keep changes minimal and focused

❌ Don't skip failing tests
❌ Don't modify tests to make them pass
❌ Don't change unrelated code

## Output

Report:
- Total tests run
- Failures found and fixed
- Any remaining issues
- Summary of changes made
