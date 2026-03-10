import { ColorPickerInput } from '@/components/color-picker-input'
import { Button } from '@/components/ui/button'
import tailwindColors from '@/data/tailwind-colors.json'
import { useDraggable } from '@/hooks/use-draggable'
import { copyToClipboard } from '@/lib/clipboard'
import { STEPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp, Check, ChevronRight, Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface CompareEntry {
  step: number
  hex: string
  benchmarkHex: string
}

export type DockSide = 'left' | 'right' | null

type TailwindPalettes = Record<string, Record<string, string>>
const twPalettes = tailwindColors as TailwindPalettes
const twPaletteNames = Object.keys(twPalettes)

interface ComparePanelProps {
  entries: CompareEntry[]
  paletteName: string
  /** Map of step → hex for all palette steps (used for color dots in the add menu) */
  paletteHexMap: Map<number, string>
  docked: DockSide
  onDockChange: (side: DockSide) => void
  onDragMove?: (pos: { clientX: number; clientY: number }) => void
  onAddStep: (step: number) => void
  onBenchmarkChange: (step: number, hex: string) => void
  onRemoveStep: (step: number) => void
  onLoadTailwindPalette: (palette: Record<string, string>, displayName: string) => void
  onClose: () => void
}

const DROP_ZONE_WIDTH = 288 // matches w-72 panel width

function toPascalCase(s: string): string {
  return s.replace(/(?:^|\s|[-_])\w/g, (m) => m.toUpperCase()).replace(/[-_\s]/g, '')
}

export function ComparePanel({
  entries,
  paletteName,
  paletteHexMap,
  docked,
  onDockChange,
  onDragMove,
  onAddStep,
  onBenchmarkChange,
  onRemoveStep,
  onLoadTailwindPalette,
  onClose,
}: ComparePanelProps) {
  const initialPos = useMemo(
    () => ({
      x: Math.round((window.innerWidth - 288) / 2),
      y: 180,
    }),
    [],
  )

  const isFloating = docked === null

  const {
    panelRef,
    style: panelStyle,
    handleProps,
    isDragging,
  } = useDraggable({
    initialPos,
    enabled: isFloating,
    onDragMove: isFloating ? onDragMove : undefined,
    onDragEnd: isFloating
      ? (pos) => {
          if (pos.clientX < DROP_ZONE_WIDTH) {
            onDockChange('left')
          } else if (pos.clientX > window.innerWidth - DROP_ZONE_WIDTH) {
            onDockChange('right')
          } else {
            onDockChange(null)
          }
        }
      : () => {
          onDockChange(null)
        },
  })

  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [twSubOpen, setTwSubOpen] = useState(false)
  const [sortAsc, setSortAsc] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)
  const twTriggerRef = useRef<HTMLButtonElement>(null)
  const twSubRef = useRef<HTMLDivElement>(null)

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => (sortAsc ? a.step - b.step : b.step - a.step)),
    [entries, sortAsc],
  )

  const entrySteps = useMemo(() => new Set(entries.map((e) => e.step)), [entries])
  const availableSteps = useMemo(() => STEPS.filter((s) => !entrySteps.has(s)), [entrySteps])

  // Close the add menu when clicking outside
  useEffect(() => {
    if (!addOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(target) &&
        !(twSubRef.current && twSubRef.current.contains(target))
      ) {
        setAddOpen(false)
        setTwSubOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [addOpen])

  // Close Tailwind sub-menu when parent closes
  useEffect(() => {
    if (!addOpen) setTwSubOpen(false)
  }, [addOpen])

  function handleCopyHex(step: number, hex: string) {
    copyToClipboard(hex)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 900)
  }

  // Position the Tailwind sub-menu to the left of the trigger
  const [twSubStyle, setTwSubStyle] = useState<React.CSSProperties>({})
  useEffect(() => {
    if (!twSubOpen || !twTriggerRef.current || !addMenuRef.current) return
    const triggerRect = twTriggerRef.current.getBoundingClientRect()
    const menuRect = addMenuRef.current.getBoundingClientRect()
    setTwSubStyle({
      position: 'fixed',
      top: triggerRect.top,
      left: menuRect.left - 4, // 4px gap
      transform: 'translateX(-100%)',
    })
  }, [twSubOpen])

  return (
    <div
      ref={panelRef}
      style={isFloating ? panelStyle : undefined}
      className={cn(
        'flex flex-col bg-card text-card-foreground',
        isFloating
          ? 'z-50 w-72 max-h-[80vh] rounded-lg ring-1 ring-foreground/10 shadow-xl backdrop-blur-md bg-card/60'
          : 'w-72 shrink-0 h-screen sticky top-0 border-border',
        !isFloating && docked === 'left' && 'border-r',
        !isFloating && docked === 'right' && 'border-l',
      )}
    >
      {/* Header — drag handle */}
      <div {...handleProps} className="flex items-center justify-between px-3 py-2 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none">
          Compare
        </span>
        <div className="flex items-center gap-0.5">
          {entries.length > 1 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSortAsc((v) => !v)}
              onPointerDown={(e) => e.stopPropagation()}
              title={sortAsc ? 'Sort descending' : 'Sort ascending'}
            >
              {sortAsc ? <ArrowUp /> : <ArrowDown />}
              <span className="sr-only">{sortAsc ? 'Sort descending' : 'Sort ascending'}</span>
            </Button>
          )}
          {/* Add step menu (always visible so user can load TW palettes even when all steps are added) */}
          <div className="relative" ref={addMenuRef}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAddOpen((v) => !v)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Plus />
              <span className="sr-only">Add step</span>
            </Button>
            {addOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 max-h-60 w-44 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {availableSteps.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      onAddStep(s)
                      setAddOpen(false)
                    }}
                  >
                    <span
                      className="size-3 rounded-full shrink-0 border border-border"
                      style={{ backgroundColor: paletteHexMap.get(s) }}
                    />
                    {toPascalCase(paletteName)} {s}
                  </button>
                ))}
                {availableSteps.length > 1 && (
                  <>
                    <div className="my-1 h-px bg-border/50" />
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed font-medium hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        availableSteps.forEach((s) => onAddStep(s))
                        setAddOpen(false)
                      }}
                    >
                      Add all swatches
                    </button>
                  </>
                )}

                {/* Tailwind Colors sub-menu trigger */}
                <div className="my-1 h-px bg-border/50" />
                <button
                  ref={twTriggerRef}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs/relaxed font-medium hover:bg-accent hover:text-accent-foreground"
                  onMouseEnter={() => setTwSubOpen(true)}
                  onClick={() => setTwSubOpen((v) => !v)}
                >
                  Tailwind Colors
                  <ChevronRight className="size-3 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <X />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Tailwind sub-menu (rendered via portal-like fixed position) */}
      {twSubOpen && (
        <div
          ref={twSubRef}
          style={twSubStyle}
          className="z-[60] max-h-60 w-40 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          onMouseLeave={() => setTwSubOpen(false)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {twPaletteNames.map((name) => {
            const steps = twPalettes[name]
            const midHex = steps['500'] ?? Object.values(steps)[5]
            return (
              <button
                key={name}
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onLoadTailwindPalette(steps, toPascalCase(name))
                  setTwSubOpen(false)
                  setAddOpen(false)
                }}
              >
                <span
                  className="size-3 rounded-full shrink-0 border border-border"
                  style={{ backgroundColor: midHex }}
                />
                {toPascalCase(name)}
              </button>
            )
          })}
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sortedEntries.length === 0 ? (
          <div className="flex items-center justify-center px-3 py-8">
            <p className="text-[10px] text-muted-foreground">
              Click <span className="font-medium">+</span> to add swatches, or use the compare
              button on the palette strip.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-3 pb-3">
            {sortedEntries.map((entry) => (
              <div key={entry.step}>
                {/* Name + remove */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wide text-muted-foreground">
                    {paletteName} {entry.step}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onRemoveStep(entry.step)}
                    title={`Remove step ${entry.step}`}
                  >
                    <Minus className="size-2.5" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>

                {/* Side-by-side swatches */}
                <div className="flex overflow-hidden rounded-md">
                  <button
                    type="button"
                    className="flex-1 aspect-[4/3] cursor-pointer border-0 p-0 relative"
                    style={{ backgroundColor: entry.hex }}
                    onClick={() => handleCopyHex(entry.step, entry.hex)}
                    title={`Copy ${entry.hex}`}
                  >
                    {copiedStep === entry.step && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white pointer-events-none"
                        style={{ animation: 'fade-in-out 0.9s ease-in-out forwards' }}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  <div
                    className="flex-1 aspect-[4/3]"
                    style={{ backgroundColor: entry.benchmarkHex }}
                  />
                </div>

                {/* Hex labels row */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className="size-3.5 rounded-sm border border-border"
                      style={{ backgroundColor: entry.hex }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {entry.hex}
                    </span>
                  </div>
                  <ColorPickerInput
                    value={entry.benchmarkHex}
                    onChange={(hex) => onBenchmarkChange(entry.step, hex)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
