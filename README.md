# Reva

Design system, component library, and application platform for Reva, an AI-enabled wealth management infrastructure.

## Overview

This monorepo contains the full Reva design system and product platform:

- **`packages/design-tokens`** (`@reva/tokens`): Platform-agnostic, multi-themeable design token system. Authored in Tokens Studio format, transformed via Style Dictionary into CSS, TypeScript, W3C JSON, and React Native outputs.
- **`packages/panda-preset`** (`@reva/panda-preset`): Panda CSS preset bridging design tokens into the styling system. Manages base theme, client themes (white-labelling), light/dark mode conditions, and all component recipes.
- **`packages/components`** (`@reva/ui`): React component library built on Ark UI (headless) and Panda CSS (styling). Anatomy-first, fully typed, accessible by default.
- **`packages/config`** (`@reva/config`): Shared ESLint, Prettier, and TypeScript configurations.
- **`apps/docs`** (`@reva/docs`): Documentation site built with Fumadocs and Next.js.
- **`apps/website`** (`@reva/website`): Marketing and company website (Next.js).
- **`apps/advisor-portal`** (`@reva/advisor-portal`): Advisor-facing web portal.
- **`apps/client-portal`** (`@reva/client-portal`): End-client web portal (white-labelled per advisory firm).

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Package manager | Bun |
| Components | Ark UI + Panda CSS |
| Language | TypeScript (strict) |
| Design tokens | Tokens Studio + Style Dictionary v4 |
| Web framework | React, Next.js, Vite |
| Documentation | Fumadocs |
| Testing | Playwright |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

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
│   ├── website/               # Marketing website
│   ├── advisor-portal/        # Advisor web portal
│   └── client-portal/         # Client web portal (white-labelled)
├── packages/
│   ├── design-tokens/         # Design token system
│   ├── panda-preset/          # Panda CSS preset and themes
│   ├── components/            # React component library
│   └── config/                # Shared lint, format, TS configs
└── turbo.json
```

## Licence

Proprietary. All rights reserved.
