---
name: tokens-studio-authoring
description: >
  Technical reference for writing valid Tokens Studio DTCG-format JSON
  design token files. Use this skill whenever creating, editing, or reviewing
  design token .json source files intended for Tokens Studio, or when the user
  mentions design tokens, token types, DTCG format, token references, token
  sets, sd-transforms, or Style Dictionary token authoring. Also trigger when
  generating tokens for colours, typography, spacing, shadows, borders,
  opacity, or any other design property in JSON. This skill prevents bugs in
  source tokens that would break the Tokens Studio to Style Dictionary
  transformation pipeline.
---

# Tokens Studio DTCG Format Reference

Technical reference for authoring design token JSON source files in the
Tokens Studio W3C DTCG format. These files are the source of truth that
Tokens Studio syncs with Figma and that engineers transform into
platform-specific code via Style Dictionary + `@tokens-studio/sd-transforms`.

Getting the source format wrong causes silent value errors, broken Figma
variable syncs, and failed builds. Follow these rules precisely.

---

## Token anatomy

Every token is a JSON object with dollar-prefixed properties per the
W3C DTCG specification:

```jsonc
{
  "amber": {
    "500": {
      "$value": "#f59e0b",
      "$type": "color",
      "$description": "Core amber midpoint.",
    },
  },
}
```

**Required properties:**

- `$value` : the design decision (format depends on type)
- `$type` : the token type string (see supported types below)

**Optional properties:**

- `$description` : a human-readable string documenting the intent

**Critical rules:**

- Always use the `$` prefix. Never write `"value"` or `"type"` without
  it. Tokens Studio in DTCG mode expects dollar-prefixed keys; omitting
  the prefix produces legacy-format tokens that are structurally
  different and will cause transformation issues.
- `$type` can be declared at **group level** and is inherited by all
  tokens nested within that group. This keeps files concise.
- `$description` must ONLY be placed on **leaf tokens** (nodes with a
  `$value`). Never place `$description` on group nodes — Tokens
  Studio misinterprets it as a child string token instead of metadata.
- Token groups are nested JSON objects. A dot in the Tokens Studio UI
  name (e.g. `color.amber.500`) becomes nested keys in JSON.

```jsonc
{
  "spacing": {
    "$type": "dimension",
    "1": { "$value": "4px" },
    "2": { "$value": "8px" },
    "3": { "$value": "12px" },
  },
}
```

---

## Supported token types

Use only the `$type` strings listed below. Anything else will be
rejected or silently misinterpreted by Tokens Studio and sd-transforms.

### Core types (W3C DTCG)

| `$type`         | `$value` format                      | Examples                              |
| --------------- | ------------------------------------ | ------------------------------------- |
| `color`         | Hex string (3, 4, 6, or 8 digit)     | `"#f59e0b"`, `"#0000"`, `"#f59e0b80"` |
| `dimension`     | Number + unit string (`px` or `rem`) | `"16px"`, `"1.5rem"`                  |
| `number`        | Unitless number                      | `4`, `1.5`, `300`                     |
| `letterSpacing` | Percentage string or em dimension    | `"-1%"`, `"0.02em"`                   |
| `border`        | Composite object                     | See composites section                |
| `boxShadow`     | Composite object or array of objects | See composites section                |
| `typography`    | Composite object                     | See composites section                |

### Typography types — ALWAYS use Tokens Studio types

For typography-related tokens, **always use the Tokens Studio types**
listed below, NOT the W3C DTCG official types (`fontFamily`,
`fontWeight`, `fontSize`, `lineHeight`).

**Why**: The W3C official typography types do not map to Figma variable
types. Tokens Studio silently skips them during Figma export — tokens
using official types will not appear as Figma variables. The Tokens
Studio types (`fontFamilies`, `fontWeights`, `fontSizes`,
`lineHeights`) are correctly mapped and exported. `sd-transforms`
converts them to their DTCG equivalents at build time, so there is no
loss on the engineering side.

| `$type`        | `$value` format                      | Examples                              |
| -------------- | ------------------------------------ | ------------------------------------- |
| `fontFamilies` | String or array of strings           | `"Inter"`, `["Inter", "sans-serif"]`  |
| `fontWeights`  | Numeric weight or named string       | `400`, `"Bold"`, `"Semi Bold"`        |
| `fontSizes`    | Number + unit string (`px` or `rem`) | `"16px"`, `"1rem"`                    |
| `lineHeights`  | Unitless number or percentage string | `1.5`, `"150%"`                       |

### Other Tokens Studio types

These are Tokens Studio extensions that predate the W3C spec. They are
valid in source files and are converted to their DTCG equivalents by
the `@tokens-studio/sd-transforms` preprocessor during the build.

| `$type`            | Transformed to   | `$value` format                                            |
| ------------------ | ---------------- | ---------------------------------------------------------- |
| `borderRadius`     | `dimension`      | `"8px"`, `"50%"`, or shorthand `"8px 0 8px 0"`             |
| `borderWidth`      | `dimension`      | `"1px"`, `"2px"`                                           |
| `spacing`          | `dimension`      | `"16px"`, `"1rem"`                                         |
| `sizing`           | `dimension`      | `"48px"`, `"100%"`                                         |
| `opacity`          | `number`         | `"0.5"` or `"50%"`                                         |
| `paragraphSpacing` | `dimension`      | `"16px"`, `"24px"`                                         |
| `textCase`         | `textCase`       | `"uppercase"`, `"lowercase"`, `"capitalize"`, `"none"`     |
| `textDecoration`   | `textDecoration` | `"underline"`, `"line-through"`, `"none"`                  |
| `boolean`          | `boolean`        | `"true"` or `"false"` (must be strings, not JSON booleans) |
| `text`             | `content`        | Any string                                                 |
| `asset`            | `asset`          | URL string                                                 |
| `other`            | `other`          | Any value                                                  |
| `composition`      | (expanded)       | **Legacy. Do not create new composition tokens.**          |

---

## Composite token structures

Composite tokens combine multiple related properties into a single
`$value` object. The property names inside composites are **camelCase**,
never kebab-case.

### Typography

Valid properties within a typography `$value`:

`fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `letterSpacing`,
`paragraphSpacing`, `paragraphIndent`, `textCase`, `textDecoration`

All are optional. Include only the properties relevant to the design
decision.

**Important**: `lineHeight` and `letterSpacing` inside typography
composites must be **hardcoded as percentage strings** (e.g.,
`"130%"`, `"-1%"`), not token references. These properties use
`lineHeights` and `letterSpacing` types respectively, which Tokens
Studio cannot resolve as Figma variables inside composites. Hardcode
the actual values instead. Also note that bare numbers for
`lineHeight` (e.g., `1.3`) are interpreted as pixel values by Figma
— always use `"%"` format (e.g., `"130%"`).

`fontFamily`, `fontWeight`, and `fontSize` can use token references
normally.

```jsonc
{
  "$type": "typography",
  "$value": {
    "fontFamily": "{fonts.display}",
    "fontWeight": "{fontWeights.semibold}",
    "fontSize": "{fontSizes.2xl}",
    "lineHeight": "130%",
    "letterSpacing": "-1%",
    "textCase": "none",
    "textDecoration": "none",
  },
}
```

### Border

Valid properties: `color`, `width`, `style`

The `style` property accepts: `"solid"`, `"dashed"`, `"dotted"`.

```jsonc
{
  "$type": "border",
  "$value": {
    "color": "{color.border.default}",
    "width": "{borderWidth.1}",
    "style": "solid",
  },
}
```

### Box Shadow

Valid properties: `color`, `x`, `y`, `blur`, `spread`, `type`

The `$type` is `"boxShadow"` (not `"shadow"`).

The `type` property inside `$value` accepts only `"dropShadow"` or
`"innerShadow"`.

Single shadow:

```jsonc
{
  "$type": "boxShadow",
  "$value": {
    "color": "#00000026",
    "x": "0",
    "y": "1",
    "blur": "3",
    "spread": "0",
    "type": "dropShadow",
  },
}
```

Multiple shadows use an array of objects as the `$value`:

```jsonc
{
  "$type": "boxShadow",
  "$value": [
    {
      "color": "#00000026",
      "x": "0",
      "y": "2",
      "blur": "4",
      "spread": "-1",
      "type": "dropShadow",
    },
    {
      "color": "#0000001a",
      "x": "0",
      "y": "4",
      "blur": "6",
      "spread": "-1",
      "type": "dropShadow",
    },
  ],
}
```

---

## References and aliases

Reference another token by wrapping its full dot-notation path in
curly braces within a `$value`:

```jsonc
{ "$value": "{color.amber.500}", "$type": "color" }
```

**Syntax rules:**

- Path segments map to the JSON nesting hierarchy:
  `{color.amber.500}` resolves to the token at
  `color` > `amber` > `500`.
- References work **across token sets**. At build time all enabled and
  source sets are merged before references are resolved.
- References can be used inside composite values:
  `"fontFamily": "{font.family.display}"`.
- Math expressions are supported within `$value`:
  `"{spacing.2} * 2"`, `"{spacing.base} + 4"`.
  Always use spaces around operators.
- Compatible types can be cross-referenced. For instance, a `fontSize`
  property inside a typography composite can reference a `dimension`
  token.
- **Never create circular references** (A references B which references
  A). This will cause an infinite loop and fail the build.
- A reference to a non-existent token path will produce an unresolved
  value error at build time. Always verify the target exists.

---

## Token sets and multi-file sync

When using multi-file sync (the standard for code-based workflows),
each token set is a separate `.json` file. Folder hierarchy in the
file system mirrors the `/` separator in set names within Tokens Studio.

Two special files sit alongside the token set files:

**`$metadata.json`** records the ordered list of token sets:

```jsonc
{
  "tokenSetOrder": [
    "primitive/color",
    "primitive/dimension",
    "semantic/color",
    "theme/light",
    "theme/dark",
  ],
}
```

Set order matters because when multiple enabled sets define the same
token name, the **lowest set in the list wins** (last-write-wins
cascade, similar to CSS specificity).

**`$themes.json`** maps sets to named themes with a status per set:

```jsonc
[
  {
    "id": "some-uuid",
    "name": "Light",
    "selectedTokenSets": {
      "primitive/color": "source",
      "semantic/color": "enabled",
      "theme/light": "enabled",
    },
  },
]
```

Valid statuses for each set within a theme:

- `"source"` : provides values for reference resolution but does not
  produce output variables/styles on its own.
- `"enabled"` : resolves references and produces outputs.
- `"disabled"` : ignored entirely.

When creating a new token set file, always add it to the
`tokenSetOrder` array in `$metadata.json` and, if applicable, to the
`selectedTokenSets` in relevant themes in `$themes.json`.

---

## Common errors and how to avoid them

1. **Missing `$` prefix on keys.** `"type"` and `"value"` are legacy
   format. Always use `"$type"` and `"$value"`.

2. **Bare numbers for dimensions.** `"$value": 16` is wrong for a
   `dimension` token. It must be `"$value": "16px"`. Only `number`
   type tokens accept unitless values.

3. **Wrong property names in composites.** `"font-family"` is wrong.
   Use `"fontFamily"` (camelCase).

4. **Wrong shadow `$type`.** The token `$type` must be `"boxShadow"`,
   not `"shadow"`. Inside the `$value` object, the `type` property
   accepts only `"dropShadow"` or `"innerShadow"`.

5. **Native JSON booleans for `boolean` tokens.** The `boolean` type
   expects the string `"true"` or `"false"`, not the JSON literal
   `true` / `false`.

6. **Circular references.** A > B > A will fail the build.

7. **Orphaned token set files.** A new `.json` file that is not listed
   in `$metadata.json` will be invisible to Tokens Studio.

8. **Trailing commas or comments in JSON.** Source files must be valid
   JSON. No trailing commas, no `//` comments (the `jsonc` examples
   in this skill are for readability only).

9. **Creating new `composition` tokens.** This type is legacy and
   scheduled for removal. Use the appropriate specific type instead.

10. **Forgetting that `$type` is inherited.** If a parent group declares
    `"$type": "color"`, every direct child token inherits that type.
    Redeclaring `$type` on individual tokens inside that group is
    redundant but not harmful. However, placing a non-colour token
    inside a group typed as `color` without overriding `$type` on
    that token will cause a type mismatch.

11. **Using W3C official types for typography tokens.** The official
    types `fontFamily`, `fontWeight`, `fontSize`, `lineHeight` are
    valid DTCG but **do not export to Figma variables**. Tokens Studio
    silently skips them. Always use the Tokens Studio types instead:
    `fontFamilies`, `fontWeights`, `fontSizes`, `lineHeights`.

12. **`$description` on groups (non-leaf nodes).** The W3C DTCG spec
    allows `$description` at group level, but **Tokens Studio treats
    it as a child string token** instead of group metadata. This
    creates a phantom `$description` token visible in the Figma
    plugin under the "Other" category, polluting the token tree.
    **Only place `$description` on leaf tokens** (objects that have a
    `$value`). To document a group's purpose, use a code comment
    workflow (e.g., a companion docs file or inline comments in a
    build script) — never a `$description` key on the group itself.

    Wrong:
    ```json
    {
      "neutral": {
        "$description": "Neutral grey scale",
        "50": { "$value": "#fafafa" }
      }
    }
    ```

    Right — description only on leaf tokens:
    ```json
    {
      "neutral": {
        "50": { "$value": "#fafafa", "$description": "Lightest neutral" }
      }
    }
    ```
