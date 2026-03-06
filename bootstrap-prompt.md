# Reva Design System: Bootstrap Prompt

> **Mode:** Plan
> **Repository:** `fabriziocuscini/reva`
> **Package manager:** Bun (fallback to pnpm when Bun is incompatible)
> **Monorepo orchestration:** Turborepo
> **Figma library:** [UI Components](https://www.figma.com/design/sjFm1lXGvxLjtE59LnqFad/UI-Components?node-id=0-1&p=f&t=G3itrVTd9EQGCGpt-11) (blank canvas, page "Components")

---

## 1. Project Overview

We are building the Reva Design System: a comprehensive, multi-themeable design token and component system for a fintech wealth management platform. The system serves three purposes:

1. **Design tokens** that power both a Figma UI kit (via Tokens Studio) and code implementations across web and mobile
2. **A React component library** built on Ark UI (headless) + Panda CSS (styling), consumed by multiple applications
3. **A documentation site** that provides live examples, token references, and usage guidelines

The architecture must support **white-labelling**: Reva hosts the platform on behalf of clients (advisory firms). Each firm gets a branded environment (e.g. `portal.advisoryfirm.co.uk` routing to `client123.revaos.com`). The firm's end users never see Reva branding; they see their advisory firm's branded sign-in page and UI from the first paint. Theme switching happens at runtime: the server identifies the client tenant and loads the correct theme CSS before rendering. Every theme supports both light and dark colour modes orthogonally.

---

## 2. Monorepo Structure

```
reva/
├── apps/
│   ├── docs/                  # @reva/docs, Fumadocs + Next.js documentation site
│   ├── website-static/         # @reva/website-static, current static site (Vite + PostCSS + PostHTML)
│   ├── advisor-portal/         # @reva/advisor-portal, advisor-facing web portal
│   └── client-portal/         # @reva/client-portal, end-client web portal
│
├── packages/
│   ├── design-tokens/         # @reva/tokens, platform-agnostic token system
│   ├── panda-preset/          # @reva/panda-preset, Panda CSS preset with theme definitions
│   ├── ui/                    # @reva/ui, Ark UI + Panda CSS React component library
│   └── config/                # @reva/config, shared ESLint, Prettier, TS configs
│
├── turbo.json
├── package.json               # root workspace config
├── .prettierrc                # (via @reva/config)
├── tsconfig.base.json         # base TS config extended by all packages
└── .github/
    └── workflows/             # GitHub Actions CI/CD
```

### Future additions (do not scaffold yet, but design for them)

- `apps/website/` for the Next.js marketing site, replacing `website-static` and consuming `@reva/tokens` and `@reva/ui`
- `apps/client-app/` for React Native + Expo mobile app, consuming `@reva/tokens`
- `apps/sandbox/` or `apps/kitchen-sink/` for internal component testing and experimentation
- Additional web apps under `apps/`

---

## 3. Package Specifications

### 3.1 `@reva/tokens` (packages/design-tokens/)

**Purpose:** Platform-agnostic, multi-themeable design token system. Single source of truth for all design values across Figma, web, and eventually mobile.

**Token architecture (three layers):**

1. **Foundation tokens** (`src/foundation/`): Raw primitive values. Colour scales (with alpha variants), spacing scale, type scale, radii, shadows, border widths, z-indices, durations, easings. Named by scale step (e.g. `gray.50`, `amber.500`, `spacing.4`). **Colour foundation tokens must never be referenced directly in recipes or app code; always go through the semantic layer.** Non-colour foundation tokens (spacing, radii, borders, z-indices, durations, easings) may be referenced directly in recipes and layouts (e.g. `gap: '4'`, `rounded: 'md'`). Semantic aliases for non-colour tokens are optional and should only be introduced for repeated patterns where naming the intent adds clarity (e.g. `spacing.layout.gutter`, `spacing.inset.component`).

2. **Semantic tokens** (`src/semantic/`): Contextual role mappings that reference foundation tokens. Support light/dark mode switching. Examples: `colors.bg.surface`, `colors.fg.default`, `colors.border.default`. These are the mandatory tokens for all colour styling in Panda CSS recipes and component code. In recipe style objects, reference them without the `colors.` prefix (e.g., `bg: 'bg.surface'`) — Panda auto-maps CSS properties to token categories.

3. **Component tokens** (`src/component/`): Specific to individual components, used sparingly and only when a semantic token genuinely does not fit. Reference semantic tokens.

> **NOTE: Token naming convention is deferred.** The full naming convention, colour palettes, semantic categories (fg, bg, divider, overlay, etc.), and component token structure will be defined in a separate specification after bootstrapping. For now, use a minimal set of placeholder tokens sufficient to prove the pipeline end to end: a few foundation colours, a handful of semantic mappings, and one component token. Mark all placeholder values clearly with `// PLACEHOLDER` comments so they are easy to find and replace later.
>
> **Naming principle (apply to all placeholder tokens):** Use Panda-aligned plural namespace keys: `colors`, `spacing`, `radii`, `shadows`, `fonts`, `fontSizes`, `fontWeights`, `lineHeights`. Token names should read as a path to a specific value. Examples: `colors.neutral.50`, `colors.brand.500`, `spacing.4`, `radii.md`. This convention applies across all three layers and matches Panda CSS categories for zero-mapping between token sources and the preset.

**Source format:** Tokens Studio JSON format in `src/`. This is the authoring format synced bidirectionally with Figma Variables via the Tokens Studio plugin.

**Token workflow and source of truth:**

- Code is the source of truth for token definitions
- Token JSON files are authored in Tokens Studio format in `src/`
- Style Dictionary reads these files directly (using Tokens Studio format parser/transforms) and produces build output
- Tokens Studio plugin connects to the Git repository, syncs tokens bidirectionally, and manages Figma Variables and Collections via its built-in export functionality
- Always go code-first; do not create Figma variables manually

**Transformation pipeline:** Style Dictionary transforms source tokens into:

- W3C Design Token Community Group (DTCG) JSON format (`dist/json-dtcg/`)
- CSS custom properties (`dist/css/`)
- TypeScript constants with full type safety (`dist/ts/`)
- JSON for React Native consumption (`dist/json-mobile/`)

**Directory structure:**

```
packages/design-tokens/
├── src/
│   ├── foundation/
│   │   ├── colors.json          # Tokens Studio format
│   │   ├── spacing.json
│   │   ├── typography.json
│   │   ├── radii.json
│   │   ├── shadows.json
│   │   └── ...
│   ├── semantic/
│   │   ├── colors.json          # references foundation, has light/dark modes
│   │   ├── typography.json
│   │   └── ...
│   └── component/
│       └── ...                  # sparse, only when semantic tokens do not fit
├── config/
│   └── style-dictionary.config.ts
├── dist/                        # generated outputs (gitignored)
│   ├── json-dtcg/
│   ├── css/
│   ├── ts/
│   └── json-mobile/
├── package.json
└── tsconfig.json
```

**Key decisions:**

- Tokens Studio is the authoring tool; Style Dictionary is the build tool. They are complementary.
- Foundation tokens define the colour palette per brand. Semantic tokens map those into roles. Theme switching happens by swapping which foundation tokens the semantic layer references.
- The `dist/` folder is gitignored. Token builds are part of the Turborepo pipeline; downstream packages depend on the build output.
- Use Style Dictionary v4 with `@tokens-studio/sd-transforms` for direct reading of Tokens Studio format source files (no manual format conversion step).

---

### 3.2 `@reva/panda-preset` (packages/panda-preset/)

**Purpose:** Panda CSS preset that bridges design tokens into Panda's theme system. Defines the base Reva theme, conditions for light/dark mode, and the multi-theme infrastructure for white-labelling.

**Core responsibilities:**

- Maps `@reva/tokens` output (CSS variables or TS constants) into Panda CSS `tokens` and `semanticTokens`
- Defines conditions: `light` (`[data-color-mode=light] &`), `dark` (`[data-color-mode=dark] &`)
- Defines the base Reva theme (default)
- Defines client themes as Panda `themes` entries, each overriding tokens/semanticTokens
- Uses `defineThemeContract` to enforce structural consistency across all themes
- Exports all slot recipes and CVA recipes consumed by `@reva/ui`
- Configures global CSS, keyframes, text styles, layer styles, and patterns

**Multi-theme architecture (following Panda CSS best practices):**

The preset disables Panda's default preset (`@pandacss/preset-base`) and defines all tokens from scratch using Panda-aligned plural namespace keys. Token values are imported from `@reva/tokens/panda/tokens` and `@reva/tokens/panda/semantic-tokens` rather than hardcoded.

```typescript
// packages/panda-preset/src/index.ts
import { definePreset } from '@pandacss/dev'

export const revaPreset = definePreset({
  name: '@reva/panda-preset',
  conditions: {
    light: '[data-color-mode=light] &',
    dark: '[data-color-mode=dark] &',
  },
  theme: {
    tokens, // imported from @reva/tokens/panda/tokens
    semanticTokens, // imported from @reva/tokens/panda/semantic-tokens
    recipes: {
      /* all CVA recipes */
    },
    slotRecipes: {
      /* all slot recipes */
    },
    keyframes: {
      /* animation keyframes */
    },
    textStyles: {
      /* typography presets */
    },
  },
})
```

**Theme switching at runtime:**

Reva hosts the platform on behalf of advisory firms. Each firm gets a custom domain (e.g. `portal.advisoryfirm.co.uk`) that routes to a tenant-specific environment (e.g. `client123.revaos.com`). The firm's end users never see Reva branding. The server identifies the tenant and loads the correct theme before first paint.

Apps use Panda's generated `styled-system/themes` utilities:

```typescript
import { getTheme, injectTheme } from 'styled-system/themes'

// On tenant identification (server-side or at app init), load their theme
const theme = await getTheme(clientThemeName)
injectTheme(document.documentElement, theme)
```

For SSR (Next.js apps), inject theme CSS in `<head>` during server rendering:

```typescript
// app/layout.tsx (simplified)
const themeName = resolveClientTheme(request) // from domain/subdomain/config
const theme = themeName && (await getTheme(themeName))

<html data-panda-theme={themeName} data-color-mode="light">
  {theme && (
    <head>
      <style id={theme.id} dangerouslySetInnerHTML={{ __html: theme.css }} />
    </head>
  )}
</html>
```

Colour mode (light/dark) is orthogonal to the brand theme; set via `data-color-mode` attribute. Every theme supports both modes automatically.

**Directory structure:**

```
packages/panda-preset/
├── src/
│   ├── index.ts                 # main preset export
│   ├── tokens.ts                # token mappings from @reva/tokens
│   ├── semantic-tokens.ts       # semantic token definitions with light/dark
│   ├── conditions.ts            # light, dark, theme conditions
│   ├── recipes/                 # all recipe definitions
│   │   ├── button.ts
│   │   ├── accordion.ts
│   │   └── index.ts             # barrel export
│   ├── text-styles.ts
│   ├── keyframes.ts
│   ├── global-css.ts
│   └── themes/                  # client theme overrides
│       ├── contract.ts          # defineThemeContract
│       └── index.ts             # barrel export of all themes
├── package.json
└── tsconfig.json
```

---

### 3.3 `@reva/ui` (packages/ui/)

**Purpose:** React + TypeScript component library. Headless behaviour from Ark UI, styled via Panda CSS slot recipes from the preset.

**Architecture (three-layer component pattern):**

1. **Recipe** (defined in `@reva/panda-preset`): `defineSlotRecipe` or `cva` defining slots, base styles, variants, compound variants. Slots derived from Ark UI anatomy via `anatomyKeys()`.

2. **Styled wrapper** (in `@reva/ui`): Uses Panda `styled(ark.<element>, recipe)` for single-element components (Button, Badge, Input); uses `createStyleContext` for compound components (Accordion, Dialog). No style logic here, just wiring.

3. **Consumer component** (optional, in `@reva/ui`): Simplified API on top of the styled wrapper for common use cases.

**Key rules:**

- Always import anatomy from `@ark-ui/react/anatomy`, never from the main entrypoint
- Use `anatomyKeys()` for slot names; never hardcode them
- Semantic colour tokens only for all colour values in recipes (never colour foundation tokens, never raw colour values). Non-colour foundation tokens (spacing, radii, borders, etc.) may be used directly.
- Use Panda CSS data-attribute conditions (`_open`, `_closed`, `_disabled`, `_highlighted`, etc.) for interactive states
- `cva` for single-element components; `defineSlotRecipe` / `sva` for multi-part components
- Export variant types via `RecipeVariantProps` for type-safe component props
- Use `forwardRef` on all leaf parts that render DOM elements
- Ark UI manages all ARIA, keyboard navigation, and focus management; do not duplicate

**File structure per component:**

```
packages/ui/src/
├── components/
│   ├── accordion/
│   │   ├── index.tsx              # styled wrappers + namespace export
│   │   └── accordion.test.tsx     # Playwright component test
│   ├── button/
│   │   ├── index.tsx
│   │   └── button.test.tsx
│   └── ...
├── utils/
│   └── create-style-context.tsx   # style distribution utility
├── index.ts                       # public API barrel export
├── panda.config.ts                # extends @reva/panda-preset
├── package.json
└── tsconfig.json
```

**Panda config for this package:**

```typescript
import { defineConfig } from '@pandacss/dev'
import { revaPreset } from '@reva/panda-preset'

export default defineConfig({
  presets: [revaPreset], // no @pandacss/preset-base; revaPreset owns all tokens
  include: ['./src/**/*.{ts,tsx}'],
  outdir: 'styled-system',
  jsxFramework: 'react',
})
```

---

### 3.4 `@reva/config` (packages/config/)

**Purpose:** Single source of truth for code quality tooling across all packages and apps.

**Exports:**

- ESLint flat config with the following plugins:
  - `@typescript-eslint/eslint-plugin` + `typescript-eslint/parser` (TypeScript-aware linting, strict mode, no-any)
  - `@pandacss/eslint-plugin` (enforces token usage, catches raw CSS values in recipes, validates Panda patterns)
  - `eslint-plugin-react` + `eslint-plugin-react-hooks` (React best practices, rules-of-hooks)
  - `eslint-plugin-jsx-a11y` (accessibility linting for JSX, complements Ark UI's built-in ARIA)
  - `eslint-plugin-simple-import-sort` (consistent import ordering across all packages)
- Prettier config:
  ```json
  {
    "semi": false,
    "singleQuote": true,
    "trailingComma": "all",
    "useTabs": false,
    "tabWidth": 2,
    "printWidth": 100,
    "bracketSpacing": true,
    "arrowParens": "always",
    "endOfLine": "lf",
    "plugins": ["prettier-plugin-organize-imports"]
  }
  ```
- Base `tsconfig.json` settings

All other packages and apps extend these configs rather than defining their own.

---

### 3.5 `@reva/docs` (apps/docs/)

**Purpose:** Documentation site built with Fumadocs + Next.js.

**Content:**

- Component documentation pages (props, variants, usage examples, live previews)
- Token reference pages (colour palettes, spacing scale, typography, etc.)
- Design guidelines and patterns
- Theme customisation guide

**Structure:**

```
apps/docs/
├── app/
│   ├── docs/
│   │   └── [[...slug]]/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── content/
│   └── docs/
│       ├── components/
│       │   ├── accordion.mdx
│       │   ├── button.mdx
│       │   └── ...
│       ├── tokens/
│       │   ├── colours.mdx
│       │   ├── spacing.mdx
│       │   └── ...
│       ├── guides/
│       │   └── theming.mdx
│       └── index.mdx
├── lib/
│   └── source.ts
├── source.config.ts
├── next.config.mjs
├── panda.config.ts               # extends @reva/panda-preset for docs styling
├── package.json
└── tsconfig.json
```

---

### 3.6 Website apps

**`@reva/website-static` (apps/website-static/):** The current marketing website. A purely static HTML + CSS site built with Vite + PostCSS + PostHTML. Do not scaffold this app; the existing project will be copied into this directory manually. Once `@reva/tokens` is bootstrapped and producing CSS custom properties, the first integration task will be to remove all local CSS variables from `website-static` and reference the distributed tokens from `@reva/tokens` instead. This serves as an early validation of the token pipeline.

**`@reva/website` (apps/website/):** The future marketing website, to be built later as a Next.js app consuming `@reva/tokens` and `@reva/ui`. Do not scaffold now.

### 3.7 `@reva/advisor-portal` (apps/advisor-portal/) and `@reva/client-portal` (apps/client-portal/)

**Purpose:** The two main web applications. `advisor-portal` is the advisor-facing portal; `client-portal` is the end-client facing portal (the one that gets white-labelled per advisory firm).

Scaffold both as Vite + React + TypeScript apps initialised as Panda CSS projects (ref: https://panda-css.com/docs/installation/vite). Each app:

- Uses `@reva/panda-preset` as its Panda CSS preset (no default preset)
- Depends on `@reva/ui` for components
- Extends `@reva/config` for ESLint, Prettier, and TypeScript configuration

---

## 4. Turborepo Pipeline

```jsonc
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "styled-system/**", ".next/**", ".fumadocs/**"],
    },
    "dev": {
      "dependsOn": ["^build"],
      "persistent": true,
      "cache": false,
    },
    "lint": {
      "dependsOn": ["^build"],
    },
    "test": {
      "dependsOn": ["build"],
    },
    "typecheck": {
      "dependsOn": ["^build"],
    },
    "tokens:build": {
      "dependsOn": [],
      "outputs": ["dist/**"],
    },
    "codegen": {
      "dependsOn": ["^build"],
      "outputs": ["styled-system/**"],
    },
  },
}
```

**Build order (enforced by `dependsOn: ["^build"]`):**

1. `@reva/tokens` builds first (Style Dictionary transforms)
2. `@reva/panda-preset` builds next (depends on token output)
3. `@reva/ui` builds next (Panda codegen using preset, then component compilation)
4. Apps build last (depend on `@reva/ui` and `@reva/panda-preset`)

---

## 5. Infrastructure

### CI/CD (GitHub Actions)

- **On PR:** lint, typecheck, build all packages, run Playwright tests
- **On merge to main:** build + deploy docs to Vercel, deploy website to Vercel

### Package builds

- **tsdown** for building all TypeScript packages (`@reva/tokens`, `@reva/panda-preset`, `@reva/ui`, `@reva/config`). Handles dual CJS/ESM output, `.d.ts` generation, and tree-shaking.

### Versioning and releases

- **Changesets** (`@changesets/cli`) for version management and changelog generation across the monorepo. Each PR that changes a package includes a changeset describing the change. On merge, Changesets handles version bumps, changelog updates, and npm publishing (when ready).

### Deployment

- Vercel for `@reva/docs` and `@reva/website`
- Vercel or custom infrastructure for client apps

### Testing

- **Playwright** for end-to-end and component testing
- Test files co-located with components (e.g. `button.test.tsx`)
- Playwright config at repository root

---

## 6. MCP Servers and Reference Sources

### Installed MCP Servers

The following MCP servers are installed in this project. **Always use these instead of web search** when looking up API details, usage patterns, or implementation guidance.

**Core framework servers (use for all API and implementation questions):**

- **Panda CSS MCP** (https://panda-css.com/docs/ai/mcp-server): Token definitions, recipe APIs, conditions, theme configuration, utilities. Always consult this for any Panda CSS question.
- **Ark UI MCP** (https://ark-ui.com/docs/ai/mcp-server): Component APIs, anatomy definitions, accessibility features, keyboard navigation, state management. This is the backbone of every component; always consult it first when implementing a new component.

**Design tool servers:**

- **Figma MCP** (official): For **read operations** only. Fetching design context, reading variables, getting screenshots, understanding file structure. Tools: `Figma:get_design_context`, `Figma:get_variable_defs`, `Figma:get_metadata`, `Figma:get_screenshot`.
- **Figma Console MCP**: For **write operations** only. Creating components with variants, editing variables, setting text, modifying fills/strokes, creating styles. Tools: `figma-console:figma_execute`, `figma-console:figma_create_child`, `figma-console:figma_set_text`, `figma-console:figma_set_fills`, `figma-console:figma_instantiate_component`, etc.

**Reference and inspiration servers:**

- **Chakra UI MCP** (https://chakra-ui.com/docs/get-started/ai/mcp-server): Use for **inspiration** when building components. Chakra UI is a strong reference because it is powered by Ark UI under the hood and follows the same API conventions (same core team behind Chakra, Ark UI, Panda CSS, Zag.js, and Park UI). However, Chakra uses Emotion for styling, not Panda CSS, so adapt styling patterns accordingly. Also consult their AI-friendly docs at https://chakra-ui.com/docs/get-started/ai/llms for component context, usage, and implementation guidance.

**Workspace servers:**

- **Notion MCP**: For reading project notes, brand documentation, specs, and briefs shared by the designer.
- **GitHub MCP** (if installed): For repository management, issues, and pull requests.

### Reference Hierarchy for Component Implementation

When building a component, consult sources in this order:

1. **Ark UI MCP/docs**: Primary source for component API, anatomy, accessibility, and state management. Every component is built on Ark UI.
2. **Panda CSS MCP/docs**: Primary source for styling API, token usage, recipe patterns, and theme configuration.
3. **Chakra UI MCP/docs**: Inspiration for component design, variant naming, prop APIs, and overall developer experience. Adapt styling from Emotion to Panda CSS.
4. **Park UI components** (https://park-ui.com): Reference for the `styled()` pattern and component structure. Follow their styled-primitive approach for single-element components. Do NOT follow their styling approach as it uses the Radix colour system, which differs from our colour architecture.
5. **Installed project skill ("ui-component-patterns")**: Definitive rules for our specific patterns (`styled()` for single-element, `createStyleContext` for compound, slot recipes, token usage rules, etc.).

### Important Rules

- **Never web search for Panda CSS, Ark UI, or Chakra UI questions** when MCP servers are available. Use the MCP servers first.
- When an MCP server does not have the answer, consult the framework's official documentation directly.
- Chakra UI is for **inspiration**, not direct copying. Always translate patterns to our Panda CSS + Ark UI stack.
- Park UI is for **architecture** reference only, not styling.

---

## 7. Component Creation Workflow

When creating a new component, follow this complete workflow:

### Step 1: Read tokens

Read all related design tokens from `@reva/tokens` that the component will need (colours, spacing, typography, radii, shadows, interactive states).

### Step 2: Create in Figma

Using the Figma MCP servers (see section 6 for which server handles reads vs writes), create the component in the Figma library with all variants matching the recipe variants (size, variant, state combinations).

### Step 3: Implement the recipe

In `@reva/panda-preset`, create the slot recipe (or CVA for single-element components):

- Import anatomy from `@ark-ui/react/anatomy`
- Use `anatomyKeys()` for slots
- Use semantic tokens for all colour values (never reference colour foundation tokens directly). Non-colour foundation tokens (spacing, radii, borders, etc.) may be used directly.
- Define all variants (variant, size) and compound variants
- Set sensible `defaultVariants`

### Step 4: Implement the React component

In `@reva/ui`:

- Single-element: use `styled(ark.<element>, recipe)` from `styled-system/jsx`
- Compound: use `createStyleContext` to wire slot recipe classes to Ark UI parts
- Export as namespace (e.g. `Accordion.Root`, `Accordion.Item`)
- Export variant types via `RecipeVariantProps`
- Add `forwardRef` to leaf parts

### Step 5: Write the docs page

In `@reva/docs`, create an MDX page under `content/docs/components/`:

- Component description and use cases
- Props table (derived from TypeScript types)
- Variant examples
- Accessibility notes (what Ark UI handles automatically)
- Do's and don'ts

### Step 6: Test

Write a Playwright component test covering:

- Default rendering
- All variant combinations
- Interactive states (open/close, hover, focus, disabled)
- Keyboard navigation (verify Ark UI handles it correctly)

---

## 8. Coding Standards

### TypeScript

- Strict mode everywhere
- No `any` types; use `unknown` with type guards when necessary
- Derive types from recipes and Ark UI props; avoid manual type duplication
- Path aliases configured in `tsconfig.json` per package

### Styling

- Zero raw CSS values in recipes (no `'#1a1a1a'`, no `'14px'`, no `'8px'`)
- Colour foundation tokens never referenced in recipes or app code; always use the semantic colour layer
- Non-colour foundation tokens (spacing, radii, borders, etc.) may be referenced directly in recipes
- Semantic tokens are the mandatory API boundary for all colour styling
- Component tokens used sparingly and must reference semantic tokens
- Panda CSS conditions for all interactive states (never custom CSS selectors for data attributes Panda already supports)

### Component patterns

- Anatomy-first: always derive slots from Ark UI anatomy
- Compound component pattern with namespace exports
- `styled()` for single-element, `createStyleContext` for compound; no prop drilling of classNames
- Ark UI owns ARIA, keyboard nav, focus; never re-implement
- `forwardRef` on all DOM-rendering parts
- `cva` for single-element components; `defineSlotRecipe` for multi-part

### File naming

- kebab-case for directories and files
- PascalCase for component exports
- camelCase for functions, variables, recipe names

---

## 9. Bootstrap Steps

Execute these phases **one at a time**. After completing each phase, stop and report what was done, what succeeded, and any issues encountered. Wait for my explicit approval before starting the next phase. Do not proceed to Phase N+1 until I confirm Phase N is good.

### Phase 1: Repository scaffolding

1. Initialise the Turborepo monorepo with Bun
2. Create the workspace structure (`apps/`, `packages/`)
3. Set up `@reva/config` with shared ESLint, Prettier, and base TypeScript configs
4. Configure `turbo.json` with the task pipeline
5. Set up root `package.json` with workspace scripts
6. Install and initialise Changesets (`@changesets/cli`) for versioning
7. Install tsdown as a shared dev dependency for package builds

### Phase 2: Design tokens

1. Scaffold `@reva/tokens` package
2. Create minimal placeholder foundation tokens in Tokens Studio format (a small neutral grey scale, one brand colour scale, basic spacing, one type scale, radii, one shadow). Mark all values with `// PLACEHOLDER` comments
3. Create minimal placeholder semantic token mappings with light/dark mode support (enough to style a Button component: fg, bg, border, brand colours)
4. Configure Style Dictionary v4 with `@tokens-studio/sd-transforms` and output transforms for CSS, TypeScript, W3C DTCG JSON, and React Native JSON
5. Verify the build pipeline produces correct output in `dist/`
6. The full token naming convention and palettes will be provided in a follow-up specification

### Phase 3: Panda CSS preset

1. Scaffold `@reva/panda-preset` package
2. Map token output into Panda `tokens` and `semanticTokens`
3. Define conditions (light/dark)
4. Set up `defineThemeContract` for theme consistency
5. Create initial recipes (start with Button as the first component)
6. Configure text styles and keyframes
7. Export the preset

### Phase 4: Component library

1. Scaffold `@reva/ui` package
2. Set up `panda.config.ts` extending `@reva/panda-preset`
3. Create `createStyleContext` utility
4. Build the first component (Button) following the full three-layer pattern
5. Set up barrel exports
6. Verify the component renders correctly in a test app

### Phase 5: Documentation site

1. Scaffold `@reva/docs` with Fumadocs + Next.js
2. Configure `source.config.ts` and content source
3. Create the first component doc page (Button)
4. Create a token reference page
5. Verify the docs site builds and renders

### Phase 6: Apps

1. Scaffold `@reva/advisor-portal` as a Vite + React + TS app, initialised as a Panda CSS project (ref: https://panda-css.com/docs/installation/vite) with `@reva/panda-preset` as the preset and `@reva/ui` as a dependency
2. Scaffold `@reva/client-portal` as a Vite + React + TS app with the same Panda CSS + preset + `@reva/ui` setup
3. Both apps extend `@reva/config` for ESLint, Prettier, and TypeScript configuration
4. Verify both apps build and can render components from `@reva/ui` with correct theming
5. Note: `@reva/website-static` is not scaffolded; the existing static site will be copied into `apps/website-static/` manually. `@reva/website` (Next.js) will be built later.

### Phase 7: CI/CD

1. Create GitHub Actions workflow for PR checks (lint, typecheck, build, test)
2. Create Changesets GitHub Action for automated version PRs and release publishing
3. Create Vercel deployment configuration for docs and website
4. Set up Playwright configuration at repo root

### Phase 8: Author CLAUDE.md

Once all previous phases are complete and verified, distil this bootstrap prompt into a concise `CLAUDE.md` file at the repository root. This file serves as the persistent reference for all future development work in the project. It should be prescriptive and compact, not explanatory. Include:

1. Project structure overview (packages, apps, their purposes)
2. Token usage rules (colour tokens always via semantic layer; non-colour foundation tokens allowed directly; Panda-aligned plural namespace)
3. Component creation checklist (condensed version of the workflow in section 7)
4. MCP server usage (which server for which task, reference hierarchy)
5. Coding standards (naming, imports, formatting, linting)
6. Key architectural decisions (runtime theming, no default Panda preset, Ark UI anatomy-first)
7. Any gotchas or adjustments discovered during the bootstrap process

---

## 10. Project Skills

Two Claude Code skills are installed in `.claude/skills/`. These are project-specific reference documents that Claude Code will auto-invoke based on context. Read the relevant skill before starting any related work.

### `ui-component-patterns`

Covers component implementation with Ark UI + Panda CSS. Auto-invoked when creating, editing, or reviewing any component, recipe, or styled wrapper.

Key rules enforced by this skill:

- Anatomy-first approach: import from `@ark-ui/react/anatomy`, use `.keys()` for slots
- `styled(ark.<element>, recipe)` for single-element components (north star, Park UI pattern)
- `createStyleContext` for distributing slot recipe classes to compound component parts
- Data-attribute conditions (`_open`, `_closed`, `_disabled`, `_highlighted`, `_checked`, `_focus`, `_invalid`) for interactive state styling
- Three-layer token architecture: colour foundation tokens never in recipes (always use semantic layer), non-colour foundation tokens (spacing, radii, etc.) may be used directly, component tokens sparingly
- Panda-aligned plural token namespace (`colors`, `radii`, `shadows`, `fonts`, `fontSizes`, `fontWeights`, `lineHeights`, `spacing`)
- Role-based variant naming (`solid`, `outline`, `ghost`), never visual-description naming
- `cva` for single-element components, `defineSlotRecipe` for multi-part
- Export `RecipeVariantProps` types for type-safe props
- Ark UI owns all ARIA, keyboard navigation, and focus management
- Forbidden patterns: inline styles on Ark parts, hardcoded classNames, raw CSS values in recipes, colour foundation tokens in recipes, importing recipes from source instead of `styled-system/recipes`, using Panda's default preset alongside `@reva/panda-preset`

### `tokens-studio-authoring`

Covers design token JSON authoring in the Tokens Studio W3C DTCG format. Auto-invoked when creating, editing, or reviewing any `.json` token source file.

Key rules enforced by this skill:

- Always use `$`-prefixed keys (`$value`, `$type`, `$description`), never legacy unprefixed format
- `$type` can be declared at group level and is inherited by children
- Dimensions require units (`"16px"`, not `16`); only `number` type accepts unitless values
- Composite token properties use camelCase (`fontFamily`, not `font-family`)
- Shadow `type` must be `"dropShadow"` or `"innerShadow"`, nothing else
- Boolean tokens use string values (`"true"`, `"false"`), not JSON literals
- References use curly brace dot-notation (`{color.amber.500}`), work across token sets
- Every new token set file must be added to `$metadata.json` and relevant themes in `$themes.json`
- No circular references, no trailing commas, no comments in source JSON
- Prefer official W3C DTCG types over Tokens Studio unofficial types for new tokens
