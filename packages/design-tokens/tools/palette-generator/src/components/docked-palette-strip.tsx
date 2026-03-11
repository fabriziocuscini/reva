import { copyToClipboard } from '@/lib/clipboard'
import type { PaletteStep } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, Minus, Plus } from 'lucide-react'
import { useState } from 'react'

interface DockedPaletteStripProps {
  palette: PaletteStep[]
  paletteName: string
  sortAsc?: boolean
  compareSteps?: Set<number>
  onCompareToggle?: (step: number) => void
}

const EMPTY_SET = new Set<number>()

export function DockedPaletteStrip({
  palette,
  paletteName,
  sortAsc = true,
  compareSteps = EMPTY_SET,
  onCompareToggle,
}: DockedPaletteStripProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const sortedPalette = sortAsc ? palette : [...palette].reverse()

  function handleCopyHex(step: number, hex: string) {
    copyToClipboard(hex)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 900)
  }

  return (
    <div className="flex flex-col gap-4">
      {sortedPalette.map((item) => (
        <div key={item.step}>
          {/* Swatch — single full-width, same aspect as compare panel */}
          <div className="relative">
            <button
              type="button"
              className="group/swatch w-full aspect-[8/3] cursor-pointer border-0 p-0 relative rounded-md overflow-hidden"
              style={{ backgroundColor: item.hex }}
              onClick={() => handleCopyHex(item.step, item.hex)}
              title={`Copy ${item.hex}`}
            >
              {copiedStep === item.step && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white pointer-events-none"
                  style={{ animation: 'fade-in-out 0.9s ease-in-out forwards' }}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
              )}

              {onCompareToggle && copiedStep !== item.step && (
                <div
                  className={cn(
                    'absolute top-1 right-1 flex items-center justify-center rounded size-5',
                    'transition-opacity bg-black/10 text-white/60 hover:bg-black/20 hover:text-white/90',
                    compareSteps.has(item.step)
                      ? 'opacity-100'
                      : 'opacity-0 group-hover/swatch:opacity-100',
                  )}
                  role="button"
                  tabIndex={-1}
                  title={compareSteps.has(item.step) ? 'Remove from compare' : 'Add to compare'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onCompareToggle(item.step)
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {compareSteps.has(item.step) ? (
                    <Minus className="size-3.5" strokeWidth={2} />
                  ) : (
                    <Plus className="size-3.5" strokeWidth={2} />
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Label row: step name on left, hex preview on right */}
          <div className="flex items-center justify-between mt-1">
            <span
              className={cn(
                'text-[10px] font-bold font-mono uppercase tracking-wide',
                item.isMidpoint ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {paletteName} {item.step}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="size-3.5 rounded-sm border border-border"
                style={{ backgroundColor: item.hex }}
              />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {item.hex}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
