import { CurveChart } from '@/components/curve-chart'
import { ParamSlider } from '@/components/param-slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HUE_PARAMS } from '@/lib/constants'
import type { PaletteParams, PaletteStep } from '@/lib/types'
import { ArrowCounterClockwise } from '@phosphor-icons/react'

interface HuePanelProps {
  params: PaletteParams
  palette: PaletteStep[]
  midpointHex: string
  onUpdateParam: (key: keyof PaletteParams, value: number) => void
  onReset: () => void
}

export function HuePanel({ params, palette, midpointHex, onUpdateParam, onReset }: HuePanelProps) {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] md:items-center gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Hue
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onReset} className="size-6">
                    <ArrowCounterClockwise className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset hue parameters</TooltipContent>
              </Tooltip>
            </div>
            {HUE_PARAMS.map((config) => (
              <ParamSlider
                key={config.key}
                config={config}
                value={params[config.key]}
                onChange={(v) => onUpdateParam(config.key, v)}
              />
            ))}
          </div>
          <CurveChart palette={palette} dataKey="H" color={midpointHex} className="h-48 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
