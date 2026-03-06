import { copyToClipboard } from '@/lib/clipboard'
import { ALPHA_STEPS, ALPHA_SUFFIXES } from '@/lib/constants'
import { useMemo, useState } from 'react'

interface AlphaStripProps {
  midpointHex: string
}

export function AlphaStrip({ midpointHex }: AlphaStripProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const alphaSwatches = useMemo(() => {
    const base = midpointHex.replace('#', '').toLowerCase()
    return ALPHA_STEPS.map((step) => ({
      step,
      hex: `#${base}${ALPHA_SUFFIXES[step]}`,
    }))
  }, [midpointHex])

  return (
    <div>
      {/* Alpha labels */}
      <div className="flex">
        {alphaSwatches.map(({ step }) => (
          <span
            key={step}
            className="flex-1 text-center text-[9px] font-mono mb-1 text-muted-foreground/60"
          >
            {step}%
          </span>
        ))}
      </div>

      {/* Alpha swatches with checkerboard */}
      <div className="flex overflow-hidden rounded-t-lg">
        {alphaSwatches.map(({ step, hex }) => (
          <button
            key={step}
            type="button"
            onClick={() => {
              copyToClipboard(hex)
              setCopiedStep(step)
              setTimeout(() => setCopiedStep(null), 900)
            }}
            className="flex-1 h-5 md:h-6 lg:h-8 relative cursor-pointer border-0 p-0"
            style={{
              backgroundImage: `
                repeating-conic-gradient(
                  hsl(var(--muted)) 0% 25%,
                  transparent 0% 50%
                )`,
              backgroundSize: '12px 12px',
            }}
            title={`Click to copy ${hex}`}
          >
            <div className="absolute inset-0" style={{ backgroundColor: hex }} />
            {copiedStep === step && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-white text-[9px] font-bold font-mono tracking-wider z-10">
                Copied
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
