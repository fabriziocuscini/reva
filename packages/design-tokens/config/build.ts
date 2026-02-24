import { register } from '@tokens-studio/sd-transforms'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import StyleDictionary from 'style-dictionary'

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

        'json-dtcg': {
          transformGroup: 'tokens-studio',
          transforms: ['name/kebab'],
          buildPath: `${distDir}/json-dtcg/`,
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
  }
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
