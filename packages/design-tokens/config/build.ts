import { register } from '@tokens-studio/sd-transforms'
import { mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import StyleDictionary from 'style-dictionary'
import { buildDtcgOutput } from './dtcg-format'
import { buildPandaSemanticTokens, buildPandaTokens } from './panda-format'

// Register Tokens Studio transforms + preprocessor on the SD class
register(StyleDictionary, {
  excludeParentKeys: false,
  'ts/color/modifiers': { format: 'hex' },
})

// Custom transform: convert px values to rem for CSS output only.
// Runs after tokens-studio transforms so letter-spacing (em) and shadows
// (composite strings) are already resolved and won't match the regex.
StyleDictionary.registerTransform({
  name: 'reva/size/pxToRem',
  type: 'value',
  transitive: true,
  filter: (token) => {
    const val = String(token.$value ?? token.value)
    return /^-?\d+(\.\d+)?px$/.test(val)
  },
  transform: (token) => {
    const val = String(token.$value ?? token.value)
    const px = parseFloat(val)
    if (px === 0) return '0'
    return `${px / 16}rem`
  },
})

// Files that Style Dictionary cannot process (e.g. composite typography styles)
const sdExclude = new Set(['textStyles.json'])

/**
 * Discovers foundation token files from the filesystem instead of reading
 * $themes.json. This decouples the build from Tokens Studio theme config,
 * which is managed via the Figma plugin and should not be edited manually.
 */
async function getFoundationFiles(srcDir: string): Promise<string[]> {
  const dir = resolve(srcDir, 'foundation')
  const entries = await readdir(dir)
  return entries
    .filter((f) => f.endsWith('.json') && !sdExclude.has(f))
    .sort()
    .map((f) => resolve(dir, f))
}

/**
 * Discovers component token files. Component tokens reference semantic tokens
 * and are mode-agnostic — they resolve differently per color mode.
 */
async function getComponentFiles(srcDir: string): Promise<string[]> {
  const dir = resolve(srcDir, 'component')
  try {
    const entries = await readdir(dir)
    return entries
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((f) => resolve(dir, f))
  } catch {
    return [] // component/ directory may not exist yet
  }
}

/** Shared SD platform config for non-CSS platforms (keep px values). */
function nonCssPlatforms(distDir: string, name: string) {
  return {
    ts: {
      transformGroup: 'tokens-studio',
      transforms: ['name/camel'],
      buildPath: `${distDir}/ts/`,
      files: [
        {
          destination: `tokens-${name}.ts`,
          format: 'javascript/es6',
        },
      ],
    },

    json: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: `${distDir}/json/`,
      files: [
        {
          destination: `tokens-${name}.json`,
          format: 'json/nested',
        },
      ],
    },

    'json-mobile': {
      transformGroup: 'tokens-studio',
      transforms: ['name/camel'],
      buildPath: `${distDir}/json-mobile/`,
      files: [
        {
          destination: `tokens-${name}.json`,
          format: 'json/flat',
        },
      ],
    },
  }
}

async function build() {
  const srcDir = resolve(import.meta.dirname, '..', 'src')
  const distDir = resolve(import.meta.dirname, '..', 'dist')

  const foundationFiles = await getFoundationFiles(srcDir)
  const componentFiles = await getComponentFiles(srcDir)
  const colorModeDir = resolve(srcDir, 'colorMode')

  // ── Foundation build ─────────────────────────────────────────────────
  const sdFoundation = new StyleDictionary({
    source: foundationFiles,
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/kebab', 'reva/size/pxToRem'],
        prefix: 'reva',
        buildPath: `${distDir}/css/`,
        files: [
          {
            destination: 'tokens-foundation.css',
            format: 'css/variables',
            options: { outputReferences: true },
          },
        ],
      },
      ...nonCssPlatforms(distDir, 'foundation'),
    },
  })

  await sdFoundation.cleanAllPlatforms()
  await sdFoundation.buildAllPlatforms()
  console.log('✓ Built theme: foundation')

  // ── Light / dark builds ──────────────────────────────────────────────
  // Foundation files are `source` (available for reference resolution but
  // not output). The colorMode file is the only `include` that gets output.
  for (const mode of ['light', 'dark'] as const) {
    const colorModeFile = resolve(colorModeDir, `${mode}.json`)

    const sd = new StyleDictionary({
      source: [colorModeFile, ...componentFiles],
      include: foundationFiles,
      preprocessors: ['tokens-studio'],
      platforms: {
        css: {
          transformGroup: 'tokens-studio',
          transforms: ['name/kebab', 'reva/size/pxToRem'],
          prefix: 'reva',
          buildPath: `${distDir}/css/`,
          files: [
            {
              destination: `tokens-${mode}.css`,
              format: 'css/variables',
              options: { outputReferences: true },
            },
          ],
        },
        ...nonCssPlatforms(distDir, mode),
      },
    })

    await sd.cleanAllPlatforms()
    await sd.buildAllPlatforms()
    console.log(`✓ Built theme: ${mode}`)
  }

  // ── DTCG post-processing ─────────────────────────────────────────────
  // Foundation DTCG
  const foundationSources = await Promise.all(
    foundationFiles.map(async (f) => JSON.parse(await readFile(f, 'utf-8'))),
  )
  const foundationResolved = JSON.parse(
    await readFile(resolve(distDir, 'json/tokens-foundation.json'), 'utf-8'),
  )
  const foundationDtcg = buildDtcgOutput(foundationSources, foundationResolved)

  await mkdir(resolve(distDir, 'json-dtcg'), { recursive: true })
  await writeFile(
    resolve(distDir, 'json-dtcg/tokens-foundation.json'),
    JSON.stringify(foundationDtcg, null, 2),
  )
  console.log('✓ Built DTCG: foundation')

  // Light / dark DTCG
  for (const mode of ['light', 'dark'] as const) {
    const colorModeSource = JSON.parse(
      await readFile(resolve(colorModeDir, `${mode}.json`), 'utf-8'),
    )
    const componentSources = await Promise.all(
      componentFiles.map(async (f) => JSON.parse(await readFile(f, 'utf-8'))),
    )
    const allSources = [...foundationSources, colorModeSource, ...componentSources]
    const resolvedJson = JSON.parse(
      await readFile(resolve(distDir, `json/tokens-${mode}.json`), 'utf-8'),
    )
    const dtcgOutput = buildDtcgOutput(allSources, resolvedJson)

    await writeFile(
      resolve(distDir, `json-dtcg/tokens-${mode}.json`),
      JSON.stringify(dtcgOutput, null, 2),
    )
    console.log(`✓ Built DTCG: ${mode}`)
  }

  // ── Panda CSS output ─────────────────────────────────────────────────
  const lightResolved = JSON.parse(
    await readFile(resolve(distDir, 'json/tokens-light.json'), 'utf-8'),
  )
  const pandaTokens = buildPandaTokens(foundationSources, lightResolved)

  const lightSemantic = JSON.parse(await readFile(resolve(colorModeDir, 'light.json'), 'utf-8'))
  const darkSemantic = JSON.parse(await readFile(resolve(colorModeDir, 'dark.json'), 'utf-8'))
  const pandaSemanticTokens = buildPandaSemanticTokens(lightSemantic, darkSemantic)

  await mkdir(resolve(distDir, 'panda'), { recursive: true })
  await writeFile(resolve(distDir, 'panda/tokens.json'), JSON.stringify(pandaTokens, null, 2))
  await writeFile(
    resolve(distDir, 'panda/semantic-tokens.json'),
    JSON.stringify(pandaSemanticTokens, null, 2),
  )
  console.log('✓ Built Panda CSS output')
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
