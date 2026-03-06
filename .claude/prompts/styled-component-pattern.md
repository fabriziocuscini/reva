# Styled Component Pattern: North Star for Reva UI

When building or modifying components in `@reva/ui`, follow the **Park UI `styled()` pattern** as the canonical approach. This is an architectural decision and must be applied consistently.

## The Pattern

Use Panda CSS `styled()` from `styled-system/jsx` to wire recipes to Ark UI primitives. Never use manual `cx(recipe(...), className)` or type assertions when `styled()` can be used instead.

### Single-element components

For components that render a single DOM element (Button, Badge, Input, etc.):

```tsx
import { ark } from '@ark-ui/react/factory'
import { forwardRef } from 'react'
import { styled } from 'styled-system/jsx'
import { button, type ButtonVariantProps } from 'styled-system/recipes'

const BaseButton = styled(ark.button, button)

export interface ButtonProps extends React.ComponentProps<typeof BaseButton>, ButtonVariantProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <BaseButton ref={ref} {...props} />
))
```

**Why:** `styled(element, recipe)` produces a typed component that receives recipe variant props directly. No manual `cx`, no type assertions for `ark.button`, and variant/className merging is handled by Panda.

### Multi-part (compound) components

For compound components (Accordion, Dialog, Menu, etc.) with multiple anatomy parts, use `createStyleContext` to distribute slot recipe classes. The `styled()` pattern does not replace this—it complements it. Use `createStyleContext` for slot recipes, `styled()` for single-element recipes.

## Rules

1. **Always prefer `styled(ark.<element>, recipe)`** over `cx(recipe(...), className)` for single-element components.
2. **Never add type assertions** (e.g. `ark.button as React.ForwardRefExoticComponent`) when `styled()` would eliminate the need.
3. **Import `styled`** from `styled-system/jsx` (Panda-generated). Ensure `panda codegen` runs so `styled-system` exists.
4. **Use Ark UI factory** (`ark.button`, `ark.input`, etc.) as the element to preserve polymorphic composition (`asChild`, `as`).
5. **Derive props** from `ComponentProps<typeof BaseComponent>` so variant types flow through automatically.

## Reference

- **Park UI:** https://park-ui.com/docs/components/button — source of the pattern (ignore their theming/colour approach).
- **Panda CSS recipes:** https://panda-css.com/docs/concepts/recipes — `styled()` usage and recipe definitions.
- **Reva skill:** `.claude/skills/ui-component-patterns/SKILL.md` — must align with this pattern.

---

## Instructions for Claude

When you apply this pattern:

1. **Update the `ui-component-patterns` skill** (`.claude/skills/ui-component-patterns/SKILL.md`) so it documents this as the north star. Replace or augment the "Single-Element Components" and "Style Context Pattern" sections to prioritise `styled()`. Ensure the skill clearly states that `styled(element, recipe)` is the preferred pattern for single-element components, and `createStyleContext` remains for multi-part slot recipes.
2. **Update CLAUDE.md** if the component architecture section still describes the old approach (e.g. manual `cx` or type assertions). Add a bullet under "Key Architectural Decisions" that states: _Styled primitives via Panda `styled()` — use `styled(ark.<element>, recipe)` for single-element components; `createStyleContext` for compound slot recipes._
3. **Update any other docs** (e.g. `bootstrap-prompt.md`, README, RULE files) that describe component implementation so they reference this pattern consistently.
4. **Add forbidden patterns** to the skill: manual `cx(recipe(...), className)` for single-element components, and `ark.<element>` type assertions when `styled()` would avoid them.

Keeping the skill and docs in sync ensures future sessions treat this as the north star without needing this prompt each time.
