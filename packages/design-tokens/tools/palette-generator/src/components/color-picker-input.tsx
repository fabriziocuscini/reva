import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { isValidHex } from '@/lib/color'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerInputProps {
  value: string
  onChange: (hex: string) => void
}

export function ColorPickerInput({ value, onChange }: ColorPickerInputProps) {
  const valid = isValidHex(value)

  return (
    <Popover>
      <InputGroup className="w-28">
        <InputGroupAddon align="inline-start">
          <PopoverTrigger asChild>
            <button
              type="button"
              className="size-4 rounded-sm shrink-0 border border-border cursor-pointer"
              style={{
                backgroundColor: valid ? value : 'var(--muted)',
              }}
              aria-label="Pick a color"
            />
          </PopoverTrigger>
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs uppercase"
          aria-invalid={!valid || undefined}
        />
      </InputGroup>
      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-auto p-3">
        <div className="color-picker-wrapper">
          <HexColorPicker color={valid ? value : '#000000'} onChange={onChange} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
