import { definePreset } from '@pandacss/dev'

import { conditions } from './conditions'
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
    tokens,
    semanticTokens,
    recipes: {
      button,
    },
    keyframes,
    textStyles,
  },
})
