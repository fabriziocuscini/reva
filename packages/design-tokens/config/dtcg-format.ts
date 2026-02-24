/**
 * Produces W3C DTCG-compliant JSON from token source files.
 * Preserves $type (at group level), $description, and nested structure.
 * Resolves $value references using SD's resolved output.
 */

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
interface JsonObject {
  [key: string]: JsonValue
}

const DTCG_META_KEYS = new Set(['$type', '$description', '$extensions'])

/**
 * Checks if a node is a DTCG token leaf (has $value).
 */
function isTokenLeaf(node: JsonValue): node is JsonObject {
  return (
    typeof node === 'object' &&
    node !== null &&
    !Array.isArray(node) &&
    '$value' in node
  )
}

/**
 * Deep-merges multiple source JSON objects. Later sources override earlier ones.
 * Used to combine foundation + semantic sources into a single DTCG tree.
 */
function deepMerge(...sources: JsonObject[]): JsonObject {
  const result: JsonObject = {}
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !isTokenLeaf(value) &&
        typeof result[key] === 'object' &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key] as JsonObject, value as JsonObject)
      } else {
        result[key] = value
      }
    }
  }
  return result
}

/**
 * Resolves a single $value using the SD resolved output.
 * - Reference strings like "{colors.neutral.950}" → resolved hex value
 * - Composite $value (shadow objects/arrays) → keep DTCG composite structure
 * - Primitive $value → use as-is (already resolved)
 */
function resolveValue(
  rawValue: JsonValue,
  resolvedValue: JsonValue | undefined,
): JsonValue {
  // Composite $value (shadow object or array) — keep the DTCG structure
  if (typeof rawValue === 'object' && rawValue !== null) {
    return rawValue
  }
  // Reference string — use SD's resolved value
  if (typeof rawValue === 'string' && rawValue.startsWith('{') && rawValue.endsWith('}')) {
    return resolvedValue !== undefined ? resolvedValue : rawValue
  }
  // Primitive — use as-is
  return rawValue
}

/**
 * Recursively walks the merged DTCG source tree and resolves $value references
 * using the corresponding resolved JSON from Style Dictionary.
 */
function resolveTree(source: JsonObject, resolved: JsonObject): JsonObject {
  const result: JsonObject = {}

  for (const [key, value] of Object.entries(source)) {
    // Preserve DTCG metadata as-is
    if (DTCG_META_KEYS.has(key)) {
      result[key] = value
      continue
    }

    if (isTokenLeaf(value)) {
      // Token leaf — resolve its $value, keep $description etc.
      const leaf: JsonObject = {}
      for (const [leafKey, leafVal] of Object.entries(value)) {
        if (leafKey === '$value') {
          leaf['$value'] = resolveValue(leafVal, resolved[key] as JsonValue)
        } else {
          leaf[leafKey] = leafVal
        }
      }
      result[key] = leaf
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Group — recurse
      const resolvedChild =
        typeof resolved[key] === 'object' &&
        resolved[key] !== null &&
        !Array.isArray(resolved[key])
          ? (resolved[key] as JsonObject)
          : {}
      result[key] = resolveTree(value as JsonObject, resolvedChild)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Builds a W3C DTCG-compliant JSON output for a theme.
 *
 * @param sourceFiles - Raw DTCG source JSON files (foundation + semantic for the theme)
 * @param resolvedJson - SD's resolved json/nested output (flat values, no $value/$type)
 * @returns Proper DTCG JSON with $value, $type, $description preserved
 */
export function buildDtcgOutput(
  sourceFiles: JsonObject[],
  resolvedJson: JsonObject,
): JsonObject {
  const merged = deepMerge(...sourceFiles)
  return resolveTree(merged, resolvedJson)
}
