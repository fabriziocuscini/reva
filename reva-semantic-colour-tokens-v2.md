# Reva Semantic Colour Tokens v2

Reference document for the semantic colour token layer of the Reva design system. This layer maps foundation palette tokens to UI roles, supports light/dark mode switching, and is the **only** colour layer referenced in recipes and application code. Foundation colour tokens must never appear in recipes or components directly.

This document supersedes the previous semantic token spec. Key changes from v1:

- **Dropped "primary" group.** Reduced from 8 to 7 semantic groups.
- **Accent is now amber** (was olive). Amber is the workhorse colour for interactive UI: buttons, links, selections.
- **Neutral uses a split palette:** olive in light mode (warm, tinted), stone in dark mode (desaturated, clean). This delivers the "industrial luxury" warmth in light mode without the muddiness that tinted neutrals produce on dark backgrounds.
- **Category-based naming.** Tokens follow `group.category.level` (e.g. `brand.bg.subtle`, `error.fg.default`) instead of flat variants.
- **Hover tokens removed from semantic layer.** Pushed to the component layer for platform agnosticism.
- **`fg.onSolid` replaces `contrast`.** Explicitly names the relationship with `bg.solid`. Not always white; hand-picked per group per mode.
- **`fg.emphasized` added.** High-contrast text, mapped to Radix step 12.
- **Revised dark mode mappings.** `bg.solid` uses step 500 in dark (not 400). `fg.onSolid` defaults to step 900 in dark (not white). `border.default` uses 400/600 (not 500/500).

---

## Architecture

**Token namespace:** `colors.*` (plural, Panda CSS convention)

**Naming pattern:** `colors.{group}.{category}.{level}`

- `group`: semantic colour group (brand, accent, neutral, error, warning, success, info)
- `category`: bg, fg, or border
- `level`: intensity/purpose within the category (subtle, muted, emphasized, solid, default, onSolid, focusRing)

**camelCase throughout:** `onSolid`, `focusRing`, not `on-solid`, `focus-ring`.

**Three layers:**

1. **Foundation** (raw palette values, never referenced in recipes)
2. **Semantic** (this layer, role-based, light/dark mode, the only colour tokens used in recipes)
3. **Component** (component-specific overrides, references semantic tokens, handles interaction states like hover)

**Disabled states:** handled via `opacity.disabled` applied to the whole component, not via dedicated colour tokens.

**Dark mode strategy:** symmetric swap as baseline. Light step N maps to dark step (1000 minus N). Fine-tuning per token may follow after visual testing. The neutral group is the notable exception: it switches foundation palettes entirely (olive in light, stone in dark).

---

## Foundation Palette Mapping

| Semantic group | Light palette | Dark palette | Anchor (500)                     |
| -------------- | ------------- | ------------ | -------------------------------- |
| brand          | gold          | gold         | #E2A336                          |
| accent         | amber         | amber        | #D78D3F                          |
| neutral        | olive         | stone        | #ADA065 (light) / #78716C (dark) |
| error          | mulberry      | mulberry     | #BF4853                          |
| warning        | copper        | copper       | #D2763B                          |
| success        | fern          | fern         | #61AB54                          |
| info           | cobalt        | cobalt       | #4286BD                          |

**7 groups.** Gold and olive foundation palettes remain available for direct component-layer references beyond their semantic group usage.

**Notes:**

- Brand (gold) is the identity colour, used for brand moments: logo treatments, brand hero sections, accents where Reva identity needs to shine.
- Accent (amber) is the interactive UI workhorse: primary buttons, links, active selections, CTAs. Warm and close enough to gold to feel cohesive, distinct enough to read as a separate voice.
- Neutral uses **split palettes**: olive for light mode (warm, yellow-ish tint that delivers the "industrial luxury" warmth), stone for dark mode (clean, desaturated). This means every neutral token references `olive.{step}` in light and `stone.{step}` in dark.
- All palettes use 19 steps (50 through 950, at 50-step increments).

---

## Per-Group Token Shape

Every semantic colour group follows an identical 10-token shape across 3 categories. This consistency means component recipes can be built generically against `colorPalette` and work with any group.

### bg (4 tokens)

| Level        | Intent                                                       | Radix step | Tailwind equiv. |
| ------------ | ------------------------------------------------------------ | ---------- | --------------- |
| `subtle`     | Lightest tinted background: banners, badges, table row tints | 2          | 50–100          |
| `muted`      | Slightly stronger: soft fills, hover-on-subtle               | 3          | 100–200         |
| `emphasized` | Active, selected, pressed state backgrounds                  | 4–5        | 200–300         |
| `solid`      | High-contrast fills: buttons, badges, solid indicators       | 9          | 500–600         |

### fg (3 tokens)

| Level        | Intent                                                                            | Radix step | Tailwind equiv. |
| ------------ | --------------------------------------------------------------------------------- | ---------- | --------------- |
| `default`    | Coloured text and icons                                                           | 11         | 700–800         |
| `emphasized` | High-contrast text, maximum readability                                           | 12         | 900–950         |
| `onSolid`    | Text/icons on `bg.solid` fills. Hand-picked per group per mode for best contrast. | n/a        | n/a             |

### border (3 tokens)

| Level       | Intent                                 | Radix step | Tailwind equiv. |
| ----------- | -------------------------------------- | ---------- | --------------- |
| `subtle`    | Faint tinted separators, soft dividers | 6          | 200–300         |
| `default`   | Component borders, standard outlines   | 7          | 300–400         |
| `focusRing` | Focus ring indicator                   | 8          | 400–500         |

**10 tokens per group. 7 groups = 70 semantic colour tokens.**

---

## Dark Mode Mapping (per-group baseline)

| Token                      | Light step    | Dark step     |
| -------------------------- | ------------- | ------------- |
| `{group}.bg.subtle`        | {palette}.100 | {palette}.900 |
| `{group}.bg.muted`         | {palette}.200 | {palette}.800 |
| `{group}.bg.emphasized`    | {palette}.300 | {palette}.700 |
| `{group}.bg.solid`         | {palette}.600 | {palette}.500 |
| `{group}.fg.default`       | {palette}.700 | {palette}.300 |
| `{group}.fg.emphasized`    | {palette}.900 | {palette}.100 |
| `{group}.fg.onSolid`       | white (100%)  | {palette}.900 |
| `{group}.border.subtle`    | {palette}.300 | {palette}.700 |
| `{group}.border.default`   | {palette}.400 | {palette}.600 |
| `{group}.border.focusRing` | {palette}.500 | {palette}.500 |

**Key differences from symmetric swap:**

- **`bg.solid`** uses 600 light / 500 dark (not 600/400). Dark mode solid fills sit at the anchor midpoint rather than a lighter step, giving more presence on dark backgrounds.
- **`fg.onSolid`** defaults to white in light, {palette}.900 in dark. On a dark-mode 500-step solid bg, a very dark foreground often produces better contrast than white. This is a starting point; each group may be individually tuned.
- **`border.default`** uses 400 light / 600 dark (not 500/500). Slightly softer in light, slightly stronger in dark, improving perceived consistency across modes.

**For the neutral group**, substitute olive steps in the light column and stone steps in the dark column.

---

## Per-Group Token Tables

### `colors.brand.*` (gold foundation)

| Token                           | Light        | Dark     | Purpose                                  |
| ------------------------------- | ------------ | -------- | ---------------------------------------- |
| `colors.brand.bg.subtle`        | gold.100     | gold.900 | Soft brand tint: banners, highlights     |
| `colors.brand.bg.muted`         | gold.200     | gold.800 | Soft fills, hover on subtle              |
| `colors.brand.bg.emphasized`    | gold.300     | gold.700 | Active, selected, pressed brand elements |
| `colors.brand.bg.solid`         | gold.600     | gold.500 | Solid brand fill                         |
| `colors.brand.fg.default`       | gold.700     | gold.300 | Brand-coloured text and icons            |
| `colors.brand.fg.emphasized`    | gold.900     | gold.100 | High-contrast brand text                 |
| `colors.brand.fg.onSolid`       | white (100%) | gold.900 | Text on brand solid fills                |
| `colors.brand.border.subtle`    | gold.300     | gold.700 | Faint brand separator                    |
| `colors.brand.border.default`   | gold.400     | gold.600 | Brand-tinted borders                     |
| `colors.brand.border.focusRing` | gold.500     | gold.500 | Focus ring on brand elements             |

### `colors.accent.*` (amber foundation)

The accent group is the primary interactive colour: buttons, links, CTAs, active selections.

| Token                            | Light        | Dark      | Purpose                                  |
| -------------------------------- | ------------ | --------- | ---------------------------------------- |
| `colors.accent.bg.subtle`        | amber.100    | amber.900 | Soft accent tint                         |
| `colors.accent.bg.muted`         | amber.200    | amber.800 | Soft fills, hover on subtle              |
| `colors.accent.bg.emphasized`    | amber.300    | amber.700 | Active, selected accent state            |
| `colors.accent.bg.solid`         | amber.600    | amber.500 | Solid accent fill: primary buttons, CTAs |
| `colors.accent.fg.default`       | amber.700    | amber.300 | Accent-coloured text, links              |
| `colors.accent.fg.emphasized`    | amber.900    | amber.100 | High-contrast accent text                |
| `colors.accent.fg.onSolid`       | white (100%) | amber.900 | Text on accent solid fills               |
| `colors.accent.border.subtle`    | amber.300    | amber.700 | Faint accent separator                   |
| `colors.accent.border.default`   | amber.400    | amber.600 | Accent-tinted borders                    |
| `colors.accent.border.focusRing` | amber.500    | amber.500 | Focus ring on accent elements            |

### `colors.neutral.*` (olive light / stone dark)

The neutral group uses split palettes: olive in light mode for warm, tinted neutrals; stone in dark mode for clean, desaturated neutrals. Global `colors.fg.*` and `colors.border.*` tokens are convenience aliases pointing into values from this same foundation.

| Token                             | Light        | Dark      | Purpose                                         |
| --------------------------------- | ------------ | --------- | ----------------------------------------------- |
| `colors.neutral.bg.subtle`        | olive.100    | stone.900 | Barely visible tint, hover states               |
| `colors.neutral.bg.muted`         | olive.200    | stone.800 | Soft neutral fills                              |
| `colors.neutral.bg.emphasized`    | olive.300    | stone.700 | Active, selected neutral elements               |
| `colors.neutral.bg.solid`         | olive.900    | stone.100 | Inverted/solid neutral fills                    |
| `colors.neutral.fg.default`       | olive.900    | stone.100 | Neutral text (same intent as global fg.default) |
| `colors.neutral.fg.emphasized`    | olive.950    | stone.50  | Maximum contrast neutral text                   |
| `colors.neutral.fg.onSolid`       | white (100%) | stone.900 | Text on neutral solid fills                     |
| `colors.neutral.border.subtle`    | olive.200    | stone.800 | Subtle neutral separators                       |
| `colors.neutral.border.default`   | olive.300    | stone.700 | Standard neutral borders                        |
| `colors.neutral.border.focusRing` | olive.400    | stone.600 | Focus ring on neutral elements                  |

**Note:** neutral `bg.solid` uses 900/100 (not 600/500) for maximum contrast inversion. neutral `fg.emphasized` uses 950/50 for the strongest possible text. neutral `border.default` uses 300/700 (not 400/600) since the olive tint at 400 can feel too colourful for a neutral border.

### `colors.error.*` (mulberry foundation)

| Token                           | Light        | Dark         | Purpose                               |
| ------------------------------- | ------------ | ------------ | ------------------------------------- |
| `colors.error.bg.subtle`        | mulberry.100 | mulberry.900 | Error banner bg, form field tint      |
| `colors.error.bg.muted`         | mulberry.200 | mulberry.800 | Soft error fills                      |
| `colors.error.bg.emphasized`    | mulberry.300 | mulberry.700 | Active, selected error state          |
| `colors.error.bg.solid`         | mulberry.600 | mulberry.500 | Solid error fill, destructive buttons |
| `colors.error.fg.default`       | mulberry.700 | mulberry.300 | Error text, validation messages       |
| `colors.error.fg.emphasized`    | mulberry.900 | mulberry.100 | High-contrast error text              |
| `colors.error.fg.onSolid`       | white (100%) | mulberry.900 | Text on error solid fills             |
| `colors.error.border.subtle`    | mulberry.300 | mulberry.700 | Faint error separator                 |
| `colors.error.border.default`   | mulberry.400 | mulberry.600 | Error borders, validation rings       |
| `colors.error.border.focusRing` | mulberry.500 | mulberry.500 | Focus ring on error elements          |

### `colors.warning.*` (copper foundation)

| Token                             | Light        | Dark       | Purpose                        |
| --------------------------------- | ------------ | ---------- | ------------------------------ |
| `colors.warning.bg.subtle`        | copper.100   | copper.900 | Warning banner bg              |
| `colors.warning.bg.muted`         | copper.200   | copper.800 | Soft warning fills             |
| `colors.warning.bg.emphasized`    | copper.300   | copper.700 | Active, selected warning state |
| `colors.warning.bg.solid`         | copper.600   | copper.500 | Solid warning fill             |
| `colors.warning.fg.default`       | copper.700   | copper.300 | Warning text                   |
| `colors.warning.fg.emphasized`    | copper.900   | copper.100 | High-contrast warning text     |
| `colors.warning.fg.onSolid`       | white (100%) | copper.900 | Text on warning solid fills    |
| `colors.warning.border.subtle`    | copper.300   | copper.700 | Faint warning separator        |
| `colors.warning.border.default`   | copper.400   | copper.600 | Warning borders                |
| `colors.warning.border.focusRing` | copper.500   | copper.500 | Focus ring on warning elements |

### `colors.success.*` (fern foundation)

| Token                             | Light        | Dark     | Purpose                        |
| --------------------------------- | ------------ | -------- | ------------------------------ |
| `colors.success.bg.subtle`        | fern.100     | fern.900 | Success banner bg              |
| `colors.success.bg.muted`         | fern.200     | fern.800 | Soft success fills             |
| `colors.success.bg.emphasized`    | fern.300     | fern.700 | Active, selected success state |
| `colors.success.bg.solid`         | fern.600     | fern.500 | Solid success fill             |
| `colors.success.fg.default`       | fern.700     | fern.300 | Success text                   |
| `colors.success.fg.emphasized`    | fern.900     | fern.100 | High-contrast success text     |
| `colors.success.fg.onSolid`       | white (100%) | fern.900 | Text on success solid fills    |
| `colors.success.border.subtle`    | fern.300     | fern.700 | Faint success separator        |
| `colors.success.border.default`   | fern.400     | fern.600 | Success borders                |
| `colors.success.border.focusRing` | fern.500     | fern.500 | Focus ring on success elements |

### `colors.info.*` (cobalt foundation)

| Token                          | Light        | Dark       | Purpose                     |
| ------------------------------ | ------------ | ---------- | --------------------------- |
| `colors.info.bg.subtle`        | cobalt.100   | cobalt.900 | Info banner bg              |
| `colors.info.bg.muted`         | cobalt.200   | cobalt.800 | Soft info fills             |
| `colors.info.bg.emphasized`    | cobalt.300   | cobalt.700 | Active, selected info state |
| `colors.info.bg.solid`         | cobalt.600   | cobalt.500 | Solid info fill             |
| `colors.info.fg.default`       | cobalt.700   | cobalt.300 | Info text                   |
| `colors.info.fg.emphasized`    | cobalt.900   | cobalt.100 | High-contrast info text     |
| `colors.info.fg.onSolid`       | white (100%) | cobalt.900 | Text on info solid fills    |
| `colors.info.border.subtle`    | cobalt.300   | cobalt.700 | Faint info separator        |
| `colors.info.border.default`   | cobalt.400   | cobalt.600 | Info borders                |
| `colors.info.border.focusRing` | cobalt.500   | cobalt.500 | Focus ring on info elements |

---

## Global Tokens

Not tied to any specific colour group. Cover structural surfaces, neutral text hierarchy, and neutral borders. Global tokens may reference neutral semantic tokens, other semantic tokens, or foundation tokens directly.

### `colors.bg.*` (global surfaces)

| Token               | Light           | Dark            | Purpose                                    |
| ------------------- | --------------- | --------------- | ------------------------------------------ |
| `colors.bg.canvas`  | olive.50        | stone.950       | Page/screen background                     |
| `colors.bg.surface` | white           | stone.900       | Cards, form inputs, modals, content panels |
| `colors.bg.overlay` | stone.950 @ 60% | stone.950 @ 60% | Modal/dialog backdrops (mode-agnostic)     |

**3 tokens.** Canvas uses olive.50 in light for the warm tint, stone.950 in dark for clean darkness.

### `colors.bg.translucent.*` (frosted glass)

Mode-agnostic white alphas. Require `backdrop-filter: blur(...)` on the consuming element.

| Token                           | Value       | Mode-agnostic | Purpose        |
| ------------------------------- | ----------- | ------------- | -------------- |
| `colors.bg.translucent.default` | white @ 60% | Yes           | Standard frost |
| `colors.bg.translucent.subtle`  | white @ 20% | Yes           | Lightest frost |
| `colors.bg.translucent.muted`   | white @ 40% | Yes           | Medium frost   |

**3 tokens.**

### `colors.fg.*` (global text hierarchy)

Neutral text colours used across all content. Convenience aliases following the neutral split: olive steps in light, stone steps in dark.

| Token                   | Light               | Dark                | Purpose                                |
| ----------------------- | ------------------- | ------------------- | -------------------------------------- |
| `colors.fg.default`     | olive.900           | stone.100           | Primary text, headings                 |
| `colors.fg.muted`       | olive.600           | stone.400           | Secondary text, labels                 |
| `colors.fg.subtle`      | olive.400           | stone.600           | Helper text, captions                  |
| `colors.fg.placeholder` | olive.350           | stone.650           | Input placeholders                     |
| `colors.fg.link`        | {accent.fg.default} | {accent.fg.default} | Link text (alias of accent.fg.default) |

**5 tokens.**

### `colors.fg.onColor.*` (text on coloured fills)

White at varying alpha levels. Mode-agnostic: always sit on a coloured background, so values are shared across light and dark modes. Distinct from the per-group `fg.onSolid` which is the specific contrast colour for each group.

| Token                           | Value        | Mode-agnostic | Purpose                         |
| ------------------------------- | ------------ | ------------- | ------------------------------- |
| `colors.fg.onColor.default`     | white (100%) | Yes           | Primary text on solid fills     |
| `colors.fg.onColor.muted`       | white @ 60%  | Yes           | Secondary text on solid fills   |
| `colors.fg.onColor.subtle`      | white @ 40%  | Yes           | Tertiary text on solid fills    |
| `colors.fg.onColor.disabled`    | white @ 30%  | Yes           | Disabled text on solid fills    |
| `colors.fg.onColor.placeholder` | white @ 20%  | Yes           | Placeholder text on solid fills |

**5 tokens.**

### `colors.border.*` (global neutral borders)

Neutral structural borders. Follow the neutral split: olive steps in light, stone steps in dark.

| Token                   | Light     | Dark      | Purpose                  |
| ----------------------- | --------- | --------- | ------------------------ |
| `colors.border.default` | olive.300 | stone.700 | Standard borders         |
| `colors.border.muted`   | olive.200 | stone.800 | Softer borders, dividers |
| `colors.border.subtle`  | olive.100 | stone.900 | Barely-there separators  |

**3 tokens.**

### Global token total: 19 tokens

---

## Grand Total: 89 semantic colour tokens

| Category                   | Count  |
| -------------------------- | ------ |
| Global bg (surfaces)       | 3      |
| Global bg (translucent)    | 3      |
| Global fg (text hierarchy) | 5      |
| Global fg (onColor)        | 5      |
| Global border (neutral)    | 3      |
| Per-group (10 x 7 groups)  | 70     |
| **Total**                  | **89** |

---

## Hover and Interaction States: Component Layer Responsibility

Hover states are intentionally excluded from the semantic layer. Reasons:

1. **Platform agnosticism.** Hover is a pointer-device interaction. On touch interfaces it does not exist. A semantic token named `solid.hover` bakes a platform assumption into a layer that should be platform-agnostic.

2. **Component layer handles it better.** A Button recipe can define hover by referencing `bg.emphasized` for ghost/outline variants, or by applying a filter/opacity shift on `bg.solid` for solid variants. The foundation steps are still available for the component layer to reference directly when needed.

Common component-layer hover patterns:

```tsx
// Solid button: darken solid bg on hover
_hover: { bg: '{group}.bg.solid', filter: 'brightness(0.9)' }
// Or reference a darker foundation step directly:
_hover: { bg: 'amber.700' }  // component layer CAN reference foundation

// Ghost button: show subtle bg on hover
_hover: { bg: '{group}.bg.subtle' }

// Outline button: show muted bg on hover
_hover: { bg: '{group}.bg.muted' }
```

---

## Usage Examples

```tsx
// Warning alert
<Alert>
  bg: 'colors.warning.bg.subtle'
  borderColor: 'colors.warning.border.default'
  color: 'colors.warning.fg.default'
</Alert>

// Accent solid button (primary CTA)
<Button>
  bg: 'colors.accent.bg.solid'
  color: 'colors.accent.fg.onSolid'
  _focus: { ringColor: 'colors.accent.border.focusRing' }
</Button>

// Neutral ghost button
<Button variant="ghost">
  color: 'colors.neutral.fg.default'
  _hover: { bg: 'colors.neutral.bg.subtle' }
  _active: { bg: 'colors.neutral.bg.muted' }
</Button>

// Card on canvas
<Card>
  bg: 'colors.bg.surface'
  borderColor: 'colors.border.default'
  color: 'colors.fg.default'
</Card>

// Badge with inverted neutral
<Badge>
  bg: 'colors.neutral.bg.solid'
  color: 'colors.neutral.fg.onSolid'
</Badge>

// Input with placeholder
<Input>
  color: 'colors.fg.default'
  _placeholder: { color: 'colors.fg.placeholder' }
  borderColor: 'colors.border.default'
</Input>

// Link
<Link>
  color: 'colors.fg.link'
</Link>

// Frosted glass panel
<Panel>
  bg: 'colors.bg.translucent.default'
  backdropFilter: 'blur(16px)'
</Panel>

// Text on solid brand hero section
<Hero>
  bg: 'colors.brand.bg.solid'
  color: 'colors.fg.onColor.default'
  descriptionColor: 'colors.fg.onColor.muted'
</Hero>

// High-contrast error message
<ErrorMessage>
  color: 'colors.error.fg.emphasized'
</ErrorMessage>

// Disabled component (uses opacity, not colour tokens)
<Button disabled>
  opacity: 'opacity.disabled'
</Button>
```

---

## colorPalette Pattern (Panda CSS)

Because every group follows the same 10-token shape, component recipes can use Panda CSS's `colorPalette` feature for generic colour support:

```tsx
// Recipe definition
const button = cva({
  base: {
    colorPalette: 'accent',
  },
  variants: {
    variant: {
      solid: {
        bg: 'colorPalette.bg.solid',
        color: 'colorPalette.fg.onSolid',
      },
      subtle: {
        bg: 'colorPalette.bg.subtle',
        color: 'colorPalette.fg.default',
        _hover: { bg: 'colorPalette.bg.muted' },
      },
      outline: {
        borderColor: 'colorPalette.border.default',
        color: 'colorPalette.fg.default',
        _hover: { bg: 'colorPalette.bg.subtle' },
      },
    },
  },
})

// Consumer usage
<Button colorPalette="error">Delete</Button>
<Button colorPalette="accent">Save</Button>
<Button colorPalette="brand">Brand Action</Button>
```

---

## Convenience Alias Relationships

Global tokens are convenience aliases. They reference neutral (olive/stone) values and the accent group.

| Global token            | Light                         | Dark                          |
| ----------------------- | ----------------------------- | ----------------------------- |
| `colors.fg.default`     | olive.900                     | stone.100                     |
| `colors.fg.muted`       | olive.600                     | stone.400                     |
| `colors.fg.subtle`      | olive.400                     | stone.600                     |
| `colors.fg.placeholder` | olive.350                     | stone.650                     |
| `colors.fg.link`        | amber.700 (accent.fg.default) | amber.300 (accent.fg.default) |
| `colors.border.default` | olive.300                     | stone.700                     |
| `colors.border.muted`   | olive.200                     | stone.800                     |
| `colors.border.subtle`  | olive.100                     | stone.900                     |

---

## Radix and Tailwind Cross-Reference

Full mapping of Radix 12-step system and Tailwind colour scale to the Reva semantic token structure:

| Radix step | Radix use case              | Tailwind equiv. | Reva semantic token        | Layer     |
| ---------- | --------------------------- | --------------- | -------------------------- | --------- |
| 1          | App background              | 50              | `colors.bg.canvas`         | Global    |
| 2          | Subtle background           | 50–100          | `{group}.bg.subtle`        | Semantic  |
| 3          | UI element background       | 100–200         | `{group}.bg.muted`         | Semantic  |
| 4          | Hovered UI element bg       | 200             | (component layer)          | Component |
| 5          | Active/Selected bg          | 200–300         | `{group}.bg.emphasized`    | Semantic  |
| 6          | Subtle borders              | 200–300         | `{group}.border.subtle`    | Semantic  |
| 7          | UI element border           | 300–400         | `{group}.border.default`   | Semantic  |
| 8          | Hovered border / focus ring | 400–500         | `{group}.border.focusRing` | Semantic  |
| 9          | Solid backgrounds           | 500–600         | `{group}.bg.solid`         | Semantic  |
| 10         | Hovered solid backgrounds   | 600–700         | (component layer)          | Component |
| 11         | Low-contrast text           | 700–800         | `{group}.fg.default`       | Semantic  |
| 12         | High-contrast text          | 900–950         | `{group}.fg.emphasized`    | Semantic  |

---

## Open Decisions

1. **Foundation step fine-tuning.** Light mode currently maps to round steps (100, 200, 300, etc.). Once 50-step increment palettes are visually tested, mappings may shift to intermediate steps (e.g. `accent.bg.emphasized` might map to amber.350 instead of amber.300).
2. **Dark mode fine-tuning.** The baseline mappings (especially `fg.onSolid` defaulting to step 900) are a starting point. Each group will likely need individual tuning after visual testing with actual palette outputs.
3. **Neutral split edge cases.** The olive/stone split means the neutral group's light and dark values may not follow the symmetric swap pattern as cleanly. Some steps may need manual adjustment for visual consistency across modes.
4. **`fg.onColor` global tokens in dark mode.** Currently mode-agnostic white alphas. If dark-mode solid fills use step 500 (lighter than light-mode's step 600), the white alpha hierarchy may need a dark-mode variant. Monitor during visual testing.

---

## Naming Conventions Summary

- **Namespace:** `colors.*` (plural, Panda CSS convention)
- **Pattern:** `colors.{group}.{category}.{level}`
- **Groups:** brand, accent, neutral, error, warning, success, info (7 groups)
- **Categories:** bg, fg, border
- **Levels (bg):** subtle, muted, emphasized, solid
- **Levels (fg):** default, emphasized, onSolid
- **Levels (border):** subtle, default, focusRing
- **Case:** camelCase throughout (`onSolid`, `focusRing`, `copper`, `mulberry`, `cobalt`)
- **On-colour foreground:** `fg.onColor.{default,muted,subtle,disabled,placeholder}` (white alpha hierarchy, mode-agnostic, global)
- **Per-group onSolid:** `{group}.fg.onSolid` (specific contrast colour per group per mode)
- **Foundation steps:** 50 through 950 at 50-step increments (19 steps per palette)
- **Dark mode:** symmetric swap as baseline, with neutral using split palettes (olive light / stone dark)
- **No raw foundation references in recipes:** always go through semantic layer
- **No dedicated disabled colours:** use `opacity.disabled` on the component
- **No hover tokens:** pushed to component layer for platform agnosticism
- **No raw greys:** always `neutral`, never `gray`, `stone`, or `olive` in the semantic layer
