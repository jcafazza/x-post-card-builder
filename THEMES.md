# Theme Specifications

Design reference for implementing the three theme options in the app.

---

## Theme: Light

**Background:** `#FFFFFF` (White)
**Text Colors:**
- Primary text (name, post content): `#0F1419` (Near black)
- Secondary text (handle): `#536471` (Gray)
- Timestamp: `#536471` (Gray)

**Border (optional):**
- Color: `#EFF3F4` (Light gray)
- Width: 1px

**Best for:** Clean, professional look. Default theme.

---

## Theme: Dim

**Background:** `#15202B` (Dark blue-gray)
**Text Colors:**
- Primary text (name, post content): `#FFFFFF` (White)
- Secondary text (handle): `#8B98A5` (Light gray)
- Timestamp: `#8B98A5` (Light gray)

**Border (optional):**
- Color: `#38444D` (Medium gray)
- Width: 1px

**Best for:** Reduced eye strain, modern aesthetic. X's native "dim" mode.

---

## Theme: Dark

**Background:** `#000000` (True black)
**Text Colors:**
- Primary text (name, post content): `#FFFFFF` (White)
- Secondary text (handle): `#71767B` (Gray)
- Timestamp: `#71767B` (Gray)

**Border (optional):**
- Color: `#2F3336` (Dark gray)
- Width: 1px

**Best for:** OLED displays, high contrast, nighttime viewing.

---

## Implementation

Theme tokens are implemented in `web/lib/themes.ts` and consumed by:
- `web/components/PostCard.tsx`
- `web/components/Toolbar.tsx`
- `web/app/page.tsx`
- `web/app/share/*`

---

## Border Radius Values

Use these fixed values in the dropdown:

- **0px** - Sharp corners (modern, geometric)
- **8px** - Subtle rounding (balanced)
- **16px** - Noticeable rounding (friendly, default)
- **20px** - Soft rounding (approachable)
- **24px** - Maximum rounding (playful, bold)

---

## Shadow Intensity Values

### Flat
```
box-shadow: none
```

### Raised
```
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.06)
```

### Floating
```
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(0, 0, 0, 0.06)
```

### Elevated
```
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1),
            0 4px 6px rgba(0, 0, 0, 0.05)
```

**Note:** For dark themes, consider increasing shadow opacity slightly for better visibility.

---

## Tips

- **Default combination:** Light theme + 16px radius + Floating shadow
- **Test each theme** with various post content (short/long text, with/without images)
- **Responsive:** Ensure text is readable on all themes at different screen sizes
- **Accessibility:** All theme combinations meet WCAG AA contrast standards
