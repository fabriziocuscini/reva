import { definePreset } from '@pandacss/dev'

import { breakpoints } from './breakpoints'
import { conditions } from './conditions'
import { containerSizes } from './container-sizes'
import { globalCss } from './global-css'
import { keyframes } from './keyframes'
import { button } from './recipes'
import { semanticTokens } from './semantic-tokens'
import { textStyles } from './text-styles'
import { tokens } from './tokens'

export const revaPreset = definePreset({
  name: '@reva/panda-preset',
  conditions,
  globalCss,
  theme: {
    breakpoints,
    containerSizes,
    tokens,
    semanticTokens,
    recipes: {
      button,
    },
    keyframes,
    textStyles,
  },
})
