import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Preset } from '@/lib/types'
import { SpinnerGap } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'

const NEW_PALETTE_VALUE = '__new__'
const EXCLUDED = new Set(['black', 'white'])

interface SaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presets: Preset[]
  activePreset: string | null
  lastPreset: string | null
  isSaving: boolean
  onSave: (name: string) => void
}

export function SaveDialog({
  open,
  onOpenChange,
  presets,
  activePreset,
  lastPreset,
  isSaving,
  onSave,
}: SaveDialogProps) {
  const defaultSelect = activePreset ?? lastPreset ?? presets[0]?.name ?? ''
  const [selectValue, setSelectValue] = useState(defaultSelect)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectValue(activePreset ?? lastPreset ?? presets[0]?.name ?? '')
      setNewName('')
      setError(null)
    }
  }, [open, activePreset, lastPreset, presets])

  const isNewPalette = selectValue === NEW_PALETTE_VALUE

  const validate = useCallback(
    (name: string): string | null => {
      if (!name.trim()) return 'Name is required'
      if (!/^[a-z]+$/.test(name)) return 'Lowercase letters only, no spaces'
      if (EXCLUDED.has(name)) return `"${name}" is reserved`
      if (presets.some((p) => p.name === name)) return `"${name}" already exists`
      return null
    },
    [presets],
  )

  const handleNewNameChange = (value: string) => {
    setNewName(value)
    setError(null)
    if (value.length > 0) {
      setSelectValue(NEW_PALETTE_VALUE)
    } else {
      // Revert to the default when input is cleared
      setSelectValue(activePreset ?? lastPreset ?? presets[0]?.name ?? '')
    }
  }

  const handleSelectChange = (value: string) => {
    setSelectValue(value)
    if (value !== NEW_PALETTE_VALUE) {
      setNewName('')
      setError(null)
    }
  }

  const handleSave = () => {
    if (isNewPalette) {
      const validationError = validate(newName.trim())
      if (validationError) {
        setError(validationError)
        return
      }
      onSave(newName.trim())
    } else {
      onSave(selectValue)
    }
  }

  const canSave = isNewPalette ? newName.trim().length > 0 : !!selectValue

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save palette as</DialogTitle>
          <DialogDescription>Override an existing palette or create a new one.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="save-select" className="text-xs">
              Existing palette
            </Label>
            <Select value={selectValue} onValueChange={handleSelectChange}>
              <SelectTrigger id="save-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.displayName}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_PALETTE_VALUE}>New palette…</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="save-new-name" className="text-xs">
              New palette name
            </Label>
            <Input
              id="save-new-name"
              placeholder="e.g. indigo"
              value={newName}
              onChange={(e) => handleNewNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave) handleSave()
              }}
            />
            {error && <p className="text-[10px] text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving && <SpinnerGap className="size-3.5 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
