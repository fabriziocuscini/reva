# CLAUDE.md

## Project Overview

Reva is a design system, component library, and application platform for AI-enabled wealth management infrastructure. This is a monorepo managed with Turborepo and Bun.

## Tech Stack

- **Monorepo**: Turborepo
- **Package manager**: Bun (`bun install`, `bun run build`, `bun run dev`)
- **Language**: TypeScript (strict mode)
- **Components**: Ark UI (headless) + Panda CSS (styling)
- **Design tokens**: Tokens Studio (DTCG format) → Style Dictionary v4 → CSS / TS / W3C JSON / React Native
- **Web framework**: Next.js, Vite, React
- **Mobile**: React Native + Expo
- **Documentation**: Fumadocs (Next.js)
- **Testing**: Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## Repository Structure

```
reva/
├── apps/
│   ├── docs/                  # @reva/docs — Fumadocs + Next.js documentation site
│   ├── website/               # @reva/website — Marketing website (Next.js)
│   ├── advisor-portal/        # @reva/advisor-portal — Advisor-facing web portal
│   ├── client-portal/         # @reva/client-portal — End-client web portal (white-labelled)
│   └── client-app/            # @reva/client-app — End-client mobile app (React Native + Expo)
├── packages/
│   ├── design-tokens/         # @reva/tokens — Platform-agnostic, multi-themeable design tokens
│   ├── panda-preset/          # @reva/panda-preset — Panda CSS preset, themes, recipes
│   ├── components/            # @reva/ui — React component library
│   └── config/                # @reva/config — Shared ESLint, Prettier, TS configs
└── turbo.json
```

## Package Details

- **@reva/tokens** (`packages/design-tokens`): Authored in Tokens Studio format, transformed via Style Dictionary into CSS, TypeScript, W3C JSON, and React Native outputs.
- **@reva/panda-preset** (`packages/panda-preset`): Bridges design tokens into the Panda CSS styling system. Manages base theme, client themes (white-labelling), light/dark mode conditions, and all component recipes.
- **@reva/ui** (`packages/components`): Anatomy-first, fully typed, accessible-by-default React components built on Ark UI and Panda CSS.
- **@reva/config** (`packages/config`): Shared ESLint, Prettier, and TypeScript configurations used across all packages and apps.

## Common Commands

```bash
bun install        # Install dependencies
bun run build      # Build all packages
bun run dev        # Start development
```

## Key Concepts

- **White-labelling**: The client-portal and client-app support per-advisory-firm theming via the design token and Panda CSS preset system.
- **Anatomy-first components**: Components in @reva/ui follow Ark UI's anatomy pattern with slot-based styling via Panda CSS recipes.
- **Multi-theme tokens**: Design tokens support a base theme plus client themes, with light/dark mode conditions handled at the preset level.

## Licence

Proprietary. All rights reserved.
