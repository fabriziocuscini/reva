import { Slider } from '@/components/ui/slider'
import type { ParamConfig } from '@/lib/types'

interface ParamSliderProps {
  config: ParamConfig
  value: number
  onChange: (value: number) => void
}

export function ParamSlider({ config, value, onChange }: ParamSliderProps) {
  return (
    <div className="mb-3.5">
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-semibold text-foreground">{config.label}</label>
        <span className="text-xs font-mono text-muted-foreground">
          {value}
          {config.unit ?? ''}
        </span>
      </div>
      <div onDoubleClick={() => onChange(config.default)}>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={config.min}
          max={config.max}
          step={config.step}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{config.description}</p>
    </div>
  )
}
