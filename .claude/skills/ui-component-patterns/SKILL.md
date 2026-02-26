---
name: ui-component-patterns
description: Component implementation patterns for the Reva design system using Ark UI + Panda CSS. Covers token architecture (Panda plural namespace, three-layer system), the styled() pattern for single-element components (Park UI approach), slot recipes and createStyleContext for compound components, data-attribute conditions, variant conventions, file structure across @reva/panda-preset and @reva/ui, and forbidden patterns. Auto-invoke when creating, editing, or reviewing any component, recipe, or styled wrapper.
---

# Reva Component Patterns: Ark UI + Panda CSS

## Stack

- **Component primitives:** `@ark-ui/react` (headless, state-machine powered via Zag.js)
- **Styling:** Panda CSS (`defineSlotRecipe`, `cva`, design tokens, Panda plural namespace)
- **Language:** TypeScript (strict mode)
- **Framework:** React 18+
- **Context:** Turborepo monorepo with `@reva` scoped packages

## Where Things Live

Recipes and styled components are split across two packages:

| What                               | Where                                 | Why                                                            |
| ---------------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| Slot recipes, CVA recipes          | `packages/panda-preset/src/recipes/`  | Part of the Panda CSS preset, shared across all consuming apps |
| Styled wrappers, namespace exports | `packages/ui/src/components/`         | Wire recipes to Ark UI via `styled()` or `createStyleContext`  |
| `styled()`                         | `styled-system/jsx` (Panda-generated) | Single-element: `styled(ark.<element>, recipe)`                 |
| `createStyleContext` utility       | `packages/ui/src/utils/`              | Compound components: distributes slot recipe classes           |
| Design tokens (source)             | `packages/design-tokens/src/`         | Tokens Studio JSON format, code is source of truth             |

Recipes via `styled-system/recipes`, `styled()` via `styled-system/jsx` (both Panda-generated). Never import recipes from preset source.

---

## MCP Servers: Always Use Before Web Search

When implementing components, always consult MCP servers in this order before resorting to web search:

1. **Ark UI MCP** (https://ark-ui.com/docs/ai/mcp-server): Component APIs, anatomy, accessibility, state management. The backbone of every component.
2. **Panda CSS MCP** (https://panda-css.com/docs/ai/mcp-server): Token definitions, recipe APIs, conditions, theme configuration, utilities.
3. **Chakra UI MCP** (https://chakra-ui.com/docs/get-started/ai/mcp-server): Inspiration for component design, variant naming, prop APIs. Adapt styling from Emotion to Panda CSS.
4. **Park UI** (https://park-ui.com): Reference for the `styled()` pattern and `createStyleContext` wiring. Follow their component API and architecture (styled primitives, context for compound components). Do NOT follow their styling approach (they use the Radix colour system).

---

## Core Mental Model

Ark UI components are **compound components** built on Zag.js state machines. They are completely unstyled. Every component exposes a set of **anatomy parts** (e.g. `root`, `trigger`, `content`, `item`) that map directly to DOM elements via `data-scope` and `data-part` attributes.

Panda CSS **slot recipes** (`defineSlotRecipe`) are the canonical way to style multi-part components. One slot recipe per Ark UI component. The slots list mirrors the component's anatomy exactly.

The three layers of every component are:

1. **Recipe** (in `@reva/panda-preset`): defines slots, base styles, variants, defaultVariants
2. **Styled wrapper** (in `@reva/ui`): wires recipe to Ark UI. Use `styled(ark.<element>, recipe)` for single-element components; use `createStyleContext` for compound components with slot recipes
3. **Consumer component** (optional, in `@reva/ui`): simplified API on top of the styled wrapper

---

## Anatomy-First Approach

Always import anatomy from `@ark-ui/react/anatomy`, not from the main entrypoint.
Use `anatomy.keys()` to populate `slots` so they stay in sync with the library.

Always check via the **Ark UI MCP server** for the complete and up-to-date slot list before writing a new recipe. Anatomy keys are the source of truth.

```typescript
// packages/panda-preset/src/recipes/accordion.ts
import { accordionAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const accordion = defineSlotRecipe({
  className: "accordion",
  slots: accordionAnatomy.keys(), // always derive from anatomy, never hardcode
  base: {
    root: { width: "full" },
    item: { borderBottomWidth: "1px", borderColor: "border.default" },
    itemTrigger: {
      display: "flex",
      width: "full",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      py: "4",
      textStyle: "sm",
      fontWeight: "medium",
    },
    itemContent: {
      overflow: "hidden",
      _open: { animation: "slideDown" },
      _closed: { animation: "slideUp" },
    },
  },
  variants: {
    variant: {
      subtle: {
        item: { borderColor: "border.subtle" },
      },
    },
  },
  defaultVariants: {
    variant: "subtle",
  },
});
```

---

## Token Architecture

The token system has three layers. Each layer has strict rules about where it can be used.

**Token source files use Panda-aligned plural namespace keys:** `colors`, `spacing`, `radii`, `shadows`, `fonts`, `fontSizes`, `fontWeights`, `lineHeights`. This convention matches Panda CSS categories exactly, eliminating namespace mapping between token sources and the preset.

**In recipes and style objects**, Panda's utility system auto-maps CSS properties to token categories. So you write `bg: 'bg.surface'` (not `bg: 'colors.bg.surface'`) — the `bg` utility knows to look in `colors`. The `colors.` prefix is only used in DTCG source `$value` reference strings.

### Foundation layer

Raw values, no semantics, named by scale step.
Examples: `colors.neutral.50`, `colors.neutral.900`, `colors.brand.500`, `spacing.4`, `radii.md`.
Lives in `packages/design-tokens/src/foundation/`.

**Colour foundation tokens:** NEVER referenced in recipes or app code. Always go through the semantic layer.

**Non-colour foundation tokens** (spacing, radii, borders, shadows, z-indices, durations, easings): MAY be referenced directly in recipes and app code. These do not change between themes or colour modes, so direct usage is safe and keeps things simple.

### Semantic layer

Maps foundation tokens to roles, supports light/dark mode switching.
Examples: `colors.fg.default`, `colors.fg.subtle`, `colors.bg.surface`, `colors.border.default`, `colors.brand.solid`, `colors.status.error`.
Lives in `packages/design-tokens/src/semantic/`.

**Mandatory for all colour styling.** These are the only colour tokens used in recipes. In recipe style objects, reference them without the `colors.` prefix (e.g., `color: 'fg.default'`, `bg: 'bg.surface'`).

### Component layer

Component-specific overrides, used sparingly.
Examples: `component.button.primary.solid.bg`, `component.input.border.focus`.
Only create component-layer tokens when a semantic token genuinely does not fit. Must reference semantic tokens.

```typescript
// Correct: semantic colour tokens + direct foundation non-colour tokens
// Note: no 'colors.' prefix needed — Panda auto-maps CSS properties to categories
itemTrigger: {
  color: 'fg.default',
  bg: 'bg.surface',
  borderColor: 'border.default',
  py: '4',             // spacing foundation token (direct, allowed)
  rounded: 'md',       // radius foundation token (direct, allowed)
  textStyle: 'sm',     // typography token
  _open: { color: 'brand.solid' },
  _disabled: { color: 'fg.disabled', opacity: 0.5 },
  _invalid: { borderColor: 'status.error' },
}

// NEVER: raw CSS values in recipes
color: '#1a1a1a'
bg: 'white'
fontSize: '14px'
borderRadius: '8px'

// NEVER: colour foundation tokens in recipes
color: 'neutral.900'
bg: 'neutral.50'
borderColor: 'brand.200'
```

Light/dark mode switching is handled entirely at the semantic layer via CSS custom properties. Component recipes never contain conditional dark mode logic. A token like `bg: 'bg.surface'` resolves to the correct value for the active mode automatically.

---

## Style Context Pattern (Compound Components Only)

Use `createStyleContext` to distribute slot recipe classes to compound component parts without prop drilling. This pattern applies **only** to multi-part components (Accordion, Dialog, Menu, etc.). For single-element components, use the `styled()` pattern instead. The pattern is informed by Park UI's architecture, but Park UI is a reference for component wiring only, not for token naming, colour scales, or theming.

Verify the `createStyleContext` implementation against the latest Park UI reference via MCP during bootstrap rather than relying on a hardcoded version. The general shape is:

```typescript
// packages/ui/src/utils/create-style-context.tsx
import { createContext, useContext, type ComponentProps, type ElementType } from 'react'

export function createStyleContext<T extends Record<string, string>>(recipe: (props?: any) => T) {
  const StyleContext = createContext<T | null>(null)

  function withProvider<C extends ElementType>(Component: C, slot: keyof T) {
    return function StyledComponent(props: ComponentProps<C> & Parameters<typeof recipe>[0]) {
      const [recipeProps, componentProps] = recipe.splitVariantProps(props)
      const classes = recipe(recipeProps)
      return (
        <StyleContext.Provider value={classes}>
          <Component {...(componentProps as any)} className={classes[slot as string]} />
        </StyleContext.Provider>
      )
    }
  }

  function withContext<C extends ElementType>(Component: C, slot: keyof T) {
    return function StyledComponent(props: ComponentProps<C>) {
      const classes = useContext(StyleContext)
      return <Component {...(props as any)} className={classes?.[slot as string]} />
    }
  }

  return { withProvider, withContext }
}
```

Apply it to build a styled compound component:

```typescript
// packages/ui/src/components/accordion/index.tsx
import { Accordion } from "@ark-ui/react/accordion";
import { createStyleContext } from "../../utils/create-style-context";
import { accordion } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(accordion);

const AccordionRoot = withProvider(Accordion.Root, "root");
const AccordionItem = withContext(Accordion.Item, "item");
const AccordionTrigger = withContext(Accordion.ItemTrigger, "itemTrigger");
const AccordionContent = withContext(Accordion.ItemContent, "itemContent");
const AccordionIndicator = withContext(
  Accordion.ItemIndicator,
  "itemIndicator",
);

// Re-export as namespace for ergonomic consumer usage
export { AccordionRoot as Root };
export { AccordionItem as Item };
export { AccordionTrigger as Trigger };
export { AccordionContent as Content };
export { AccordionIndicator as Indicator };
```

---

## Styling Component State with Data Attributes

Ark UI exposes interactive state via `data-*` attributes. Panda CSS has built-in conditions for these. Never use custom CSS selectors when a Panda condition exists.

```typescript
// Common Ark UI data attributes and their Panda CSS conditions
itemTrigger: {
  _open: { color: 'brand.solid' },                    // data-state="open"
  _closed: { color: 'fg.muted' },                     // data-state="closed"
  _disabled: { opacity: 0.4, cursor: 'not-allowed' }, // data-disabled
  _highlighted: { bg: 'bg.subtle' },                   // data-highlighted (Select, Menu)
  _checked: { bg: 'brand.solid' },                     // data-checked (Checkbox, Radio)
  _focus: { outline: 'none', ring: '2px' },            // data-focus
  _invalid: { borderColor: 'status.error' },           // data-invalid
}
```

For state not covered by Panda built-ins, use `data-scope` and `data-part` directly:

```typescript
root: {
  '& [data-part="indicator"]': {
    transform: 'rotate(0deg)',
    transition: 'transform 0.2s',
    _open: { transform: 'rotate(180deg)' },
  },
}
```

---

## Variants and Compound Variants

Define variants that map to visual roles, not visual descriptions.

```typescript
variants: {
  // Role-based (correct)
  variant: { solid: {}, outline: {}, ghost: {}, subtle: {} },
  size:    { sm: {}, md: {}, lg: {} },
  // NEVER name variants after raw visual values
  // color: { blue: {}, red: {} }
},
compoundVariants: [
  // Use compound variants for combinations that need special treatment
  {
    variant: 'solid',
    size: 'sm',
    css: { px: '3', py: '1.5', textStyle: 'xs' },
  },
],
defaultVariants: {
  variant: 'solid',
  size: 'md',
},
```

---

## Component File Structure

```
packages/panda-preset/src/
  recipes/
    accordion.ts         # defineSlotRecipe definition
    button.ts            # cva for single-element components
    index.ts             # barrel export for all recipes

packages/ui/src/
  components/
    accordion/
      index.tsx          # styled compound component + namespace export
      accordion.test.tsx # Playwright component test
    button/
      index.tsx
      button.test.tsx
  utils/
    create-style-context.tsx
  index.ts               # public API barrel
```

---

## Single-Element Components: The `styled()` Pattern (North Star)

For components that render a single DOM element (Button, Badge, Input, etc.), use Panda's `styled()` from `styled-system/jsx` to wire the recipe to an Ark UI primitive. This is the canonical pattern—informed by Park UI—and avoids manual `cx()`, type assertions, and prop plumbing.

### Recipe (in preset)

Use `defineRecipe` or `cva` in `@reva/panda-preset`:

```typescript
// packages/panda-preset/src/recipes/button.ts
import { defineRecipe } from "@pandacss/dev";

export const button = defineRecipe({
  className: "button",
  base: { /* ... */ },
  variants: { variant: { solid: {}, outline: {} }, size: { sm: {}, md: {} } },
  defaultVariants: { variant: "solid", size: "md" },
});
```

### Component (in @reva/ui)

Use `styled(ark.<element>, recipe)` and `forwardRef`:

```typescript
// packages/ui/src/components/button/index.tsx
import { ark } from "@ark-ui/react/factory";
import { forwardRef } from "react";
import { styled } from "styled-system/jsx";
import { button, type ButtonVariantProps } from "styled-system/recipes";

const BaseButton = styled(ark.button, button);

export interface ButtonProps
  extends React.ComponentProps<typeof BaseButton>,
    ButtonVariantProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <BaseButton ref={ref} {...props} />
);
```

**Why this pattern:**

- No type assertions for `ark.button` (avoids React 19 / Ark UI type mismatches)
- Recipe variant props flow through `ComponentProps<typeof BaseButton>`
- `className` and variant merging handled by Panda
- Preserves Ark UI polymorphism (`asChild`, `as`) when using `ark.<element>`

**Never** use `cx(recipe({ variant, size }), className)` for single-element components when `styled()` can be used.

---

## TypeScript Conventions

Export variant types from recipes for use in component props.

```typescript
import type { ComponentProps } from "react";
import type { RecipeVariantProps } from "styled-system/types";
import { accordion } from "styled-system/recipes";
import { Accordion as ArkAccordion } from "@ark-ui/react/accordion";

// Derive variant props from the recipe
export type AccordionVariants = RecipeVariantProps<typeof accordion>;

// Merge with Ark UI's own props
export type AccordionRootProps = AccordionVariants &
  ComponentProps<typeof ArkAccordion.Root>;
```

Use `forwardRef` on all leaf parts that render DOM elements, so consumers can attach refs.

---

## Panda CSS Preset: Minimal Setup

`@reva/panda-preset` disables Panda's default preset and fully owns all token definitions. This means:

- No `@pandacss/preset-base` in the presets array
- All tokens defined under Panda plural keys: `colors`, `spacing`, `radii`, `fonts`, `fontSizes`, `fontWeights`, `lineHeights`, `shadows`, plus `letterSpacings`, `borderWidths`, `zIndex`, `durations`, `easings` as needed
- Token values imported from `@reva/tokens/panda/tokens` and `@reva/tokens/panda/semantic-tokens` (not hardcoded)
- Consuming apps configure Panda with only our preset:

```typescript
// In any consuming app's panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { revaPreset } from "@reva/panda-preset";

export default defineConfig({
  presets: [revaPreset], // no @pandacss/preset-base
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
  jsxFramework: "react",
});
```

Reference: https://panda-css.com/docs/guides/minimal-setup

---

## Multi-Theme and Runtime Switching

The preset supports multiple themes for white-labelling via Panda's native `themes` config:

- Base Reva theme defined in `theme.tokens` and `theme.semanticTokens`
- Client themes defined in the `themes` property, each overriding tokens/semanticTokens
- `defineThemeContract` enforces structural consistency across all themes
- Light/dark mode is orthogonal, handled via `data-color-mode` attribute
- Theme CSS loaded at runtime via `styled-system/themes`:

```typescript
import { getTheme, injectTheme } from "styled-system/themes";

const theme = await getTheme(clientThemeName);
injectTheme(document.documentElement, theme);
```

---

## Accessibility Rules

Ark UI handles ARIA attributes, roles, and keyboard interactions automatically via its state machines. Do not add ARIA attributes manually unless Ark UI cannot provide them.

```tsx
// Let Ark UI manage ARIA
<Accordion.Trigger>Toggle</Accordion.Trigger>
// Ark adds: aria-expanded, aria-controls, role="button" automatically

// Do not duplicate
<Accordion.Trigger aria-expanded={isOpen}>Toggle</Accordion.Trigger>
```

Always provide visible labels or `aria-label` for icon-only interactive elements, since Ark UI cannot infer intent from icon content.

---

## Custom Hooks: What Is Still Your Responsibility

Ark UI owns all interaction state (open/closed, checked, highlighted, focused, disabled) and all keyboard navigation and ARIA management for its components. Do not re-implement any of these. Custom hooks in this project cover only application-level concerns.

```typescript
// Hooks you should still write:
// useDebounce, useControllableState (sync Ark UI with form libraries), useMediaQuery, etc.

// Hooks you should NOT write (Ark UI handles these):
// useKeyboardNavigation, useFocusTrap, useAriaExpanded,
// useComboboxState, useDialogState, useMenuState, etc.
```

---

## Performance

Apply memoisation conservatively. Measure before optimising.

```typescript
// useMemo for genuinely expensive derivations
const resolvedTokens = useMemo(() => resolveSemanticTokens(rawTokens, theme), [rawTokens, theme])

// useCallback for stable references passed to Ark UI event handlers
const handleValueChange = useCallback(({ value }: { value: string[] }) => {
  onSelectionChange(value)
}, [onSelectionChange])

// React.memo for leaf display components with stable props
export const TokenSwatch = React.memo<TokenSwatchProps>(({ token, value }) => (
  <div data-token={token} style={{ background: value }} />
))

// Do not wrap every component in memo by default
// Do not useMemo for trivial computations or JSX
// Do not useCallback for functions that are not passed as props
```

---

## Forbidden Patterns

```typescript
// Single-element: manual cx + recipe instead of styled()
<ark.button className={cx(button({ variant, size }), className)} {...props} />  // wrong
const BaseButton = styled(ark.button, button);  // correct

// Type assertions for ark.<element> when styled() would avoid them
const ArkButton = ark.button as React.ForwardRefExoticComponent<...>;  // wrong if styled() can be used

// Inline styles on Ark UI parts; use recipes
<Accordion.Trigger style={{ color: 'red' }} />

// Hardcoded className strings; use styled wrappers
<Accordion.Trigger className="my-accordion-trigger" />

// Importing anatomy from the main entrypoint
import { accordionAnatomy } from '@ark-ui/react' // causes build errors

// Raw CSS values in recipes
borderRadius: '8px'

// Colour foundation tokens in recipes
color: 'neutral.900'
bg: 'neutral.50'

// Styling based on element tags instead of data attributes
'& button': { color: 'brand.solid' }

// Using defineSlotRecipe for single-element components
// Use defineRecipe/cva for single elements, defineSlotRecipe for multi-part

// Importing recipe classes from source in application code
import { accordion } from 'packages/panda-preset/src/recipes/accordion'
// Always import from 'styled-system/recipes' (generated output)

// Using Panda's default preset alongside @reva/panda-preset
presets: ['@pandacss/preset-base', revaPreset]  // wrong
presets: [revaPreset]                            // correct

// Singular token namespace keys in source files
color: { ... }    // wrong — use 'colors'
radius: { ... }   // wrong — use 'radii'
shadow: { ... }   // wrong — use 'shadows'
```
