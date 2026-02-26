# Reva

Design system, component library, and application platform for Reva, an AI-enabled wealth management infrastructure.

## Overview

This monorepo contains the full Reva design system and product platform:

- **`packages/design-tokens`** (`@reva/tokens`): Platform-agnostic, multi-themeable design token system. Authored in Tokens Studio format, transformed via Style Dictionary into CSS, TypeScript, W3C JSON, and React Native outputs.
- **`packages/panda-preset`** (`@reva/panda-preset`): Panda CSS preset bridging design tokens into the styling system. Manages base theme, client themes (white-labelling), light/dark mode conditions, and all component recipes.
- **`packages/ui`** (`@reva/ui`): React component library built on Ark UI (headless) and Panda CSS (styling). Anatomy-first, fully typed, accessible by default.
- **`packages/config`** (`@reva/config`): Shared ESLint, Prettier, and TypeScript configurations.
- **`apps/docs`** (`@reva/docs`): Documentation site built with Fumadocs and Next.js.
- **`apps/reva-website`** (`@reva/website-static`): Current static marketing site (Vite + PostCSS + PostHTML). Will adopt `@reva/tokens` CSS custom properties once the token package is published.
- **`apps/advisor-portal`** (`@reva/advisor-portal`): Advisor-facing web portal (Vite + React). Scaffolded, in development.
- **`apps/client-portal`** (`@reva/client-portal`): End-client web portal, white-labelled per advisory firm (Vite + React). Scaffolded, in development.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Package manager | Bun |
| Components | Ark UI + Panda CSS |
| Language | TypeScript (strict) |
| Design tokens | Tokens Studio + Style Dictionary v4 |
| Package builds | tsdown |
| Web framework | React, Next.js, Vite |
| Mobile | React Native + Expo (future) |
| Documentation | Fumadocs |
| Testing | Playwright |
| CI/CD | GitHub Actions |
| Deployment | Vercel |
| Versioning | Changesets |

## Getting Started

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Start development
bun run dev
```

## Project Structure

```
reva/
├── apps/
│   ├── docs/                  # Documentation site
│   ├── reva-website/           # Current static marketing site
│   ├── advisor-portal/        # Advisor web portal
│   └── client-portal/         # Client web portal (white-labelled)
├── packages/
│   ├── design-tokens/         # Design token system
│   ├── panda-preset/          # Panda CSS preset and themes
│   ├── ui/                    # React component library
│   └── config/                # Shared lint, format, TS configs
└── turbo.json
```

## Current Status

The design system foundation is in place: tokens, Panda CSS preset, and the docs site are functional. The UI component library currently ships Button, with more components to follow. Portal apps are scaffolded as minimal placeholders. CI/CD pipelines, end-to-end testing (Playwright), and deployment configuration (Vercel) are planned but not yet set up.

## Licence

Proprietary. All rights reserved.
