# Design System — Agentic Resume

## Core Principle
Every component follows this system. When building new UI, refer here first. Never introduce new patterns without updating this document.

---

## Color System

### Accent (Primary — CSS variables, themeable)
The primary color is defined as CSS variables so users can switch presets.

```
bg-accent-50     very light bg (selected rows, badges)
bg-accent-100    light bg (avatars, subtle highlights)
bg-accent-500    focus rings, borders
bg-accent-600    primary buttons, active nav items, user chat bubbles
bg-accent-700    hover on primary buttons
text-accent-600  links, icons, labels
text-accent-700  hover text
```

**NEVER** use `blue-*` for UI elements. Use `accent-*` always.
Exception: Resume templates (classic, modern, minimal) use hardcoded colors since they're for PDF output.

### Slate (Layout & Neutral)
```
bg-slate-900     Sidebar background / dark mode page bg
bg-slate-800     Sidebar hover items / dark mode cards, panels
bg-slate-700     Agent avatar / dark mode thumbnail areas, inputs
bg-slate-50      AI message bubbles, card hover backgrounds
text-slate-900   Primary headings (dark: text-white)
text-slate-700   Body text (dark: text-slate-200)
text-slate-500   Section labels, secondary text (dark: text-slate-400)
text-slate-400   Muted text, timestamps, placeholders
text-slate-400   Inactive sidebar nav items
border-slate-100 Light dividers (dark: border-slate-700)
border-slate-200 Card borders, input borders (dark: border-slate-700)
```

### Dark Mode Pattern
Every page and component must have `dark:` variants. Standard mappings:
```
bg-white           → dark:bg-slate-800   (cards, panels)
bg-slate-50        → dark:bg-slate-900   (page backgrounds)
bg-slate-100       → dark:bg-slate-800   (empty states, icon containers)
bg-accent-50       → dark:bg-accent-600/20 (selected states)
bg-accent-100      → dark:bg-accent-600/20 (badges, highlights)
text-slate-900     → dark:text-white     (headings)
text-slate-700     → dark:text-slate-200 (body text)
text-slate-600     → dark:text-slate-300 or dark:text-slate-400 (descriptions)
border-slate-200   → dark:border-slate-700 (card borders)
border-slate-100   → dark:border-slate-600 or dark:border-slate-700 (inner borders)
border-slate-300   → dark:border-slate-600 (input borders)
hover:bg-slate-50  → dark:hover:bg-slate-700 (button hovers)
hover:bg-slate-100 → dark:hover:bg-slate-700 (action hovers)
hover:bg-red-50    → dark:hover:bg-red-900/30 (danger hovers)
bg-red-50          → dark:bg-red-900/30 (error backgrounds)
```

**Exception**: Resume templates (classic, modern, minimal) do NOT use dark mode — they always render on white paper for PDF output.

### System Colors
```
red-*      Error states, destructive actions
green-*    Success / resume-updated badge
emerald-*  Applied data indicator
violet-*   KB-updated badge
amber-*    DRAFT chip
sky-*      KB info chips in chat header
```

---

## Typography

```
text-2xl font-bold     Page titles (h1)
text-xl font-bold      Section headings
text-sm font-semibold  Card titles, component labels
text-sm                Body text (default)
text-xs                Secondary text, metadata
text-[11px]            Badges, timestamps, tiny labels

Section labels:  text-xs font-semibold uppercase tracking-wider text-slate-500
Timestamps:      text-[10px] text-slate-400
```

---

## Spacing

```
Page padding:     p-7 (dashboard), px-5 (sidebar)
Card padding:     p-5
Panel headers:    px-4 py-3 or px-5 py-3.5
Gap between items: gap-2 (small), gap-3 (medium), gap-4 (large)
Section margin:   mb-7 (page sections)
```

---

## Layout

### Authenticated Pages
All authenticated pages use a dark AppSidebar + content area layout:
```
<div className="flex h-screen">
  <AppSidebar />   {/* w-60, bg-slate-900, sticky */}
  <main>           {/* flex-1, overflow-y-auto */}
```

### Editor (Full Screen)
```
<div className="flex h-screen overflow-hidden">
  <AppSidebar />              {/* w-60 */}
  <div className="flex-1">
    <EditorContent />         {/* flex flex-col h-screen */}
      Toolbar                 {/* h-~48px, border-b border-slate-100 */}
      <div className="flex flex-1 overflow-hidden">
        <ChatPanel />         {/* flex-1 */}
        <PreviewPanel />      {/* w-[420px] */}
```

---

## AppSidebar (Dark)

```
bg-slate-900 w-60 h-screen sticky overflow-y-auto

Structure:
  Brand logo (h-8 w-8 rounded-lg bg-accent-600) + "Agentic Resume"
  ───────────────────────── border-slate-800
  User avatar + name + email
  ───────────────────────── border-slate-800
  Section label: WORKSPACE
  Nav items:
    inactive: text-slate-400 hover:text-white hover:bg-slate-800
    active:   bg-accent-600 text-white
  ───────────────────────── border-slate-800 (bottom)
  Accent color dots
  Sign Out button
```

---

## Chat Panel

### Header
```
bg-white px-5 py-3.5 border-b border-slate-100

- Robot avatar (h-7 w-7 rounded-full bg-slate-800)
- "Resume Agent" (text-sm font-semibold text-slate-900)
- Status chips: rounded-full text-[11px] font-medium
  Thinking:   bg-violet-100 text-violet-700
  JD attached: bg-emerald-100 text-emerald-700
  KB skills:  bg-sky-100 text-sky-700
```

### Messages
```
Agent bubble:  bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm
User bubble:   bg-accent-600 text-white rounded-2xl rounded-tr-sm
Timestamp:     text-[10px] text-slate-400 mt-1
Avatar size:   h-8 w-8 rounded-full
```

### Input Area
```
bg-slate-50 rounded-xl border border-slate-200
focus-within: border-accent-400 ring-2 ring-accent-500/20
Placeholder: "Paste Job Description or ask the agent..."
Footer: "Agentic Engine v2.4" | "Shift + Enter to send"
       text-[10px] text-slate-400
```

---

## Preview Panel

### Tab Bar
```
3 tabs: Preview | Edit JSON | Theme
Active tab: border-b-2 border-accent-600 text-accent-600
Inactive:   border-b-2 border-transparent text-slate-500
PDF button: ml-auto, text-xs text-slate-500, rounded-lg hover:bg-slate-50
```

### Preview Area
```
bg-slate-100 (contains the scaled resume)
```

---

## Dashboard

### Page Header
```
Section label: text-xs font-semibold uppercase tracking-wider text-slate-400
Page title:    text-xl font-bold text-slate-900
```

### Resume Cards
```
bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
hover: border-accent-300 dark:border-accent-500 shadow-md
Thumbnail area: h-28 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600
Title: text-sm font-semibold text-slate-900 dark:text-white
Meta: text-xs text-slate-400
Actions: opacity-0 → group-hover:opacity-100
```

---

## Editor Toolbar

```
h-~48px border-b border-slate-100 bg-white
Left: ← arrow button + filename input (text-sm font-semibold) + DRAFT chip
      DRAFT: bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold uppercase
Right: Undo (ghost) + Save (primary)
```

---

## UI Components

### Button Variants
```
primary:   bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500
secondary: bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600
outline:   border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800
ghost:     text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800
danger:    bg-red-600 text-white hover:bg-red-700
```

### Cards
```
bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
Interactive: hover:border-accent-300 dark:hover:border-accent-500 hover:shadow-md cursor-pointer
```

### Modals
```
Backdrop: fixed inset-0 bg-black/50 z-50
Panel: bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg p-5
Title: text-sm font-semibold text-slate-900 dark:text-white
```

### Inputs
```
Normal: border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-accent-500
Error:  border-red-500 + text-xs text-red-500
```

---

## Login Page

```
bg-slate-50 dark:bg-slate-900 min-h-screen
Brand: h-12 w-12 rounded-2xl bg-accent-600 shadow-lg shadow-accent-600/25
Title: "Agentic Resume" text-2xl font-bold text-slate-900 dark:text-white
Card: bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm
OAuth buttons: rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700
```

---

## Accent Color Presets

| Name | 600 value |
|------|-----------|
| Blue (default) | `#2563eb` |
| Purple | `#9333ea` |
| Green | `#16a34a` |
| Teal | `#0d9488` |
| Orange | `#ea580c` |
| Rose | `#e11d48` |
| Indigo | `#4f46e5` |

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use `accent-*` for interactive elements | Use `blue-*` directly in UI components |
| Use `slate-*` for layout chrome | Use `gray-*` for structural backgrounds |
| `rounded-2xl` for cards and modals | Mix rounding styles within the same component |
| `text-xs font-semibold uppercase tracking-wider` for section labels | Use regular case for section labels |
| Explicit save only in editor | Auto-save on data changes |
| Per-route prompts in user messages | Modify the Anthropic system message |
