import type { PaletteParams, PaletteStep } from "./types"

export interface PalettePreset {
  name: string
  displayName: string
  hex: string
  steps: Record<string, string>
  params: PaletteParams | null
}

export async function fetchPalettes(): Promise<PalettePreset[]> {
  const res = await fetch("/api/palettes")
  if (!res.ok) throw new Error(`Failed to load palettes: ${res.statusText}`)
  const data = (await res.json()) as { palettes: PalettePreset[] }
  return data.palettes
}

export async function savePalette(
  name: string,
  steps: PaletteStep[],
  params: PaletteParams
): Promise<{ created?: boolean }> {
  const res = await fetch(`/api/palettes/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      steps: steps.map((s) => ({ step: s.step, hex: s.hex })),
      params,
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error: string
    }
    throw new Error(err.error ?? "Save failed")
  }
  return (await res.json()) as { created?: boolean }
}
