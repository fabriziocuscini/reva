import { defineGlobalStyles } from '@pandacss/dev'

export const globalCss = defineGlobalStyles({
  'html, body': {
    color: 'fg.default',
    backgroundColor: 'bg.surface',
    fontFamily: 'sans',
    fontSize: 'md',
    lineHeight: 'normal',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
})
