# Reva Website

Marketing website for Reva. Part of the Reva monorepo (`apps/website-static`).

## Tech Stack

- **Vite** — dev server and production build
- **PostHTML Components** — HTML component system (`x-` tag prefix, props, slots)
- **PostCSS** with `postcss-nested` + `postcss-custom-media` — nested CSS syntax and build-time custom media queries
- **@reva/tokens** — foundation design tokens consumed as CSS custom properties
- **Prettier** — code formatter
- **bun** — package manager and script runner

## Getting Started

```sh
# From the monorepo root
bun install
bun run dev          # Starts all apps including this one
```

## Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `bun run dev`          | Start Vite dev server            |
| `bun run build`        | Production build to `dist/`      |
| `bun run preview`      | Preview production build locally |
| `bun run format`       | Format all files with Prettier   |
| `bun run format:check` | Check formatting without writing |

## Project Structure

```
index.html                  Main page (Vite entry point)
privacy.html, terms.html    Legal pages
src/
  components/
    ui/                     Reusable UI components (button, inline-form) — <x-ui.button />
    section/                Page partials (header, hero, footer, etc.) — <x-section.hero />
  styles/
    main.css                Entry CSS (imports globals, components, sections)
    tokens/                 Local token aliases and overrides (imports @reva/tokens foundation CSS)
    globals/                Reset, base, typography, layout, utils
    components/             UI component styles (button, inline-form)
    sections/               Section styles (header, hero, footer, etc.)
public/                     Static assets (favicon, icons, images)
vite.config.js              Vite + PostHTML plugin config
postcss.config.js           PostCSS plugins (nested, custom-media)
.prettierrc                 Prettier formatter config
```

## Design Tokens

Foundation tokens (spacing, typography, radii, colors) come from `@reva/tokens` via CSS custom properties (`--reva-*`). The local `tokens/` directory contains:

- **colors.css** — imports `@reva/tokens/css/tokens-foundation.css`, defines brand aliases (`--color-brand-*`), semantic aliases (`--color-text-*`, `--color-bg`), and `color-mix()` opacity steps
- **typography.css** — font-family tokens with fallback stacks (`--font-body`, `--font-heading`, `--font-mono`)
- **breakpoints.css** — `@custom-media` definitions aligned to `@reva/tokens` breakpoints
- **radius.css** — semantic section card radius aliases (`--radius-section-card-lg/md`)
- **shadows.css** — local `--shadow-card` composite

Spacing, font sizes, font weights, line heights, letter spacings, and radii are used directly as `--reva-*` variables throughout the stylesheets.

## Accessibility

This project follows WCAG 2.1 Level AA. The approach is semantic HTML first, with ARIA attributes only where native semantics are insufficient. See `CLAUDE.md` for the full set of conventions.
