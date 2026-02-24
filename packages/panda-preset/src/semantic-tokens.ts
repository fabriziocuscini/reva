import { defineSemanticTokens } from '@pandacss/dev'

export const semanticTokens = defineSemanticTokens({
  colors: {
    fg: {
      default: {
        value: { _light: '{colors.neutral.950}', _dark: '{colors.neutral.50}' },
      },
      subtle: {
        value: { _light: '{colors.neutral.600}', _dark: '{colors.neutral.400}' },
      },
      disabled: {
        value: { _light: '{colors.neutral.400}', _dark: '{colors.neutral.600}' },
      },
      onBrand: {
        value: { _light: '{colors.white}', _dark: '{colors.white}' },
      },
    },
    bg: {
      surface: {
        value: { _light: '{colors.white}', _dark: '{colors.neutral.950}' },
      },
      subtle: {
        value: { _light: '{colors.neutral.50}', _dark: '{colors.neutral.900}' },
      },
      muted: {
        value: { _light: '{colors.neutral.100}', _dark: '{colors.neutral.800}' },
      },
    },
    border: {
      default: {
        value: { _light: '{colors.neutral.200}', _dark: '{colors.neutral.700}' },
      },
      subtle: {
        value: { _light: '{colors.neutral.100}', _dark: '{colors.neutral.800}' },
      },
    },
    brand: {
      solid: {
        value: { _light: '{colors.brand.600}', _dark: '{colors.brand.500}' },
      },
      subtle: {
        value: { _light: '{colors.brand.100}', _dark: '{colors.brand.900}' },
      },
      fg: {
        value: { _light: '{colors.brand.700}', _dark: '{colors.brand.300}' },
      },
    },
  },
})
