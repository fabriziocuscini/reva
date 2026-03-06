import { useMemo } from "react"
import { XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { ColorPickerInput } from "@/components/color-picker-input"
import { useDraggable } from "@/hooks/use-draggable"

interface ComparePanelProps {
  /** Palette step being compared (e.g. 500) */
  step: number
  /** Current hex of that step — updates live as sliders change */
  paletteHex: string
  /** User-defined benchmark colour */
  benchmarkHex: string
  /** Called when the benchmark colour changes */
  onBenchmarkChange: (hex: string) => void
  /** Called when user closes the panel */
  onClose: () => void
}

export function ComparePanel({
  step,
  paletteHex,
  benchmarkHex,
  onBenchmarkChange,
  onClose,
}: ComparePanelProps) {
  const initialPos = useMemo(
    () => ({
      x: Math.round((window.innerWidth - 288) / 2),
      y: 180,
    }),
    []
  )

  const { panelRef, style: panelStyle, handleProps } = useDraggable(initialPos)

  return (
    <div
      ref={panelRef}
      style={panelStyle}
      className="z-50 w-72 rounded-lg bg-card text-card-foreground ring-1 ring-foreground/10 shadow-lg"
    >
      {/* Header — drag handle */}
      <div
        {...handleProps}
        className="flex items-center justify-between px-3 py-2"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none">
          Compare · {step}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Side-by-side colour comparison */}
      <div className="px-3">
        <div className="flex overflow-hidden rounded-md">
          <div
            className="flex-1 aspect-[4/3]"
            style={{ backgroundColor: paletteHex }}
          />
          <div
            className="flex-1 aspect-[4/3]"
            style={{ backgroundColor: benchmarkHex }}
          />
        </div>
      </div>

      {/* Bottom row: palette hex (left) · benchmark picker (right) */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="size-4 rounded-sm border border-border"
            style={{ backgroundColor: paletteHex }}
          />
          <span className="text-xs font-mono text-muted-foreground uppercase">
            {paletteHex}
          </span>
        </div>
        <ColorPickerInput value={benchmarkHex} onChange={onBenchmarkChange} />
      </div>
    </div>
  )
}
