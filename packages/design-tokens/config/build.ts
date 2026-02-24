import { register } from '@tokens-studio/sd-transforms'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import StyleDictionary from 'style-dictionary'
import { buildDtcgOutput } from './dtcg-format'
import { buildPandaTokens, buildPandaSemanticTokens } from './panda-format'

// Register Tokens Studio transforms + preprocessor on the SD class
register(StyleDictionary, {
  excludeParentKeys: false,
  'ts/color/modifiers': { format: 'hex' },
})

interface Theme {
  id: string
  name: string
  selectedTokenSets: Record<string, 'source' | 'enabled' | 'disabled'>
}

async function build() {
  const srcDir = resolve(import.meta.dirname, '..', 'src')
  const distDir = resolve(import.meta.dirname, '..', 'dist')

  const $themes: Theme[] = JSON.parse(
    await readFile(resolve(srcDir, '$themes.json'), 'utf-8'),
  )

  for (const theme of $themes) {
    const source = Object.entries(theme.selectedTokenSets)
      .filter(([, status]) => status !== 'disabled')
      .map(([tokenset]) => resolve(srcDir, `${tokenset}.json`))

    const sd = new StyleDictionary({
      source,
      preprocessors: ['tokens-studio'],
      platforms: {
        css: {
          transformGroup: 'tokens-studio',
          transforms: ['name/kebab'],
          prefix: 'reva',
          buildPath: `${distDir}/css/`,
          files: [
            {
              destination: `tokens-${theme.name}.css`,
              format: 'css/variables',
              options: { outputReferences: true },
            },
          ],
        },

        ts: {
          transformGroup: 'tokens-studio',
          transforms: ['name/camel'],
          buildPath: `${distDir}/ts/`,
          files: [
            {
              destination: `tokens-${theme.name}.ts`,
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
              destination: `tokens-${theme.name}.json`,
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
              destination: `tokens-${theme.name}.json`,
              format: 'json/flat',
            },
          ],
        },
      },
    })

    await sd.cleanAllPlatforms()
    await sd.buildAllPlatforms()
    console.log(`✓ Built theme: ${theme.name}`)

    // Post-processing: generate W3C DTCG-compliant JSON per theme
    const themeSources = Object.entries(theme.selectedTokenSets)
      .filter(([, status]) => status !== 'disabled')
      .map(([tokenset]) => resolve(srcDir, `${tokenset}.json`))
    const dtcgSourceFiles = await Promise.all(
      themeSources.map(async (f) => JSON.parse(await readFile(f, 'utf-8'))),
    )
    const resolvedJson = JSON.parse(
      await readFile(
        resolve(distDir, `json/tokens-${theme.name}.json`),
        'utf-8',
      ),
    )
    const dtcgOutput = buildDtcgOutput(dtcgSourceFiles, resolvedJson)

    await mkdir(resolve(distDir, 'json-dtcg'), { recursive: true })
    await writeFile(
      resolve(distDir, `json-dtcg/tokens-${theme.name}.json`),
      JSON.stringify(dtcgOutput, null, 2),
    )
    console.log(`✓ Built DTCG: ${theme.name}`)
  }

  // Post-processing: generate Panda CSS-compatible output
  const foundationFiles = [
    'foundation/colors.json',
    'foundation/spacing.json',
    'foundation/typography.json',
    'foundation/radii.json',
    'foundation/shadows.json',
  ]
  const foundationSources = await Promise.all(
    foundationFiles.map(async (f) =>
      JSON.parse(await readFile(resolve(srcDir, f), 'utf-8')),
    ),
  )
  // Resolved JSON output needed for composite values (e.g., shadows)
  const lightDtcg = JSON.parse(
    await readFile(resolve(distDir, 'json/tokens-light.json'), 'utf-8'),
  )
  const pandaTokens = buildPandaTokens(foundationSources, lightDtcg)

  const lightSemantic = JSON.parse(
    await readFile(resolve(srcDir, 'semantic/colors.json'), 'utf-8'),
  )
  const darkSemantic = JSON.parse(
    await readFile(resolve(srcDir, 'semantic/colors-dark.json'), 'utf-8'),
  )
  const pandaSemanticTokens = buildPandaSemanticTokens(
    lightSemantic,
    darkSemantic,
  )

  await mkdir(resolve(distDir, 'panda'), { recursive: true })
  await writeFile(
    resolve(distDir, 'panda/tokens.json'),
    JSON.stringify(pandaTokens, null, 2),
  )
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
