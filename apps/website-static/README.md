# Reva Website

Marketing website for Reva.

## Tech Stack

- **Vite** — dev server and production build
- **PostHTML Components** — HTML component system (`x-` tag prefix, props, slots)
- **PostCSS** with `postcss-nested` — nested CSS syntax
- **Prettier** — code formatter
- **bun** — package manager and script runner

## Getting Started

```sh
git clone git@github.com:fabriziocuscini/reva-website.git
cd reva-website
bun install
bun run dev
```

## Scripts

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `bun run dev`         | Start Vite dev server               |
| `bun run build`       | Production build to `dist/`         |
| `bun run preview`     | Preview production build locally    |
| `bun run format`       | Format all files with Prettier      |
| `bun run format:check` | Check formatting without writing    |

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
    tokens/                 Design tokens (colors, typography, spacing, breakpoints, radius, shadows)
    globals/                Reset, base, typography, layout, utils
    components/             UI component styles (button, inline-form)
    sections/               Section styles (header, hero, footer, etc.)
public/                     Static assets (favicon, icons, images)
vite.config.js              Vite + PostHTML plugin config
postcss.config.js           PostCSS plugins (nested, custom-media)
.prettierrc                 Prettier formatter config
```

## Accessibility

This project follows WCAG 2.1 Level AA. The approach is semantic HTML first, with ARIA attributes only where native semantics are insufficient. See `.cursor/rules/accessibility.mdc` and `CLAUDE.md` for the full set of conventions.
