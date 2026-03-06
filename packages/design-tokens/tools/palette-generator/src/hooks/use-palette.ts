import { useState, useRef, useMemo, useCallback } from "react"
import { generatePalette } from "@/lib/generate-palette"
import { isValidHex } from "@/lib/color"
import { DEFAULT_PARAMS } from "@/lib/constants"
import { useHistory } from "@/hooks/use-history"
import { savePalette as apiSavePalette } from "@/lib/api"
import type { PaletteParams, PaletteStep, Preset } from "@/lib/types"

export function usePalette(presets: Preset[]) {
  const first = presets[0]
  const [midpointHex, setMidpointHex] = useState(first?.hex ?? "#E2A336")
  const [activePreset, setActivePreset] = useState<string | null>(
    first?.name ?? null
  )
  const [params, setParams] = useState<PaletteParams>(
    first?.params ? { ...first.params } : { ...DEFAULT_PARAMS }
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const paramsCache = useRef(new Map<string, PaletteParams>())
  const savedStepsRef = useRef(new Map<string, Record<string, string>>())
  const history = useHistory()

  // Populate savedStepsRef from presets on first render
  const initializedRef = useRef(false)
  if (!initializedRef.current) {
    for (const p of presets) {
      if (p.steps) {
        savedStepsRef.current.set(p.name, p.steps)
      }
    }
    initializedRef.current = true
  }

  // Last-selected preset name — persists even after switching to custom hex
  const lastPresetRef = useRef<string | null>(first?.name ?? null)

  // Refs for synchronous access in callbacks (synced every render)
  const activePresetRef = useRef(activePreset)
  activePresetRef.current = activePreset
  const paramsRef = useRef(params)
  paramsRef.current = params

  const validHex = isValidHex(midpointHex)

  const palette: PaletteStep[] = useMemo(() => {
    if (!validHex) return []
    try {
      return generatePalette(midpointHex, params)
    } catch {
      return []
    }
  }, [midpointHex, params, validHex])

  const isDiverged =
    params.L_ease !== params.dist_ease ||
    params.C_ease !== params.dist_ease ||
    params.H_ease !== params.dist_ease

  const baseParams = activePreset
    ? (presets.find((p) => p.name === activePreset)?.params ?? DEFAULT_PARAMS)
    : DEFAULT_PARAMS
  const isModified = (Object.keys(DEFAULT_PARAMS) as (keyof PaletteParams)[]).some(
    (k) => params[k] !== baseParams[k]
  )

  // Check if the current palette differs from what's saved on disk
  const hasUnsavedChanges = useMemo(() => {
    if (!activePreset || palette.length === 0) return false
    const saved = savedStepsRef.current.get(activePreset)
    if (!saved) return true
    return palette.some((s) => {
      const savedHex = saved[String(s.step)]
      return savedHex !== undefined && savedHex.toLowerCase() !== s.hex.toLowerCase()
    })
  }, [activePreset, palette])

  const updateParam = useCallback(
    (key: keyof PaletteParams, value: number) => {
      history.record(paramsRef.current)
      setParams((prev) => ({ ...prev, [key]: value }))
    },
    [history]
  )

  const updateDistribution = useCallback(
    (value: number) => {
      history.record(paramsRef.current)
      setParams((prev) => ({
        ...prev,
        L_ease: value,
        C_ease: value,
        H_ease: value,
        dist_ease: value,
      }))
    },
    [history]
  )

  const selectPreset = useCallback(
    (name: string) => {
      const preset = presets.find((p) => p.name === name)
      if (!preset) return

      // Save current preset's params before switching
      if (activePresetRef.current) {
        paramsCache.current.set(activePresetRef.current, { ...paramsRef.current })
      }

      // Clear history on preset switch (undo doesn't cross presets)
      history.clear()

      setActivePreset(name)
      lastPresetRef.current = name
      setMidpointHex(preset.hex)
      const cached = paramsCache.current.get(name)
      setParams(cached ? { ...cached } : { ...preset.params })
    },
    [history, presets]
  )

  const setCustomHex = useCallback((hex: string) => {
    // Save current preset's params before switching to custom
    if (activePresetRef.current) {
      paramsCache.current.set(activePresetRef.current, { ...paramsRef.current })
    }
    setActivePreset(null)
    setMidpointHex(hex)
  }, [])

  const resetParams = useCallback(() => {
    history.record(paramsRef.current)
    const preset = activePresetRef.current
      ? presets.find((p) => p.name === activePresetRef.current)
      : null
    const base = preset?.params ?? DEFAULT_PARAMS
    setParams({ ...base })
    if (activePresetRef.current) {
      paramsCache.current.delete(activePresetRef.current)
    }
  }, [history, presets])

  const resetLightness = useCallback(() => {
    history.record(paramsRef.current)
    setParams((prev) => ({
      ...prev,
      L_max: DEFAULT_PARAMS.L_max,
      L_min: DEFAULT_PARAMS.L_min,
      L_ease: DEFAULT_PARAMS.L_ease,
    }))
  }, [history])

  const resetChroma = useCallback(() => {
    history.record(paramsRef.current)
    setParams((prev) => ({
      ...prev,
      C_taper_light: DEFAULT_PARAMS.C_taper_light,
      C_taper_dark: DEFAULT_PARAMS.C_taper_dark,
      C_ease: DEFAULT_PARAMS.C_ease,
    }))
  }, [history])

  const resetHue = useCallback(() => {
    history.record(paramsRef.current)
    setParams((prev) => ({
      ...prev,
      H_shift_light: DEFAULT_PARAMS.H_shift_light,
      H_shift_dark: DEFAULT_PARAMS.H_shift_dark,
      H_ease: DEFAULT_PARAMS.H_ease,
    }))
  }, [history])

  const undo = useCallback(() => {
    const restored = history.undo(paramsRef.current)
    if (restored) setParams(restored)
  }, [history])

  const redo = useCallback(() => {
    const restored = history.redo(paramsRef.current)
    if (restored) setParams(restored)
  }, [history])

  /** Save the current palette to disk (existing preset or new name). */
  const save = useCallback(
    async (name?: string) => {
      const targetName = name ?? activePresetRef.current
      if (!targetName || palette.length === 0) return

      setIsSaving(true)
      setSaveError(null)
      try {
        await apiSavePalette(targetName, palette, paramsRef.current)
        // Update the saved reference so hasUnsavedChanges resets
        const stepsMap: Record<string, string> = {}
        for (const s of palette) {
          stepsMap[String(s.step)] = s.hex
        }
        savedStepsRef.current.set(targetName, stepsMap)
        // Clear history — saved state is the new baseline
        history.clear()
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed")
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [palette, history]
  )

  return {
    midpointHex,
    activePreset,
    lastPreset: lastPresetRef.current,
    params,
    palette,
    validHex,
    isDiverged,
    isModified,
    hasUnsavedChanges,
    isSaving,
    saveError,
    updateParam,
    updateDistribution,
    selectPreset,
    setCustomHex,
    resetParams,
    resetLightness,
    resetChroma,
    resetHue,
    undo,
    redo,
    save,
  }
}
