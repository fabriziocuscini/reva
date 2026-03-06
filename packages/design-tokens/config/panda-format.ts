/**
 * Transforms token source JSON files into Panda CSS-compatible structures.
 * Used as a post-processing step after SD builds.
 */

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
interface JsonObject {
  [key: string]: JsonValue
}

const METADATA_KEYS = new Set(['$description', '$type', '$extensions'])

/**
 * Checks if a DTCG source value is a token leaf (has $value).
 */
function isDtcgLeaf(value: JsonValue): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && '$value' in value
}

/**
 * Resolves a DTCG `$value` to a plain value for Panda.
 * For simple types this is the `$value` itself. For composites (like shadow)
 * we use the resolved value from the SD DTCG output instead.
 */
function resolveDtcgValue(value: JsonValue, resolvedValue?: JsonValue): JsonValue {
  const raw = (value as JsonObject)['$value']
  // If $value is an object or array (composite type like shadow), prefer
  // the resolved string from SD output
  if (typeof raw === 'object' && raw !== null && resolvedValue !== undefined) {
    return resolvedValue
  }
  // For array values (fontFamily), join them
  if (Array.isArray(raw)) {
    return raw.join(', ')
  }
  return raw as JsonValue
}

/**
 * Recursively transforms DTCG source JSON into Panda's `{ value: ... }` structure.
 * Uses the resolved DTCG output to get final values for composite tokens (shadows).
 */
function transformSourceToPanda(source: JsonObject, resolved?: JsonObject): JsonObject {
  const result: JsonObject = {}

  for (const [key, value] of Object.entries(source)) {
    if (METADATA_KEYS.has(key)) continue

    if (isDtcgLeaf(value)) {
      const resolvedVal = resolved?.[key]
      result[key] = { value: resolveDtcgValue(value, resolvedVal) }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const resolvedChild =
        typeof resolved?.[key] === 'object' && resolved[key] !== null
          ? (resolved[key] as JsonObject)
          : undefined
      result[key] = transformSourceToPanda(value as JsonObject, resolvedChild)
    }
  }

  return result
}

/**
 * Transforms foundation token source files into a Panda `defineTokens`
 * compatible structure. Reads from source DTCG files (not merged SD output)
 * to ensure only foundation tokens are included — no semantic tokens.
 *
 * Uses the resolved SD output only for composite values (e.g., shadows)
 * where the $value is a structured object that SD transforms into a string.
 */
export function buildPandaTokens(sourceFiles: JsonObject[], resolvedDtcg: JsonObject): JsonObject {
  const result: JsonObject = {}
  for (const source of sourceFiles) {
    for (const [key, value] of Object.entries(source)) {
      if (METADATA_KEYS.has(key)) continue
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const resolvedChild =
          typeof resolvedDtcg[key] === 'object' && resolvedDtcg[key] !== null
            ? (resolvedDtcg[key] as JsonObject)
            : undefined
        result[key] = transformSourceToPanda(value as JsonObject, resolvedChild)
      }
    }
  }
  return result
}

/**
 * Reads source semantic JSON files (preserving reference strings) and merges
 * light/dark into Panda's `defineSemanticTokens` conditional structure.
 *
 * Input (light): `{ "colors": { "fg": { "default": { "$value": "{colors.neutral.950}" } } } }`
 * Input (dark):  `{ "colors": { "fg": { "default": { "$value": "{colors.neutral.50}" } } } }`
 * Output:        `{ "colors": { "fg": { "default": { "value": { "_light": "{colors.neutral.950}", "_dark": "{colors.neutral.50}" } } } } }`
 */
export function buildPandaSemanticTokens(lightJson: JsonObject, darkJson: JsonObject): JsonObject {
  return mergeSemanticTrees(lightJson, darkJson)
}

function mergeSemanticTrees(light: JsonObject, dark: JsonObject): JsonObject {
  const result: JsonObject = {}

  for (const [key, lightValue] of Object.entries(light)) {
    if (METADATA_KEYS.has(key)) continue

    const darkValue = (dark as JsonObject)[key]

    // Check if this is a token leaf (has $value)
    if (
      typeof lightValue === 'object' &&
      lightValue !== null &&
      !Array.isArray(lightValue) &&
      '$value' in lightValue
    ) {
      const lightRef = (lightValue as JsonObject)['$value'] as string
      const darkRef =
        typeof darkValue === 'object' &&
        darkValue !== null &&
        !Array.isArray(darkValue) &&
        '$value' in darkValue
          ? ((darkValue as JsonObject)['$value'] as string)
          : lightRef

      result[key] = {
        value: { _light: lightRef, _dark: darkRef },
      }
    } else if (
      typeof lightValue === 'object' &&
      lightValue !== null &&
      !Array.isArray(lightValue)
    ) {
      // Recurse into groups
      result[key] = mergeSemanticTrees(
        lightValue as JsonObject,
        (typeof darkValue === 'object' && darkValue !== null ? darkValue : {}) as JsonObject,
      )
    }
  }

  return result
}
