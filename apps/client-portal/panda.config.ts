import { defineConfig } from '@pandacss/dev'
import { revaPandaConfig } from '@reva/panda-preset'

export default defineConfig({
  ...revaPandaConfig,
  include: ['./src/**/*.{ts,tsx}'],
  outdir: 'styled-system',
  outExtension: 'js',
  jsxFramework: 'react',
  staticCss: {
    recipes: '*',
  },
})
