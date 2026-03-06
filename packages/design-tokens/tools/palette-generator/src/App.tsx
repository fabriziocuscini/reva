import { useEffect, useState, useCallback, useRef } from "react"
import {
  Sun,
  Moon,
  ArrowCounterClockwise,
  FloppyDisk,
  SpinnerGap,
  Check,
} from "@phosphor-icons/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PresetBar } from "@/components/preset-bar"
import { ColorPickerInput } from "@/components/color-picker-input"
import { PaletteStrip } from "@/components/palette-strip"
import { AlphaStrip } from "@/components/alpha-strip"
import { LightnessPanel } from "@/components/lightness-panel"
import { ChromaPanel } from "@/components/chroma-panel"
import { HuePanel } from "@/components/hue-panel"
import { ValuesTable } from "@/components/values-table"
import { CopyBlock } from "@/components/copy-block"
import { SaveDialog } from "@/components/save-dialog"
import { ComparePanel } from "@/components/compare-panel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DISTRIBUTION_PARAM } from "@/lib/constants"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePalette } from "@/hooks/use-palette"
import { useTheme } from "@/hooks/use-theme"
import { fetchPalettes } from "@/lib/api"
import type { PalettePreset } from "@/lib/api"
import type { Preset } from "@/lib/types"
import { DEFAULT_PARAMS } from "@/lib/constants"

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
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Failed to load palettes")
      )
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
  const [compareStep, setCompareStep] = useState<number | null>(null)
  const [benchmarkHex, setBenchmarkHex] = useState("#000000")
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
          const titleCase =
            name.charAt(0).toUpperCase() + name.slice(1)
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
    [save, presets, midpointHex, params, onPresetsChange, selectPreset, showSavedFlash]
  )

  // Compare panel — derive live hex for the selected step
  const compareHex =
    compareStep !== null
      ? palette.find((s) => s.step === compareStep)?.hex ?? null
      : null

  const handleSwatchClick = useCallback(
    (step: number) => {
      const item = palette.find((s) => s.step === step)
      if (!item) return
      if (compareStep === null) {
        // First open — seed benchmark with the swatch's current colour
        setBenchmarkHex(item.hex)
      }
      setCompareStep(step)
    },
    [palette, compareStep]
  )

  // Wrap selectPreset so switching presets auto-closes compare panel
  const handleSelectPreset = useCallback(
    (name: string) => {
      setCompareStep(null)
      selectPreset(name)
    },
    [selectPreset]
  )

  // Keyboard shortcuts: ⌘Z undo, ⌘⇧Z redo, D toggle dark mode, ⌘S save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      if (e.key === "d" || e.key === "D") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault()
          toggle()
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        if (activePreset) {
          if (hasUnsavedChanges && !isSaving) handleSave()
        } else {
          setSaveDialogOpen(true)
        }
        return
      }

      if (e.key === "Escape") {
        e.preventDefault()
        if (compareStep !== null) {
          setCompareStep(null)
        } else {
          resetParams()
        }
      }
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [undo, redo, toggle, activePreset, hasUnsavedChanges, isSaving, handleSave, resetParams, compareStep])

  const isCustomHex = activePreset === null

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1200px] mx-auto px-6 py-5 pb-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-lg font-bold">OKLCH Palette Generator</h1>
              <p className="text-xs text-muted-foreground">
                Parametric palette generation with anchored midpoint,
                independent endpoint tapering, per-channel easing, and gamut
                mapping.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="shrink-0"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>

          {/* Preset row */}
          <div className="mb-4 flex items-center gap-3">
            <PresetBar
              presets={presets}
              activePreset={activePreset}
              onSelectPreset={handleSelectPreset}
            />
            <div className="ml-auto flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Label
                  htmlFor="show-alpha"
                  className="text-[10px] text-muted-foreground"
                >
                  Show alpha
                </Label>
                <Switch
                  id="show-alpha"
                  checked={showAlpha}
                  onCheckedChange={setShowAlpha}
                />
              </div>
              <ColorPickerInput value={midpointHex} onChange={setCustomHex} />
            </div>
          </div>

          {/* Main output — single column */}
          {validHex && palette.length > 0 && (
            <div className="flex flex-col gap-4 min-w-0">
              {/* Palette strip */}
              <Card>
                <Tabs defaultValue="palette" className="gap-2">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Generated palette
                    </CardTitle>
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
                              <ArrowCounterClockwise className="size-3.5" />
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
                          <FloppyDisk className="size-3.5" />
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
                                <SpinnerGap className="size-3.5 animate-spin" />
                              ) : savedFlash ? (
                                <Check className="size-3.5" />
                              ) : (
                                <FloppyDisk className="size-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {savedFlash ? "Saved!" : "Save palette"}
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
                      <TabsList>
                        <TabsTrigger value="palette">Palette</TabsTrigger>
                        <TabsTrigger value="gradient">Gradient</TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showAlpha && <AlphaStrip midpointHex={midpointHex} />}
                    <TabsContent value="palette" className="mt-0">
                      <PaletteStrip
                        palette={palette}
                        showLabels={false}
                        roundedTop={!showAlpha}
                        compareStep={compareStep}
                        onSwatchClick={handleSwatchClick}
                      />
                    </TabsContent>
                    <TabsContent value="gradient" className="mt-0">
                      <div
                        className={`h-10 md:h-12 lg:h-16 ${showAlpha ? "rounded-b-lg" : "rounded-lg"}`}
                        style={{
                          background: `linear-gradient(to right, ${palette.map((p) => p.hex).join(", ")})`,
                        }}
                      />
                    </TabsContent>
                    <PaletteStrip palette={palette} labelsOnly />
                  </CardContent>
                </Tabs>
              </Card>

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
                paletteName={activePreset ?? lastPreset ?? "custom"}
                midpointHex={midpointHex}
              />
            </div>
          )}
        </div>
      </div>

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

      {/* Compare panel — floating, draggable */}
      {compareStep !== null && compareHex !== null && (
        <ComparePanel
          step={compareStep}
          paletteHex={compareHex}
          benchmarkHex={benchmarkHex}
          onBenchmarkChange={setBenchmarkHex}
          onClose={() => setCompareStep(null)}
        />
      )}
    </TooltipProvider>
  )
}
