# @reva/tokens

Platform-agnostic, multi-themeable design tokens for the Reva design system.

Authored in [Tokens Studio](https://tokens.studio/) DTCG format (`$value`, `$type`, `$description`) and transformed via [Style Dictionary v4](https://styledictionary.com/) + `@tokens-studio/sd-transforms` into multiple output formats.

## Table of Contents

- [Token Architecture](#token-architecture)
- [Naming Conventions](#naming-conventions)
- [Source File Structure](#source-file-structure)
- [Foundation Token Sets](#foundation-token-sets)
  - [Colors](#colors)
  - [Spacing](#spacing)
  - [Sizes](#sizes)
  - [Container Sizes](#container-sizes)
  - [Typography](#typography)
    - [Font Families](#font-families)
    - [Font Sizes](#font-sizes)
    - [Font Weights](#font-weights)
    - [Letter Spacings](#letter-spacings)
    - [Line Heights](#line-heights)
  - [Text Styles](#text-styles)
    - [Marketing Text Styles](#marketing-text-styles)
    - [Product Text Styles](#product-text-styles)
  - [Radii](#radii)
  - [Shadows](#shadows)
  - [Border Widths](#border-widths)
  - [Blurs](#blurs)
  - [Opacity](#opacity)
  - [Durations](#durations)
  - [Z-Index](#z-index)
  - [Aspect Ratios](#aspect-ratios)
  - [Cursors](#cursors)
  - [Breakpoints](#breakpoints)
- [Output Formats](#output-formats)
- [Build](#build)
- [How Panda CSS Consumes Tokens](#how-panda-css-consumes-tokens)
- [Source of Truth](#source-of-truth)

---

## Token Architecture

Tokens are organised in three layers:

| Layer          | Purpose                                                           | Usage in code                                                           |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Foundation** | Raw, context-free values (colours, spacing, radii, etc.)          | Only in the semantic layer or Panda preset — never in app code directly |
| **Semantic**   | Contextual aliases (`fg.default`, `bg.surface`, `brand.solid`)    | In recipes and app code via Panda token paths                           |
| **Component**  | Rare, component-specific overrides when semantic tokens don't fit | Must reference semantic tokens                                          |

Colour foundation tokens are **never used directly** in recipes or app code — always go through the semantic layer. Non-colour foundation tokens (spacing, radii, z-index, etc.) may be used directly.

> **Note:** This document covers the **foundation layer** only. Semantic and component layer documentation is forthcoming.

---

## Naming Conventions

### General Rules

- **Panda-aligned plural namespaces** — Token set names match Panda CSS category names (`colors`, `spacing`, `radii`, `shadows`, `fonts`, `fontSizes`, `fontWeights`, `lineHeights`). This gives zero-mapping between the token source and the Panda preset.
- **DTCG format** — Every token uses the dollar-prefixed keys `$value`, `$type`, and `$description`. No comments in JSON source files.
- **Flat numeric scales** — Spacing, sizes, and z-index use numeric or named keys (`0`, `1`, `2`, `sm`, `md`, `lg`). No nesting beyond the top-level category.
- **T-shirt sizing** — Non-linear scales use t-shirt names: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, etc.
- **Half-step names** — Sizes and spacing include half-steps using underscored names: `half` (0.5), `1_half` (1.5), `2_half` (2.5), etc.

### Colour Palettes

- Each palette is a group of 11 stops: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`.
- `50` is the lightest tint; `950` is the darkest shade.
- `500` is the primary reference swatch for each hue.
- `black` and `white` sit directly under `colors` with full alpha ramps (`transparent`, `a5`–`a95`, `solid`).

### Typography

- Text styles are split into **marketing** (serif headings, wider tracking) and **product** (sans-serif, neutral tracking).
- Each text style provides four weight variants: `regular`, `medium`, `semibold`, `bold`.
- The recommended default variant is marked with a `✦` suffix in the token name (e.g., `medium ✦`).

---

## Source File Structure

```
src/
├── foundation/
│   ├── colors.json          # Colour palettes and common colours
│   ├── spacing.json         # Spatial scale (padding, margins, gaps)
│   ├── sizes.json           # Width/height sizing scale
│   ├── containerSizes.json  # Container max-widths
│   ├── typography.json      # Font families, sizes, weights, letter spacing, line heights
│   ├── textStyles.json      # Composite text style tokens (marketing + product)
│   ├── radii.json           # Border radius scale
│   ├── shadows.json         # Elevation box shadows
│   ├── borderWidths.json    # Border width scale
│   ├── blurs.json           # Blur radius scale
│   ├── opacity.json         # Opacity values
│   ├── durations.json       # Animation/transition timing
│   ├── zIndex.json          # Stacking order
│   ├── aspectRatios.json    # Common aspect ratios
│   ├── cursors.json         # Cursor values for interactive elements
│   └── breakpoints.json     # Responsive breakpoints
├── semantic/
│   ├── colors.json          # Light mode colour assignments
│   └── colors-dark.json     # Dark mode colour assignments
└── component/               # (future)
```

---

## Foundation Token Sets

### Colors

**Source:** `src/foundation/colors.json`
**Panda category:** `colors`
**DTCG type:** `color`

The colour system provides neutral palettes, accent/brand palettes, and common black/white with alpha ramps. All palettes follow an 11-stop scale from `50` (lightest) to `950` (darkest).

> Colour foundation tokens must **never** be used directly in recipes or app code. Always reference them through the semantic layer.

#### Palettes

Each palette provides 11 stops: `50`, `100`, `200`–`900`, `950`. The `500` stop is the primary reference swatch.

| Palette    | Token prefix    | Description                                  |
| ---------- | --------------- | -------------------------------------------- |
| **gray**   | `colors.gray`   | Pure neutral with no undertone               |
| **stone**  | `colors.stone`  | Warm neutral with a slight brown undertone   |
| **zinc**   | `colors.zinc`   | Cool neutral with a slight blue undertone    |
| **gold**   | `colors.gold`   | Reva brand colour — warm gold                |
| **olive**  | `colors.olive`  | Earthy yellow-green for secondary brand use  |
| **wine**   | `colors.wine`   | Muted rose-burgundy for secondary brand use  |
| **amber**  | `colors.amber`  | Warm orange-brown for warnings and accents   |
| **yellow** | `colors.yellow` | Bright yellow for caution and highlights     |
| **orange** | `colors.orange` | Vivid orange for attention and accents       |
| **red**    | `colors.red`    | Vivid red for errors and destructive actions |
| **green**  | `colors.green`  | Vivid green for success and positive states  |
| **teal**   | `colors.teal`   | Blue-green for informational accents         |
| **sky**    | `colors.sky`    | Light blue for informational and link states |

#### Black & White

`colors.black` and `colors.white` each provide a full alpha ramp at every 5% step (`transparent`, `a5`–`a95`, `solid`) for overlays, shadows, and layered effects.

| Token          | Value                  | Description      |
| -------------- | ---------------------- | ---------------- |
| `colors.white` | `{colors.white.solid}` | Pure white alias |
| `colors.black` | `{colors.black.solid}` | Pure black alias |

---

### Spacing

**Source:** `src/foundation/spacing.json`
**Panda category:** `spacing`
**DTCG type:** `dimension`

A 4px base-unit spatial scale for padding, margins, and gaps. Multipliers skip non-standard values to encourage consistent rhythm.

| Token            | Value   | Description                       |
| ---------------- | ------- | --------------------------------- |
| `spacing.0`      | `0px`   | No spacing                        |
| `spacing.half`   | `2px`   | Smallest spacing unit (0.5x base) |
| `spacing.1`      | `4px`   | Base spacing unit                 |
| `spacing.1_half` | `6px`   | Between base and 2 (1.5x base)    |
| `spacing.2`      | `8px`   | 2x base                           |
| `spacing.3`      | `12px`  | 3x base                           |
| `spacing.4`      | `16px`  | 4x base                           |
| `spacing.5`      | `20px`  | 5x base                           |
| `spacing.6`      | `24px`  | 6x base                           |
| `spacing.8`      | `32px`  | 8x base                           |
| `spacing.10`     | `40px`  | 10x base                          |
| `spacing.12`     | `48px`  | 12x base                          |
| `spacing.16`     | `64px`  | 16x base                          |
| `spacing.20`     | `80px`  | 20x base                          |
| `spacing.24`     | `96px`  | 24x base                          |
| `spacing.30`     | `120px` | 30x base                          |
| `spacing.40`     | `160px` | 40x base                          |
| `spacing.50`     | `200px` | 50x base                          |
| `spacing.60`     | `240px` | 60x base                          |

---

### Sizes

**Source:** `src/foundation/sizes.json`
**Panda category:** `sizes`
**DTCG type:** `dimension`

A comprehensive sizing scale for widths and heights. Includes a numeric scale with half-step granularity, named large sizes in rem, viewport units, and intrinsic CSS sizing keywords.

> Because we omit `@pandacss/preset-panda`, the preset maps `sizes: pandaTokens.spacing` so that `h`, `w`, `minH`, `maxH` utilities resolve to token values instead of raw pixel values.

#### Numeric Scale

| Token          | Value  | Description            |
| -------------- | ------ | ---------------------- |
| `sizes.0`      | `0px`  | No size                |
| `sizes.half`   | `2px`  | Extra extra small size |
| `sizes.1`      | `4px`  | Extra small size       |
| `sizes.1_half` | `6px`  | Between 4px and 8px    |
| `sizes.2`      | `8px`  | Small size             |
| `sizes.2_half` | `10px` | Between 8px and 12px   |
| `sizes.3`      | `12px` | Medium-small size      |
| `sizes.3_half` | `14px` | Between 12px and 16px  |
| `sizes.4`      | `16px` | Medium size            |
| `sizes.4_half` | `18px` | Between 16px and 20px  |
| `sizes.5`      | `20px` | Medium-large size      |
| `sizes.5_half` | `22px` | Between 20px and 24px  |
| `sizes.6`      | `24px` | Large size             |
| `sizes.6_half` | `26px` | Between 24px and 28px  |
| `sizes.7`      | `28px` | Extra large size       |
| `sizes.7_half` | `30px` | Between 28px and 32px  |
| `sizes.8`      | `32px` | 2x large size          |
| `sizes.8_half` | `34px` | Between 32px and 36px  |
| `sizes.9`      | `36px` | 3x large size          |
| `sizes.9_half` | `38px` | Between 36px and 40px  |
| `sizes.10`     | `40px` | 4x large size          |
| `sizes.12`     | `48px` | 5x large size          |
| `sizes.14`     | `56px` | 6x large size          |
| `sizes.16`     | `64px` | 7x large size          |

#### Named Sizes (rem-based)

| Token       | Value   | Equivalent | Description            |
| ----------- | ------- | ---------- | ---------------------- |
| `sizes.xs`  | `20rem` | 320px      | Extra small named size |
| `sizes.sm`  | `24rem` | 384px      | Small named size       |
| `sizes.md`  | `28rem` | 448px      | Medium named size      |
| `sizes.lg`  | `32rem` | 512px      | Large named size       |
| `sizes.xl`  | `36rem` | 576px      | Extra large named size |
| `sizes.2xl` | `42rem` | 672px      | 2x large named size    |
| `sizes.3xl` | `48rem` | 768px      | 3x large named size    |
| `sizes.4xl` | `56rem` | 896px      | 4x large named size    |
| `sizes.5xl` | `64rem` | 1024px     | 5x large named size    |
| `sizes.6xl` | `72rem` | 1152px     | 6x large named size    |
| `sizes.7xl` | `80rem` | 1280px     | 7x large named size    |
| `sizes.8xl` | `90rem` | 1440px     | 8x large named size    |

#### Intrinsic & Viewport Sizes

| Token         | Value         | Description                                                 |
| ------------- | ------------- | ----------------------------------------------------------- |
| `sizes.prose` | `65ch`        | Optimal reading width for long-form text                    |
| `sizes.full`  | `100%`        | Full width of the parent container                          |
| `sizes.min`   | `min-content` | Shrink to the minimum content size                          |
| `sizes.max`   | `max-content` | Expand to the maximum content size                          |
| `sizes.fit`   | `fit-content` | Fit to content within available space                       |
| `sizes.dvh`   | `100dvh`      | Dynamic viewport height (adjusts for mobile browser chrome) |
| `sizes.svh`   | `100svh`      | Small viewport height                                       |
| `sizes.lvh`   | `100lvh`      | Large viewport height                                       |
| `sizes.dvw`   | `100dvw`      | Dynamic viewport width                                      |
| `sizes.svw`   | `100svw`      | Small viewport width                                        |
| `sizes.lvw`   | `100lvw`      | Large viewport width                                        |
| `sizes.vw`    | `100vw`       | Full viewport width                                         |
| `sizes.vh`    | `100vh`       | Full viewport height                                        |

---

### Container Sizes

**Source:** `src/foundation/containerSizes.json`
**Panda category:** `containerSizes`
**DTCG type:** `dimension`

Container max-widths used by Panda's `theme.containerSizes` config. These are **not** regular tokens — they are passed directly to the Panda theme as flat maps.

| Token                | Value    | Description                         |
| -------------------- | -------- | ----------------------------------- |
| `containerSizes.xs`  | `320px`  | Narrow mobile layouts               |
| `containerSizes.sm`  | `384px`  | Compact mobile layouts              |
| `containerSizes.md`  | `448px`  | Small modals and compact content    |
| `containerSizes.lg`  | `512px`  | Standard content columns            |
| `containerSizes.xl`  | `576px`  | Wider content sections              |
| `containerSizes.2xl` | `672px`  | Form layouts and medium dialogs     |
| `containerSizes.3xl` | `768px`  | Tablet portrait width               |
| `containerSizes.4xl` | `896px`  | Wide content areas and large modals |
| `containerSizes.5xl` | `1024px` | Tablet landscape width              |
| `containerSizes.6xl` | `1152px` | Expansive layouts                   |
| `containerSizes.7xl` | `1280px` | Wide desktop layouts                |
| `containerSizes.8xl` | `1440px` | Maximum full-width desktop layouts  |

---

### Typography

**Source:** `src/foundation/typography.json`
**Panda categories:** `fonts`, `fontSizes`, `fontWeights`, `letterSpacings`, `lineHeights`

#### Font Families

**DTCG type:** `fontFamilies`

| Token           | Value              | Description                      |
| --------------- | ------------------ | -------------------------------- |
| `fonts.text`    | `Inter Tight`      | Primary sans-serif for body text |
| `fonts.display` | `Inter Tight`      | Sans-serif for product headings  |
| `fonts.serif`   | `Playfair Display` | Serif for marketing headings     |
| `fonts.mono`    | `Geist Mono`       | Monospace for code               |

#### Font Sizes

**DTCG type:** `fontSizes`

| Token           | Value  | Description            |
| --------------- | ------ | ---------------------- |
| `fontSizes.3xs` | `11px` | Smallest text size     |
| `fontSizes.2xs` | `12px` | Extra extra small text |
| `fontSizes.xs`  | `13px` | Extra small text       |
| `fontSizes.sm`  | `14px` | Small text             |
| `fontSizes.md`  | `16px` | Base body text         |
| `fontSizes.lg`  | `18px` | Large text             |
| `fontSizes.xl`  | `20px` | Extra large text       |
| `fontSizes.2xl` | `24px` | 2x large text          |
| `fontSizes.3xl` | `32px` | Heading size           |
| `fontSizes.4xl` | `40px` | Display size           |
| `fontSizes.5xl` | `48px` | Large display size     |
| `fontSizes.6xl` | `64px` | Largest display size   |

#### Font Weights

**DTCG type:** `fontWeights`

| Token                  | Value | Description     |
| ---------------------- | ----- | --------------- |
| `fontWeights.regular`  | `400` | Regular weight  |
| `fontWeights.medium`   | `500` | Medium weight   |
| `fontWeights.semibold` | `600` | Semibold weight |
| `fontWeights.bold`     | `700` | Bold weight     |

#### Letter Spacings

**DTCG type:** `letterSpacing`

| Token                     | Value | Typical usage                 |
| ------------------------- | ----- | ----------------------------- |
| `letterSpacings.dense`    | `-2%` | Display headings (40-64px)    |
| `letterSpacings.tight`    | `-1%` | Large headings (24-32px)      |
| `letterSpacings.normal`   | `0%`  | Body copy (20-24px)           |
| `letterSpacings.relaxed`  | `1%`  | Body text (18px)              |
| `letterSpacings.wide`     | `2%`  | Smaller body text (14-16px)   |
| `letterSpacings.loose`    | `4%`  | Footnotes and captions (12px) |
| `letterSpacings.spacious` | `10%` | Uppercase labels (12px)       |

#### Line Heights

**DTCG type:** `lineHeights`

| Token                 | Value  | Typical usage                     |
| --------------------- | ------ | --------------------------------- |
| `lineHeights.tight`   | `1.15` | Display headings (48-64px)        |
| `lineHeights.compact` | `1.2`  | Section headings (40px)           |
| `lineHeights.normal`  | `1.3`  | Body text and subtitles (12-24px) |
| `lineHeights.relaxed` | `1.4`  | Smaller body text and UI elements |

---

### Text Styles

**Source:** `src/foundation/textStyles.json`
**DTCG type:** `typography`

Composite text style tokens that bundle font family, size, weight, line height, and letter spacing into a single token. Split into two domains: **marketing** (serif headings for marketing pages) and **product** (sans-serif for the application UI).

Each text style provides four weight variants: `regular`, `medium`, `semibold`, `bold`. The recommended default variant is marked with `✦` in the token name.

#### Marketing Text Styles

Marketing styles use `Playfair Display` (serif) for headings and `Inter Tight` (sans-serif) for body.

##### Marketing Headings

| Style                        | Font             | Size         | Line Height | Letter Spacing | Default Weight         |
| ---------------------------- | ---------------- | ------------ | ----------- | -------------- | ---------------------- |
| `marketing.heading.h1`       | Playfair Display | 64px (`6xl`) | 115%        | -2%            | medium `✦`             |
| `marketing.heading.h2`       | Playfair Display | 48px (`5xl`) | 115%        | -2%            | medium `✦`             |
| `marketing.heading.h3`       | Playfair Display | 40px (`4xl`) | 120%        | -2%            | medium `✦`             |
| `marketing.heading.h4`       | Playfair Display | 24px (`2xl`) | 130%        | 0%             | semibold `✦`           |
| `marketing.heading.h5`       | Playfair Display | 18px (`lg`)  | 130%        | 1%             | semibold `✦`           |
| `marketing.heading.h6`       | Playfair Display | 16px (`md`)  | 140%        | 2%             | semibold `✦`           |
| `marketing.heading.overline` | Inter Tight      | 12px (`2xs`) | 130%        | 10%            | medium `✦` (uppercase) |

##### Marketing Body

| Style                     | Font        | Size         | Line Height | Letter Spacing | Default Weight                      |
| ------------------------- | ----------- | ------------ | ----------- | -------------- | ----------------------------------- |
| `marketing.body.lead1`    | Inter Tight | 24px (`2xl`) | 130%        | 1%             | regular `✦` / semibold `✦`          |
| `marketing.body.lead2`    | Inter Tight | 18px (`lg`)  | 130%        | 0%             | regular `✦` / semibold `✦`          |
| `marketing.body.body`     | Inter Tight | 16px (`md`)  | 130%        | 2%             | regular `✦` / semibold `✦`          |
| `marketing.body.caption`  | Inter Tight | 14px (`sm`)  | 130%        | 2%             | regular `✦` / medium `✦` / bold `✦` |
| `marketing.body.footnote` | Inter Tight | 12px (`2xs`) | 130%        | 4%             | medium `✦` / bold `✦`               |

#### Product Text Styles

Product styles use `Inter Tight` (sans-serif) for both headings and body.

##### Product Headings

| Style                | Font        | Size         | Line Height | Letter Spacing | Default Weight |
| -------------------- | ----------- | ------------ | ----------- | -------------- | -------------- |
| `product.heading.h1` | Inter Tight | 48px (`5xl`) | 120%        | 0%             | medium `✦`     |
| `product.heading.h2` | Inter Tight | 40px (`4xl`) | 120%        | 0%             | semibold `✦`   |
| `product.heading.h3` | Inter Tight | 32px (`3xl`) | 120%        | 0%             | semibold `✦`   |
| `product.heading.h4` | Inter Tight | 24px (`2xl`) | 120%        | 0%             | semibold `✦`   |
| `product.heading.h5` | Inter Tight | 20px (`xl`)  | 120%        | 0%             | semibold `✦`   |
| `product.heading.h6` | Inter Tight | 18px (`lg`)  | 120%        | 0%             | semibold `✦`   |

##### Product Body

| Style                    | Font        | Size         | Line Height | Letter Spacing | Default Weight             |
| ------------------------ | ----------- | ------------ | ----------- | -------------- | -------------------------- |
| `product.body.lead2`     | Inter Tight | 24px (`2xl`) | 130%        | 0%             | regular `✦` / semibold `✦` |
| `product.body.lead1`     | Inter Tight | 20px (`xl`)  | 130%        | 0%             | regular `✦` / semibold `✦` |
| `product.body.body2`     | Inter Tight | 18px (`lg`)  | 130%        | 1%             | regular `✦` / semibold `✦` |
| `product.body.body1`     | Inter Tight | 16px (`md`)  | 130%        | 1%             | regular `✦` / semibold `✦` |
| `product.body.caption2`  | Inter Tight | 14px (`sm`)  | 130%        | 2%             | regular `✦` / semibold `✦` |
| `product.body.caption1`  | Inter Tight | 13px (`xs`)  | 130%        | 2%             | medium `✦` / bold `✦`      |
| `product.body.footnote2` | Inter Tight | 12px (`2xs`) | 130%        | 4%             | medium `✦` / bold `✦`      |
| `product.body.footnote1` | Inter Tight | 11px (`3xs`) | 130%        | 4%             | medium `✦` / bold `✦`      |

---

### Radii

**Source:** `src/foundation/radii.json`
**Panda category:** `radii`
**DTCG type:** `borderRadius`

Border radius scale from sharp corners to full pill/circle shapes.

| Token        | Value    | Description                                 |
| ------------ | -------- | ------------------------------------------- |
| `radii.none` | `0`      | No border radius (square corners)           |
| `radii.2xs`  | `2px`    | Subtle rounding on small elements           |
| `radii.xs`   | `4px`    | Gentle rounding on compact components       |
| `radii.sm`   | `6px`    | Standard rounding on most UI elements       |
| `radii.md`   | `8px`    | Noticeable rounding on prominent components |
| `radii.lg`   | `12px`   | Prominent rounding on large elements        |
| `radii.xl`   | `16px`   | Strong rounding on containers and cards     |
| `radii.2xl`  | `24px`   | Very strong rounding on large containers    |
| `radii.3xl`  | `32px`   | Maximum radius before full circle           |
| `radii.full` | `9999px` | Full circle or pill shape (badges, buttons) |

---

### Shadows

**Source:** `src/foundation/shadows.json`
**Panda category:** `shadows`
**DTCG type:** `boxShadow`

Elevation shadows using layered drop shadows. All shadows use `colors.black` alpha references (`a5`, `a10`, `a25`). Multi-layer shadows combine a primary distance shadow with a tighter contact shadow for realism.

| Token         | Layers                                           | Description                                          |
| ------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `shadows.2xs` | `0 1px 0 0` black 5%                             | Minimal elevation, single-pixel bottom edge          |
| `shadows.xs`  | `0 1px 2px 0` black 5%                           | Subtle elevation for pressed or recessed elements    |
| `shadows.sm`  | `0 1px 3px 0` + `0 1px 2px -1px` black 10%       | Low elevation for cards and subtle UI elements       |
| `shadows.md`  | `0 4px 6px -1px` + `0 2px 4px -2px` black 10%    | Medium elevation for dropdowns and floating elements |
| `shadows.lg`  | `0 10px 15px -3px` + `0 4px 6px -4px` black 10%  | High elevation for modals and popovers               |
| `shadows.xl`  | `0 20px 25px -5px` + `0 8px 10px -6px` black 10% | Very high elevation for large overlays               |
| `shadows.2xl` | `0 25px 50px -12px` black 25%                    | Maximum elevation for dramatic floating elements     |

---

### Border Widths

**Source:** `src/foundation/borderWidths.json`
**Panda category:** `borderWidths`
**DTCG type:** `dimension`

| Token                  | Value   | Description                               |
| ---------------------- | ------- | ----------------------------------------- |
| `borderWidths.default` | `1px`   | Standard border width                     |
| `borderWidths.medium`  | `1.5px` | Medium border for emphasis                |
| `borderWidths.thick`   | `2px`   | Thick border for strong visual separation |

---

### Blurs

**Source:** `src/foundation/blurs.json`
**Panda category:** `blurs`
**DTCG type:** `dimension`

Blur radius scale for backdrop filters, glassmorphism, and soft focus effects.

| Token        | Value  | Description                                          |
| ------------ | ------ | ---------------------------------------------------- |
| `blurs.none` | `0px`  | No blur (crisp edges)                                |
| `blurs.xs`   | `2px`  | Ultra-subtle softening on fine details               |
| `blurs.sm`   | `4px`  | Gentle softening on tooltips and small overlays      |
| `blurs.md`   | `8px`  | Balanced softness on shadows and card surfaces       |
| `blurs.lg`   | `16px` | Visible softening on modal backdrops and dropdowns   |
| `blurs.xl`   | `24px` | Strong softness for glassmorphism and heavy overlays |

---

### Opacity

**Source:** `src/foundation/opacity.json`
**Panda category:** `opacity`
**DTCG type:** `opacity`

Named opacity values for common UI states.

| Token                 | Value | Description                        |
| --------------------- | ----- | ---------------------------------- |
| `opacity.disabled`    | `30%` | Disabled elements                  |
| `opacity.placeholder` | `50%` | Placeholder text in inputs         |
| `opacity.overlay`     | `70%` | Modal and dialog backdrop overlays |

---

### Durations

**Source:** `src/foundation/durations.json`
**Panda category:** `durations`
**DTCG type:** `dimension`

Animation and transition timing scale.

| Token               | Value   | Description                                      |
| ------------------- | ------- | ------------------------------------------------ |
| `durations.fastest` | `50ms`  | Instant feedback and micro-interactions          |
| `durations.faster`  | `100ms` | Quick transitions and hover effects              |
| `durations.fast`    | `150ms` | Snappy transitions on interactive elements       |
| `durations.normal`  | `200ms` | Standard transitions and animations (default)    |
| `durations.slow`    | `300ms` | Noticeable transitions and emphasis              |
| `durations.slower`  | `400ms` | Deliberate transitions and prominent animations  |
| `durations.slowest` | `500ms` | Very deliberate transitions and dramatic effects |

---

### Z-Index

**Source:** `src/foundation/zIndex.json`
**Panda category:** `zIndex`
**DTCG type:** `number`

Stacking order scale. Values jump in large increments (1000+) to leave room for intermediate z-indices in consumer apps.

| Token             | Value  | Description                               |
| ----------------- | ------ | ----------------------------------------- |
| `zIndex.hide`     | `-1`   | Hidden behind all content                 |
| `zIndex.base`     | `0`    | Default stacking level                    |
| `zIndex.docked`   | `10`   | Fixed sidebars, headers, navigation bars  |
| `zIndex.dropdown` | `1000` | Dropdown menus and select components      |
| `zIndex.sticky`   | `1100` | Sticky positioned elements                |
| `zIndex.banner`   | `1200` | Banner notifications and alert bars       |
| `zIndex.overlay`  | `1300` | Overlay backgrounds and backdrop elements |
| `zIndex.modal`    | `1400` | Modal dialogs                             |
| `zIndex.popover`  | `1500` | Popovers and floating content panels      |
| `zIndex.skipLink` | `1600` | Skip navigation links (accessibility)     |
| `zIndex.toast`    | `1700` | Toast notifications                       |
| `zIndex.tooltip`  | `1800` | Tooltips (highest UI element)             |

---

### Aspect Ratios

**Source:** `src/foundation/aspectRatios.json`
**Panda category:** `aspectRatios`
**DTCG type:** `other`

Common aspect ratios for images, video, cards, and layout containers.

| Token                    | Value       | Description                            |
| ------------------------ | ----------- | -------------------------------------- |
| `aspectRatios.square`    | `1 / 1`     | Equal width and height                 |
| `aspectRatios.landscape` | `4 / 3`     | Classic landscape for photos and cards |
| `aspectRatios.portrait`  | `3 / 4`     | Classic portrait for vertical content  |
| `aspectRatios.wide`      | `16 / 9`    | Widescreen for video and hero sections |
| `aspectRatios.ultrawide` | `18 / 5`    | Ultra-wide for cinematic banners       |
| `aspectRatios.golden`    | `1.618 / 1` | Golden ratio for harmonious layouts    |

---

### Cursors

**Source:** `src/foundation/cursors.json`
**Panda category:** `cursors`
**DTCG type:** `other`

Cursor values for interactive elements, ensuring consistent pointer behaviour across components.

| Token              | Value         | Description       |
| ------------------ | ------------- | ----------------- |
| `cursors.button`   | `pointer`     | Clickable buttons |
| `cursors.checkbox` | `default`     | Checkbox controls |
| `cursors.disabled` | `not-allowed` | Disabled elements |
| `cursors.menuitem` | `default`     | Menu items        |
| `cursors.option`   | `default`     | Select options    |
| `cursors.radio`    | `default`     | Radio controls    |
| `cursors.slider`   | `default`     | Slider controls   |
| `cursors.switch`   | `pointer`     | Toggle switches   |

---

### Breakpoints

**Source:** `src/foundation/breakpoints.json`
**Panda category:** `breakpoints`
**DTCG type:** `dimension`

Responsive breakpoints used by Panda's `theme.breakpoints` config. These are **not** regular tokens — they are passed directly to the Panda theme as flat maps.

| Token             | Value    | Description                         |
| ----------------- | -------- | ----------------------------------- |
| `breakpoints.sm`  | `640px`  | Large phones in landscape           |
| `breakpoints.md`  | `768px`  | Tablets in portrait                 |
| `breakpoints.lg`  | `1024px` | Tablets in landscape, small laptops |
| `breakpoints.xl`  | `1536px` | Standard desktop monitors           |
| `breakpoints.2xl` | `1920px` | Full HD screens and above           |

---

## Output Formats

| Format                | Path                                                        | Description                                         |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| CSS custom properties | `dist/css/tokens-{theme}.css`                               | `--reva-{category}-{name}` variables                |
| TypeScript constants  | `dist/ts/tokens-{theme}.ts`                                 | Named exports (`colorsBrand500`, `spacing4`)        |
| JSON (nested)         | `dist/json/tokens-{theme}.json`                             | Nested structure with resolved values               |
| JSON (flat, mobile)   | `dist/json-mobile/tokens-{theme}.json`                      | Flat camelCase keys for React Native                |
| W3C DTCG JSON         | `dist/json-dtcg/tokens-{theme}.json`                        | Standards-compliant `$value`/`$type` output         |
| Panda CSS             | `dist/panda/tokens.json`, `dist/panda/semantic-tokens.json` | `{ value }` format consumed by `@reva/panda-preset` |

## Build

```bash
bun run tokens:build    # Build all output formats
bun run build           # Same, via Turborepo
```

## How Panda CSS Consumes Tokens

`@reva/panda-preset` imports `@reva/tokens/panda/tokens` and `@reva/tokens/panda/semantic-tokens` and passes them to `defineTokens` / `defineSemanticTokens`.

`breakpoints` and `containerSizes` are defined directly in the preset as flat maps — they are Panda theme config, not token categories.

## Source of Truth

Code is the source of truth — tokens are authored here and synced bidirectionally with Figma via the Tokens Studio plugin. Never create Figma variables manually.
