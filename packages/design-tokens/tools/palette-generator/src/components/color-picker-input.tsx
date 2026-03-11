import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { isValidHex, normalizeHex } from '@/lib/color'
import type { ClipboardEvent, FocusEvent, MouseEvent } from 'react'
import { useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerInputProps {
  value: string
  onChange: (hex: string) => void
}

export function ColorPickerInput({ value, onChange }: ColorPickerInputProps) {
  const valid = isValidHex(value)

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const normalized = normalizeHex(e.currentTarget.value)
      if (normalized !== value) onChange(normalized)
    },
    [onChange, value],
  )

  const handleDoubleClick = useCallback((e: MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }, [])

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text/plain')
      const input = e.currentTarget
      const before = input.value.slice(0, input.selectionStart ?? 0)
      const after = input.value.slice(input.selectionEnd ?? input.value.length)
      const merged = before + pasted + after
      const normalized = normalizeHex(merged)
      if (normalized !== merged) {
        e.preventDefault()
        onChange(normalized)
      }
    },
    [onChange],
  )

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
          onDoubleClick={handleDoubleClick}
          onBlur={handleBlur}
          onPaste={handlePaste}
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
