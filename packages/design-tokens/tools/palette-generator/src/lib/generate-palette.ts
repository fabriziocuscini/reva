import { hexToHslDisplay, oklchToSafeHex, parseToOklch } from './color'
import { STEPS } from './constants'
import type { PaletteParams, PaletteStep } from './types'

export function generatePalette(midpointHex: string, params: PaletteParams): PaletteStep[] {
  const anchor = parseToOklch(midpointHex)
  const La = anchor.l
  const Ca = anchor.c
  const Ha = anchor.h ?? 0

  const {
    L_max,
    L_min,
    L_ease,
    C_ease,
    C_taper_light,
    C_taper_dark,
    H_shift_light,
    H_shift_dark,
    H_ease,
  } = params

  return STEPS.map((step) => {
    let L: number
    let C: number
    let H: number

    if (step === 500) {
      L = La
      C = Ca
      H = Ha
    } else if (step < 500) {
      const t = (500 - step) / 450
      L = La + Math.pow(t, L_ease) * (L_max - La)
      C = Ca * (1 - Math.pow(t, C_ease) * (1 - C_taper_light / 100))
      H = Ha + Math.pow(t, H_ease) * H_shift_light
    } else {
      const t = (step - 500) / 450
      L = La - Math.pow(t, L_ease) * (La - L_min)
      C = Ca * (1 - Math.pow(t, C_ease) * (1 - C_taper_dark / 100))
      H = Ha + Math.pow(t, H_ease) * H_shift_dark
    }

    const hex = oklchToSafeHex(L, C, H)
    const hsl = hexToHslDisplay(hex)

    return {
      step,
      hex,
      L,
      C,
      H,
      hsl,
      isMidpoint: step === 500,
    }
  })
}
