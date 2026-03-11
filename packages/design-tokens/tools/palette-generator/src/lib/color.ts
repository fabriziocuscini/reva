import type { Oklch } from 'culori'
import { clampChroma, converter, formatHex, parse } from 'culori'
import type { HslDisplay } from './types'

const toOklch = converter('oklch')
const toHsl = converter('hsl')

export function parseToOklch(hex: string): Oklch {
  const parsed = parse(hex)
  if (!parsed) throw new Error(`Invalid colour: ${hex}`)
  return toOklch(parsed) as Oklch
}

export function oklchToSafeHex(L: number, C: number, H: number): string {
  const mapped = clampChroma({ mode: 'oklch' as const, l: L, c: C, h: H }, 'oklch')
  return (formatHex(mapped) ?? '#000000').toUpperCase()
}

export function hexToHslDisplay(hex: string): HslDisplay {
  const parsed = parse(hex)
  if (!parsed) return { h: 0, s: 0, l: 0 }
  const hsl = toHsl(parsed)
  return {
    h: hsl?.h ?? 0,
    s: (hsl?.s ?? 0) * 100,
    l: (hsl?.l ?? 0) * 100,
  }
}

export function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

/**
 * Best-effort normalisation: strip extraneous `#` prefixes and ensure
 * the result is `#` + 6 hex digits. Returns the input unchanged when
 * it can't be salvaged into a valid hex colour.
 */
export function normalizeHex(raw: string): string {
  const stripped = raw.replace(/^#+/, '')
  if (/^[0-9a-fA-F]{6}$/.test(stripped)) return `#${stripped.toUpperCase()}`
  if (/^[0-9a-fA-F]{3}$/.test(stripped)) {
    const expanded = stripped
      .split('')
      .map((c) => c + c)
      .join('')
    return `#${expanded.toUpperCase()}`
  }
  return raw
}
