import { defineKeyframes } from '@pandacss/dev'

export const keyframes = defineKeyframes({
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideDown: {
    from: { height: 0, opacity: 0 },
    to: { height: 'var(--height)', opacity: 1 },
  },
  slideUp: {
    from: { height: 'var(--height)', opacity: 1 },
    to: { height: 0, opacity: 0 },
  },
})
