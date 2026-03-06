import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Preset } from '@/lib/types'

interface PresetBarProps {
  presets: Preset[]
  activePreset: string | null
  onSelectPreset: (name: string) => void
}

export function PresetBar({ presets, activePreset, onSelectPreset }: PresetBarProps) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      value={activePreset ?? ''}
      onValueChange={(value) => {
        if (value) onSelectPreset(value)
      }}
      className="flex-wrap"
    >
      {presets.map((preset) => (
        <ToggleGroupItem key={preset.name} value={preset.name}>
          <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: preset.hex }} />
          {preset.displayName}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
