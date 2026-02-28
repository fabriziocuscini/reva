# Reva Website — Project Conventions

## Tech Stack

- **Vite** — dev server and production build
- **PostHTML Components** (`posthtml-component`) — HTML component system with `x-` tag prefix, props, slots, and yield
- **PostCSS** with `postcss-nested` + `postcss-custom-media` — nested CSS syntax and build-time custom media queries
- **Prettier** — code formatter for CSS, HTML, JS, JSON, and Markdown
- **Package manager**: bun (fallback to pnpm if compatibility issues arise)

## File Structure

```
index.html              → Main page (Vite entry point, at project root)
privacy.html            → Privacy policy page
terms.html              → Terms of service page
src/
  components/
    ui/                 → Reusable UI components (button, inline-form) — <x-ui.button />
    section/            → Page partials (header, hero, footer, vision, benefits, etc.) — <x-section.hero />
  styles/
    main.css            → Entry CSS (imports globals, components, sections)
    tokens/
      colors.css        → Color design tokens
      typography.css    → Font family, size, weight, line-height, letter-spacing tokens
      spacing.css       → Spacing design tokens
      breakpoints.css   → @custom-media breakpoint definitions (--screen-sm through --screen-2xl)
      radius.css        → Border-radius design tokens (--radius-xs through --radius-4xl, --radius-full, --radius-square)
      shadows.css       → Box-shadow design tokens
    globals/
      reset.css         → Andy Bell's "(more) Modern CSS Reset"
      base.css          → Token imports, focus, links, a11y utilities, reduced-motion
      typography.css    → Element-level text styles (h1-h6, p, small, body)
      layout.css        → Layout primitives (container, vstack, hstack)
      utils.css         → Utility classes (self-auto, self-start, self-end, self-center, self-stretch)
    components/
      button.css        → Button component styles (primary × sm, md, lg)
      inline-form.css   → Inline form component styles
    sections/
      header.css        → Site header
      hero.css          → Hero section
      vision.css        → Vision section
      benefits.css      → Benefits section
      infrastructure.css → Infrastructure section
      founding-community.css → Founding community section
      footer.css        → Site footer
      legal.css         → Legal page styles (privacy, terms)
public/                 → Static assets (favicon, icons, images)
vite.config.js          → Vite + PostHTML plugin config
postcss.config.js       → PostCSS plugins (nested, custom-media)
.prettierrc             → Prettier formatter config
```

## PostHTML Component Conventions

- Components live in `src/components/` under two groups:
  - **`ui/`** — reusable UI components (button, inline-form) → `<x-ui.button />`
  - **`section/`** — page partials (header, hero, footer) → `<x-section.hero />`
- Subfolder components use dot notation: `src/components/ui/button.html` → `<x-ui.button />`.
- Props are defined in a `<script props>` block inside the component file.
- Default content injection uses `<yield />`. Named slots use `<slot:name>` / `<fill:name>`.
- Self-closing tags are supported (`<x-section.header />`).

## CSS Conventions

- Use `postcss-nested` for nesting. Prefix nested selectors with `&`.
- Use `rem`/`em` for font sizes, never `px` for body text.
- Use typography token variables (`--font-size-*`, `--font-weight-*`, `--line-height-*`, `--letter-spacing-*`) instead of raw values in all stylesheets.
- Define design tokens as CSS custom properties in `styles/tokens/` (colors, typography, spacing, breakpoints, radius, shadows). Never declare `--*` variables in globals or section CSS files.
- Foundational element-level styles and layout primitives live in `styles/globals/`. Reusable UI component styles live in `styles/components/`. Page-level partials live in `styles/sections/`.
- Layout utilities (`.container`, `.vstack`, `.hstack`) use BEM modifiers for spacing (e.g. `.vstack--lg`) and alignment (e.g. `.hstack--center`).
- Always provide `:focus-visible` styles for interactive elements.
- Include `prefers-reduced-motion: reduce` to disable animations for users who prefer it.

## Accessibility Standard: WCAG 2.1 Level AA

- Semantic HTML first — use `<nav>`, `<main>`, `<footer>`, `<section>`, `<button>`, `<a>` for their intended purposes.
- Do not add redundant ARIA roles on native landmarks.
- One `<h1>` per page, no skipped heading levels.
- All images need `alt` attributes (empty `alt=""` for decorative images).
- Text contrast: 4.5:1 minimum (3:1 for large text).
- All interactive elements keyboard-accessible. No `tabindex > 0`.
- Skip navigation link as first focusable element.
- Form inputs must have associated `<label>` elements.

## Commands

```sh
bun run dev        # Start Vite dev server
bun run build      # Production build to dist/
bun run preview    # Preview production build
bun run format       # Format all files with Prettier
bun run format:check # Check formatting without writing
```
