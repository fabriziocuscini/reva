import { AlphaStrip } from '@/components/alpha-strip'
import { ChromaPanel } from '@/components/chroma-panel'
import { ColorPickerInput } from '@/components/color-picker-input'
import { ComparePanel, type DockSide } from '@/components/compare-panel'
import { CopyBlock } from '@/components/copy-block'
import { DockedPaletteStrip } from '@/components/docked-palette-strip'
import { HuePanel } from '@/components/hue-panel'
import { LightnessPanel } from '@/components/lightness-panel'
import { PaletteStrip } from '@/components/palette-strip'
import { PresetBar } from '@/components/preset-bar'
import { SaveDialog } from '@/components/save-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ValuesTable } from '@/components/values-table'
import { usePalette } from '@/hooks/use-palette'
import { useTheme } from '@/hooks/use-theme'
import type { PalettePreset } from '@/lib/api'
import { fetchPalettes } from '@/lib/api'
import { DEFAULT_PARAMS, DISTRIBUTION_PARAM } from '@/lib/constants'
import type { Preset } from '@/lib/types'
import {
  ArrowDown,
  ArrowUp,
  Check,
  LoaderCircle,
  Moon,
  PanelRightOpen,
  RotateCcw,
  Save,
  Sun,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Convert API response to the Preset shape used by usePalette */
function toPresets(apiPresets: PalettePreset[]): Preset[] {
  return apiPresets.map((p) => ({
    name: p.name,
    displayName: p.displayName,
    hex: p.hex,
    params: p.params ?? { ...DEFAULT_PARAMS },
    steps: p.steps,
  }))
}

export default function App() {
  const [presets, setPresets] = useState<Preset[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchPalettes()
      .then((data) => setPresets(toPresets(data)))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load palettes'))
  }, [])

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    )
  }

  if (!presets) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Loading palettes…</p>
      </div>
    )
  }

  return <PaletteEditor presets={presets} onPresetsChange={setPresets} />
}

function PaletteEditor({
  presets,
  onPresetsChange,
}: {
  presets: Preset[]
  onPresetsChange: (presets: Preset[]) => void
}) {
  const {
    midpointHex,
    activePreset,
    lastPreset,
    params,
    palette,
    validHex,
    isDiverged,
    isModified,
    hasUnsavedChanges,
    isSaving,
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
  } = usePalette(presets)

  const { dark, toggle } = useTheme()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [showAlpha, setShowAlpha] = useState(false)
  const [comparePanelOpen, setComparePanelOpen] = useState(false)
  const [compareSteps, setCompareSteps] = useState<Set<number>>(new Set())
  const [benchmarkHexes, setBenchmarkHexes] = useState<Map<number, string>>(new Map())
  const [dockSide, setDockSide] = useState<DockSide>(null)
  const [dragOverZone, setDragOverZone] = useState<'left' | 'right' | null>(null)
  const [paletteDocked, setPaletteDocked] = useState(false)
  const [paletteSortAsc, setPaletteSortAsc] = useState(true)
  const [paletteShowAll, setPaletteShowAll] = useState(true)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const PANEL_WIDTH = 288 // w-72 = 18rem = 288px
  const DROP_ZONE_WIDTH = PANEL_WIDTH

  const handlePanelDragMove = useCallback((pos: { clientX: number }) => {
    if (pos.clientX > window.innerWidth - DROP_ZONE_WIDTH) {
      setDragOverZone('right')
    } else {
      setDragOverZone(null)
    }
  }, [])

  const handleDockChange = useCallback((side: DockSide) => {
    setDockSide(side)
    setDragOverZone(null)
  }, [])

  const showSavedFlash = useCallback(() => {
    setSavedFlash(true)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1500)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      await save()
      showSavedFlash()
    } catch {
      // error is exposed via saveError in hook
    }
  }, [save, showSavedFlash])

  const handleSaveAs = useCallback(
    async (name: string) => {
      try {
        await save(name)
        setSaveDialogOpen(false)
        // If this was a new palette, add it to presets and select it
        if (!presets.some((p) => p.name === name)) {
          const titleCase = name.charAt(0).toUpperCase() + name.slice(1)
          const newPreset: Preset = {
            name,
            displayName: titleCase,
            hex: midpointHex,
            params: { ...params },
          }
          onPresetsChange([...presets, newPreset])
          // Select the new preset (need to wait for re-render)
          requestAnimationFrame(() => selectPreset(name))
        }
        showSavedFlash()
      } catch {
        // error shown in dialog
      }
    },
    [save, presets, midpointHex, params, onPresetsChange, selectPreset, showSavedFlash],
  )

  const compareEntries = useMemo(
    () =>
      Array.from(compareSteps)
        .map((step) => {
          const item = palette.find((s) => s.step === step)
          if (!item) return null
          return {
            step: item.step,
            hex: item.hex,
            benchmarkHex: benchmarkHexes.get(step) ?? item.hex,
          }
        })
        .filter((e) => e !== null),
    [palette, compareSteps, benchmarkHexes],
  )

  const handleCompareToggle = useCallback(
    (step: number) => {
      setCompareSteps((prev) => {
        const next = new Set(prev)
        if (next.has(step)) {
          next.delete(step)
          setBenchmarkHexes((m) => {
            const nm = new Map(m)
            nm.delete(step)
            return nm
          })
        } else {
          const item = palette.find((s) => s.step === step)
          if (item) {
            setBenchmarkHexes((m) => new Map(m).set(step, item.hex))
          }
          next.add(step)
          setComparePanelOpen(true)
        }
        return next
      })
    },
    [palette],
  )

  const handleBenchmarkChange = useCallback((step: number, hex: string) => {
    setBenchmarkHexes((m) => new Map(m).set(step, hex))
  }, [])

  const handleRemoveCompareStep = useCallback((step: number) => {
    setCompareSteps((prev) => {
      const next = new Set(prev)
      next.delete(step)
      return next
    })
    setBenchmarkHexes((m) => {
      const nm = new Map(m)
      nm.delete(step)
      return nm
    })
  }, [])

  const handleLoadTailwindPalette = useCallback(
    (twSteps: Record<string, string>, _displayName: string) => {
      const twStepNumbers = new Set(Object.keys(twSteps).map(Number))

      // Keep only steps that exist in the Tailwind palette
      const newSteps = new Set<number>()
      const newBenchmarks = new Map<number, string>()

      for (const step of compareSteps) {
        if (twStepNumbers.has(step)) {
          newSteps.add(step)
          const existing = benchmarkHexes.get(step)
          if (existing) newBenchmarks.set(step, existing)
        }
      }

      for (const [stepStr, hex] of Object.entries(twSteps)) {
        const step = Number(stepStr)
        if (!palette.some((s) => s.step === step)) continue
        newSteps.add(step)
        newBenchmarks.set(step, hex)
      }

      setCompareSteps(newSteps)
      setBenchmarkHexes(newBenchmarks)
      setComparePanelOpen(true)
    },
    [compareSteps, benchmarkHexes, palette],
  )

  const handleSelectPreset = useCallback(
    (name: string) => {
      setCompareSteps(new Set())
      setBenchmarkHexes(new Map())
      selectPreset(name)
    },
    [selectPreset],
  )

  // Keyboard shortcuts: ⌘Z undo, ⌘⇧Z redo, D toggle dark mode, ⌘S save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'd' || e.key === 'D') {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault()
          toggle()
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (activePreset) {
          if (hasUnsavedChanges && !isSaving) handleSave()
        } else {
          setSaveDialogOpen(true)
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (comparePanelOpen) {
          setComparePanelOpen(false)
          setCompareSteps(new Set())
          setBenchmarkHexes(new Map())
          setDockSide(null)
          setDragOverZone(null)
        } else {
          resetParams()
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [
    undo,
    redo,
    toggle,
    activePreset,
    hasUnsavedChanges,
    isSaving,
    handleSave,
    resetParams,
    comparePanelOpen,
  ])

  const isCustomHex = activePreset === null

  const panelPaletteName = activePreset ?? 'custom'

  const paletteHexMap = useMemo(() => new Map(palette.map((s) => [s.step, s.hex])), [palette])

  const comparePanelNode = comparePanelOpen ? (
    <ComparePanel
      entries={compareEntries}
      paletteName={panelPaletteName}
      paletteHexMap={paletteHexMap}
      docked={dockSide}
      onDockChange={handleDockChange}
      onDragMove={handlePanelDragMove}
      onAddStep={handleCompareToggle}
      onBenchmarkChange={handleBenchmarkChange}
      onRemoveStep={handleRemoveCompareStep}
      onLoadTailwindPalette={handleLoadTailwindPalette}
      onClearEntries={() => {
        setCompareSteps(new Set())
        setBenchmarkHexes(new Map())
      }}
      onClose={() => {
        setComparePanelOpen(false)
        setCompareSteps(new Set())
        setBenchmarkHexes(new Map())
        setDockSide(null)
        setDragOverZone(null)
      }}
    />
  ) : null

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        {/* Palette docked left */}
        {paletteDocked && validHex && palette.length > 0 && (
          <div className="w-80 shrink-0 h-screen sticky top-0 border-r border-border overflow-y-auto bg-card flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none">
                Palette
              </span>
              <div className="flex items-center gap-0.5">
                {isModified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon-sm" onClick={resetParams}>
                        <RotateCcw className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset all parameters</TooltipContent>
                  </Tooltip>
                )}
                {isCustomHex ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSaveDialogOpen(true)}
                      >
                        <Save className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save as…</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || isSaving}
                      >
                        {isSaving ? (
                          <LoaderCircle className="size-3 animate-spin" />
                        ) : savedFlash ? (
                          <Check className="size-3" />
                        ) : (
                          <Save className="size-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{savedFlash ? 'Saved!' : 'Save palette'}</TooltipContent>
                  </Tooltip>
                )}
                <Switch
                  checked={paletteShowAll}
                  onCheckedChange={setPaletteShowAll}
                  title={paletteShowAll ? 'All steps (19)' : 'Tailwind-compatible (11)'}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPaletteSortAsc((v) => !v)}
                  title={paletteSortAsc ? 'Sort descending' : 'Sort ascending'}
                >
                  {paletteSortAsc ? <ArrowUp /> : <ArrowDown />}
                  <span className="sr-only">
                    {paletteSortAsc ? 'Sort descending' : 'Sort ascending'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPaletteDocked(false)}
                  className="shrink-0"
                >
                  <X />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
            <div className="px-3 shrink-0">
              <div
                className="mt-3 mb-4 transition-opacity duration-150"
                style={{ opacity: isDiverged ? 0.5 : 1 }}
                onDoubleClick={() => updateDistribution(DISTRIBUTION_PARAM.default)}
              >
                <Slider
                  value={[params.dist_ease]}
                  onValueChange={([v]) => updateDistribution(v)}
                  min={DISTRIBUTION_PARAM.min}
                  max={DISTRIBUTION_PARAM.max}
                  step={DISTRIBUTION_PARAM.step}
                />
              </div>
            </div>
            <div className="px-3 pb-3 flex-1 overflow-y-auto min-h-0">
              <DockedPaletteStrip
                palette={
                  paletteShowAll
                    ? palette
                    : palette.filter((s) => s.step % 100 === 0 || s.step === 50 || s.step === 950)
                }
                paletteName={activePreset ?? 'Custom'}
                sortAsc={paletteSortAsc}
                compareSteps={compareSteps}
                onCompareToggle={handleCompareToggle}
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 bg-background">
          <div className="max-w-[1440px] mx-auto px-6 py-5 pb-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-lg font-bold">OKLCH Palette Generator</h1>
                <p className="text-xs text-muted-foreground">
                  Parametric palette generation with anchored midpoint, independent endpoint
                  tapering, per-channel easing, and gamut mapping.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={toggle} className="shrink-0">
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>

            {/* Preset row + tabs scope */}
            <Tabs defaultValue="palette">
              <div className="mb-4 flex items-center gap-3">
                <PresetBar
                  presets={presets}
                  activePreset={activePreset}
                  onSelectPreset={handleSelectPreset}
                />
                <div className="ml-auto flex items-center gap-3 shrink-0">
                  {!paletteDocked && (
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="show-alpha" className="text-[10px] text-muted-foreground">
                        Show alpha
                      </Label>
                      <Switch id="show-alpha" checked={showAlpha} onCheckedChange={setShowAlpha} />
                    </div>
                  )}
                  {!paletteDocked && (
                    <TabsList>
                      <TabsTrigger value="palette">Palette</TabsTrigger>
                      <TabsTrigger value="gradient">Gradient</TabsTrigger>
                    </TabsList>
                  )}
                  <ColorPickerInput value={midpointHex} onChange={setCustomHex} />
                </div>
              </div>

              {/* Main output — single column */}
              {validHex && palette.length > 0 && (
                <div className="flex flex-col gap-4 min-w-0">
                  {/* Palette strip */}
                  {!paletteDocked && (
                    <Card>
                      <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPaletteDocked(true)}
                                className="size-6"
                              >
                                <PanelRightOpen className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Dock to sidebar</TooltipContent>
                          </Tooltip>
                          <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Generated palette
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                          {isModified && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={resetParams}
                                  className="size-6"
                                >
                                  <RotateCcw className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reset all parameters</TooltipContent>
                            </Tooltip>
                          )}
                          {/* Save / Save As — scoped to active palette */}
                          {isCustomHex ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSaveDialogOpen(true)}
                              className="gap-1.5"
                            >
                              <Save className="size-3.5" />
                              Save as…
                            </Button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleSave}
                                  disabled={!hasUnsavedChanges || isSaving}
                                  className="size-6"
                                >
                                  {isSaving ? (
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                  ) : savedFlash ? (
                                    <Check className="size-3.5" />
                                  ) : (
                                    <Save className="size-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {savedFlash ? 'Saved!' : 'Save palette'}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <div
                            className="w-32 transition-opacity duration-150"
                            style={{ opacity: isDiverged ? 0.5 : 1 }}
                            onDoubleClick={() => updateDistribution(DISTRIBUTION_PARAM.default)}
                          >
                            <Slider
                              value={[params.dist_ease]}
                              onValueChange={([v]) => updateDistribution(v)}
                              min={DISTRIBUTION_PARAM.min}
                              max={DISTRIBUTION_PARAM.max}
                              step={DISTRIBUTION_PARAM.step}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {showAlpha && <AlphaStrip midpointHex={midpointHex} />}
                        <TabsContent value="palette" className="mt-0">
                          <PaletteStrip
                            palette={palette}
                            showLabels={false}
                            roundedTop={!showAlpha}
                            compareSteps={compareSteps}
                            onCompareToggle={handleCompareToggle}
                          />
                        </TabsContent>
                        <TabsContent value="gradient" className="mt-0">
                          <div
                            className={`h-10 md:h-12 lg:h-16 ${showAlpha ? 'rounded-b-lg' : 'rounded-lg'}`}
                            style={{
                              background: `linear-gradient(to right, ${palette.map((p) => p.hex).join(', ')})`,
                            }}
                          />
                        </TabsContent>
                        <PaletteStrip palette={palette} labelsOnly />
                      </CardContent>
                    </Card>
                  )}

                  {/* Lightness panel — sliders + chart */}
                  <LightnessPanel
                    params={params}
                    palette={palette}
                    midpointHex={midpointHex}
                    onUpdateParam={updateParam}
                    onReset={resetLightness}
                  />

                  {/* Chroma panel — sliders + chart */}
                  <ChromaPanel
                    params={params}
                    palette={palette}
                    midpointHex={midpointHex}
                    onUpdateParam={updateParam}
                    onReset={resetChroma}
                  />

                  {/* Hue panel — sliders + chart */}
                  <HuePanel
                    params={params}
                    palette={palette}
                    midpointHex={midpointHex}
                    onUpdateParam={updateParam}
                    onReset={resetHue}
                  />

                  {/* Values table */}
                  <Card>
                    <CardContent>
                      <ValuesTable palette={palette} />
                    </CardContent>
                  </Card>

                  {/* Copy block */}
                  <CopyBlock
                    palette={palette}
                    paletteName={activePreset ?? 'custom'}
                    midpointHex={midpointHex}
                  />
                </div>
              )}
            </Tabs>
          </div>
        </div>

        {/* Docked right */}
        {comparePanelOpen && dockSide === 'right' && comparePanelNode}
      </div>

      {/* Floating panel (not docked) */}
      {comparePanelOpen && dockSide === null && comparePanelNode}

      {/* Drop zone overlay — right side only */}
      {dragOverZone === 'right' && (
        <div
          className="fixed inset-y-0 right-0 z-40 pointer-events-none opacity-100 transition-opacity duration-150"
          style={{ width: DROP_ZONE_WIDTH }}
        >
          <div className="h-full m-2 rounded-md bg-foreground/5" />
        </div>
      )}

      {/* Save As dialog */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        presets={presets}
        activePreset={activePreset}
        lastPreset={lastPreset}
        isSaving={isSaving}
        onSave={handleSaveAs}
      />
    </TooltipProvider>
  )
}
