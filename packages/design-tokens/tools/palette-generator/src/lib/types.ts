export interface HslDisplay {
  h: number // Hue degrees [0, 360)
  s: number // Saturation percentage [0, 100]
  l: number // Lightness percentage [0, 100]
}

export interface PaletteStep {
  step: number
  hex: string
  L: number
  C: number
  H: number
  hsl: HslDisplay
  isMidpoint: boolean
}

export interface PaletteParams {
  L_max: number
  L_min: number
  L_ease: number
  C_taper_light: number
  C_taper_dark: number
  C_ease: number
  H_shift_light: number
  H_shift_dark: number
  H_ease: number
  dist_ease: number
}

export interface Preset {
  name: string
  displayName: string
  hex: string
  params: PaletteParams
  steps?: Record<string, string>
}

export interface ParamConfig {
  key: keyof PaletteParams
  label: string
  min: number
  max: number
  step: number
  default: number
  unit?: string
  description: string
}
