import { useEffect } from "react"
import { Sun, Moon, ArrowCounterClockwise } from "@phosphor-icons/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { PresetBar } from "@/components/preset-bar"
import { PaletteStrip } from "@/components/palette-strip"
import { LightnessPanel } from "@/components/lightness-panel"
import { ChromaPanel } from "@/components/chroma-panel"
import { HuePanel } from "@/components/hue-panel"
import { ValuesTable } from "@/components/values-table"
import { CopyBlock } from "@/components/copy-block"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DISTRIBUTION_PARAM } from "@/lib/constants"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePalette } from "@/hooks/use-palette"
import { useTheme } from "@/hooks/use-theme"

export default function App() {
  const {
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
  } = usePalette()

  const { dark, toggle } = useTheme()

  // Keyboard shortcuts: ⌘Z undo, ⌘⇧Z redo, D toggle dark mode
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
      }
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [undo, redo, toggle])

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
          <div className="mb-4">
            <PresetBar
              activePreset={activePreset}
              midpointHex={midpointHex}
              onSelectPreset={selectPreset}
              onCustomHex={setCustomHex}
            />
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
                    <TabsContent value="palette" className="mt-0">
                      <PaletteStrip palette={palette} showLabels={false} />
                    </TabsContent>
                    <TabsContent value="gradient" className="mt-0">
                      <div
                        className="h-10 md:h-12 lg:h-16 rounded-lg"
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
              <CopyBlock palette={palette} />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
