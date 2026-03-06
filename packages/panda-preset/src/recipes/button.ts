import { defineRecipe } from '@pandacss/dev'

export const button = defineRecipe({
  className: 'button',
  description: 'A button component',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    fontFamily: 'text',
    fontWeight: 'medium',
    borderRadius: 'md',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color, opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-in-out',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    _focus: {
      outline: '2px solid',
      outlineColor: 'accent.bg.solid',
      outlineOffset: '2px',
    },
  },
  variants: {
    variant: {
      solid: {
        bg: 'accent.bg.solid',
        color: 'accent.fg.onSolid',
        _hover: {
          opacity: 0.9,
        },
      },
      outline: {
        bg: 'transparent',
        borderWidth: '1px',
        borderColor: 'border.default',
        color: 'fg.default',
        _hover: {
          bg: 'neutral.bg.subtle',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'fg.default',
        _hover: {
          bg: 'neutral.bg.subtle',
        },
      },
    },
    size: {
      sm: {
        h: '8',
        px: '3',
        fontSize: 'xs',
      },
      md: {
        h: '10',
        px: '4',
        fontSize: 'sm',
      },
      lg: {
        h: '12',
        px: '6',
        fontSize: 'md',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
})
