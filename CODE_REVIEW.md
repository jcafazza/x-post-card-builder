# Code Review — Recent Changes

**Review date:** In progress  
**Scope:** Uncommitted changes (InteractivePostCard, next.config.js, package.json)

---

## Summary

Recent changes cover:

1. **InteractivePostCard.tsx** — Width-drag UX: rAF-throttled updates, no transition during drag, smooth raw-width tracking, min-width rubberband (mirror of max), and correct snap-back for both bounds.
2. **package.json** — Dev script uses `next dev --webpack`; added `dev:turbo` for Turbopack.
3. **next.config.js** — Removed empty dev-only `experimental` block; set `reactStrictMode: true`; comment on webpack runtime error mitigation.

---

## Issues Found

### Critical 🔴

**None.** No logic errors, security issues, or type-safety problems that would break the app.

---

### Important 🟡

#### 1. Pending rAF can run after mouseup and overwrite snap-back  
**File:** `web/components/InteractivePostCard.tsx`  
**Location:** `handleMouseUp` (approx. lines 190–220); rAF is only cancelled in effect cleanup.

**What’s wrong:**  
On the last `mousemove` before release, a `requestAnimationFrame(applyWidthFromMouse)` can be scheduled. When the user releases, `handleMouseUp` runs and sets e.g. `setVisualWidth(CARD_MAX_WIDTH)` and `onSettingsChange(…, CARD_MAX_WIDTH)`. The effect cleanup (which cancels the rAF) runs only after the re-render from `setIsResizingWidth(false)`. So the already-queued rAF can still run on the next frame, call `applyWidthFromMouse`, and overwrite the snap-back with a width derived from `latestMouseXRef.current` (release position). That can cause a visible flicker or a final width that doesn’t match the intended bound.

**Why it matters:**  
Users can see the width jump or settle on the wrong value right after release when they’ve been in the rubberband zone.

**Suggested fix:**  
Cancel any pending width rAF at the very start of `handleMouseUp`, before doing snap-back logic:

```ts
const handleMouseUp = () => {
  if (widthRafRef.current != null) {
    cancelAnimationFrame(widthRafRef.current)
    widthRafRef.current = null
  }
  // ... rest of handleMouseUp
}
```

That way no `applyWidthFromMouse` runs after the user has released.

---

#### 2. `handleMouseUp` uses closure `settings` instead of latest  
**File:** `web/components/InteractivePostCard.tsx`  
**Location:** `handleMouseUp`, lines 195 and 199 — `onSettingsChange({ ...settings, cardWidth: ... })`.

**What’s wrong:**  
`handleMouseUp` uses `settings` from the effect closure. That closure was created when the effect last ran (e.g. when `isResizingWidth` became true), so `settings` can be from drag start. If something else updates `settings` during the drag, the snap-back could overwrite that with stale data.

**Why it matters:**  
Low probability during a single drag, but using stale `settings` when calling `onSettingsChange` is inconsistent with the rest of the logic, which uses `settingsRef.current` in `applyWidthFromMouse`.

**Suggested fix:**  
Use the same pattern as in `applyWidthFromMouse` and pass the latest settings from the ref:

```ts
onSettingsChange({ ...settingsRef.current, cardWidth: CARD_MAX_WIDTH })
// and
onSettingsChange({ ...settingsRef.current, cardWidth: CARD_MIN_WIDTH })
```

---

### Suggestions 🔵

#### 1. Document `--webpack` in the repo  
**File:** `web/package.json` (and optionally README or CONTRIBUTING).

**Suggestion:**  
Add a one-line comment or doc note that `dev` uses `--webpack` to avoid Turbopack-related runtime issues (e.g. `__webpack_modules__[moduleId] is not a function`), and that `dev:turbo` is available for Turbopack. Helps future contributors and your future self.

---

#### 2. next.config comment accuracy  
**File:** `web/next.config.js`  
**Location:** Comment above `reactStrictMode: true`.

**Current:**  
“Reduce chance of '__webpack_modules__[moduleId] is not a function' at runtime: ensure consistent chunk loading and avoid stale modules.”

**Note:**  
`reactStrictMode` mainly affects double-invoking renders and stricter checks; it doesn’t directly “ensure consistent chunk loading.” The change that actually targets the runtime error is switching dev to `next dev --webpack` in `package.json`. The comment is slightly misleading; you could either move that explanation to the dev script / docs or adjust the comment to say that `reactStrictMode` improves consistency of behavior during development, and that chunk/runtime issues are addressed by using the webpack dev server.

---

## Positive Notes ✅

1. **Width-drag performance and feel** — Throttling with `requestAnimationFrame` and using raw width for visual updates (with 2px snap only for committed value) makes the interaction smooth and avoids jank from excessive state updates.
2. **No transition during drag** — Turning off width transition while `isResizingWidth` is true makes the card track the cursor immediately; transition is only used for rubberband snap-back. That’s the right split.
3. **Min-width rubberband** — Undershoot below min uses the same 50% resistance and same constant as overshoot above max, and snap-back + transition logic correctly handle both bounds. Behavior is consistent and easy to reason about.
4. **Cleanup** — Effect cleanup correctly removes listeners and cancels the width rAF, which avoids leaks and stray updates after the effect is torn down.
5. **Ref for latest settings** — `settingsRef.current = settings` and use in `applyWidthFromMouse` ensure drag updates always use the latest settings, even when React hasn’t re-run the effect yet.
6. **Config simplification** — Dropping the no-op `experimental` block and enabling `reactStrictMode` makes the Next config clearer.
7. **Dev workflow** — Keeping `dev:turbo` allows choosing Turbopack when desired, while default `dev` uses webpack for stability.

---

## Checklist (brief)

| Area            | Status |
|-----------------|--------|
| Readability     | ✅ Clear names and comments |
| Simplicity      | ✅ No unnecessary abstraction |
| Consistency     | ✅ Matches existing patterns |
| Type safety     | ✅ Typing is consistent |
| Error handling  | ✅ No new surface; existing behavior preserved |
| Security        | ✅ No new inputs or secrets |
| Performance     | ✅ rAF throttle and refs used well |
| Maintainability | ✅ Logic is easy to follow; one race to fix |

---

## Recommended order of work

1. **High:** Cancel pending width rAF at the start of `handleMouseUp` (Important #1).
2. **Medium:** Use `settingsRef.current` in `handleMouseUp` for both snap-back `onSettingsChange` calls (Important #2).
3. **Low:** Adjust or relocate the next.config comment (Suggestion #2) and document `--webpack` (Suggestion #1).
