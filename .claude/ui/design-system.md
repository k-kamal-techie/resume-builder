# Design System — ResumeAI

## Accent Color System

All primary colors use CSS custom properties, NOT hardcoded Tailwind colors.

### Usage
```
bg-accent-600    → primary buttons, active states
bg-accent-700    → hover states on primary buttons
bg-accent-500    → focus rings, borders
bg-accent-100    → light backgrounds (avatar, badges)
bg-accent-50     → very light backgrounds (active nav, selected items)
text-accent-600  → links, icons, labels
text-accent-700  → hover on links, active nav text
```

### Rules
- NEVER use `blue-600`, `blue-500`, etc. for UI elements — use `accent-*` instead
- Template components (classic, modern, minimal) keep their own hardcoded colors for PDF output
- The `red-*` palette is reserved for errors and destructive actions only

### Presets Available
Blue (default), Purple, Green, Teal, Orange, Rose, Indigo

## Typography

- **Font**: Geist Sans (variable `--font-geist-sans`)
- **Mono**: Geist Mono (variable `--font-geist-mono`) — used in JSON editor, code blocks
- **Headings**: `font-bold` or `font-semibold`, never `font-normal`
- **Body text**: `text-sm` (14px) default, `text-xs` (12px) for secondary

## Spacing

- Page padding: `p-6` on dashboard, `px-4 py-2` on toolbars
- Card padding: `p-4` or `p-6`
- Gap between elements: `gap-2` (small), `gap-3` (medium), `gap-4` (large)
- Section margins: `mb-4` to `mb-6`

## Component Patterns

### Buttons
- Use `<Button>` component from `@/components/ui/button`
- Variants: `primary` (accent bg), `outline`, `ghost`, `danger`
- Sizes: `sm`, `md`
- Always include icon + text for toolbar buttons

### Inputs
- Use `<Input>` component from `@/components/ui/input`
- Focus ring: `focus:ring-2 focus:ring-accent-500`
- Error state: `border-red-500` with `text-red-500` message

### Chat Messages
- User messages: `bg-accent-600 text-white` (right-aligned)
- AI messages: `bg-white border border-gray-200` (left-aligned)
- Render AI markdown with `react-markdown` + `remark-gfm`
- JSON blocks: collapsed behind "View data" toggle

### Layout
- Editor: Full screen, no sidebar/navbar, 55% chat / 45% preview
- Dashboard: Sidebar (w-64) + navbar (h-16) + content area
- All panels use `flex flex-col h-full` with `overflow-hidden` on parent

## Neutral Palette
- Borders: `border-gray-200`
- Backgrounds: `bg-white`, `bg-gray-50`, `bg-gray-100`
- Text primary: `text-gray-900`
- Text secondary: `text-gray-500`, `text-gray-600`
- Text muted: `text-gray-400`
