import { defineGlobalStyles } from '@pandacss/dev'

export const globalCss = defineGlobalStyles({
  'html, body': {
    color: 'fg.default',
    backgroundColor: 'bg.surface',
    fontFamily: 'text',
    fontSize: 'md',
    lineHeight: 'normal',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
})
