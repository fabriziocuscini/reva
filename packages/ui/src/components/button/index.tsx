import { ark } from '@ark-ui/react/factory'
import { forwardRef } from 'react'
import { styled } from 'styled-system/jsx'
import { button, type ButtonVariantProps } from 'styled-system/recipes'

const BaseButton = styled(ark.button, button)

export interface ButtonProps
  extends React.ComponentProps<typeof BaseButton>,
    ButtonVariantProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <BaseButton ref={ref} {...props} />,
)

Button.displayName = 'Button'
