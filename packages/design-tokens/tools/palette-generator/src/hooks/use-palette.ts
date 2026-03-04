import { useState, useRef, useMemo, useCallback } from "react"
import { generatePalette } from "@/lib/generate-palette"
import { isValidHex } from "@/lib/color"
import { DEFAULT_PARAMS, PRESETS } from "@/lib/constants"
import { useHistory } from "@/hooks/use-history"
import type { PaletteParams, PaletteStep } from "@/lib/types"

export function usePalette() {
  const [midpointHex, setMidpointHex] = useState("#E2A336")
  const [activePreset, setActivePreset] = useState<string | null>("Gold")
  const [params, setParams] = useState<PaletteParams>({ ...DEFAULT_PARAMS })
  const paramsCache = useRef(new Map<string, PaletteParams>())
  const history = useHistory()

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
    ? (PRESETS.find((p) => p.name === activePreset)?.params ?? DEFAULT_PARAMS)
    : DEFAULT_PARAMS
  const isModified = (Object.keys(DEFAULT_PARAMS) as (keyof PaletteParams)[]).some(
    (k) => params[k] !== baseParams[k]
  )

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
      const preset = PRESETS.find((p) => p.name === name)
      if (!preset) return

      // Save current preset's params before switching
      if (activePresetRef.current) {
        paramsCache.current.set(activePresetRef.current, { ...paramsRef.current })
      }

      // Clear history on preset switch (undo doesn't cross presets)
      history.clear()

      setActivePreset(name)
      setMidpointHex(preset.hex)
      const cached = paramsCache.current.get(name)
      setParams(cached ? { ...cached } : { ...preset.params })
    },
    [history]
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
      ? PRESETS.find((p) => p.name === activePresetRef.current)
      : null
    const base = preset?.params ?? DEFAULT_PARAMS
    setParams({ ...base })
    if (activePresetRef.current) {
      paramsCache.current.delete(activePresetRef.current)
    }
  }, [history])

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

  return {
    midpointHex,
    activePreset,
    params,
    palette,
    validHex,
    isDiverged,
    isModified,
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
  }
}
