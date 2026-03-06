import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"
import { ALPHA_STEPS, ALPHA_SUFFIXES } from "@/lib/constants"
import type { PaletteStep } from "@/lib/types"

interface CopyBlockProps {
  palette: PaletteStep[]
  paletteName: string
  midpointHex: string
}

export function CopyBlock({ palette, paletteName, midpointHex }: CopyBlockProps) {
  const [copied, setCopied] = useState(false)

  const text = useMemo(() => {
    const indent = "      "
    const base = midpointHex.replace("#", "").toLowerCase()

    const steps = palette
      .map(
        (item) =>
          `${indent}"${item.step}": {\n${indent}  "$value": "${item.hex}"\n${indent}}`
      )
      .join(",\n")

    const alphas = ALPHA_STEPS.map(
      (step) =>
        `${indent}  "a${step}": {\n${indent}    "$value": "#${base}${ALPHA_SUFFIXES[step]}"\n${indent}  }`
    ).join(",\n")

    return `    "${paletteName}": {\n${steps},\n${indent}"alpha": {\n${alphas}\n${indent}}\n    }`
  }, [palette, paletteName, midpointHex])

  const handleCopy = () => {
    copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative">
      <pre className="rounded-lg bg-neutral-800 text-neutral-200 p-3 text-[11px] font-mono leading-relaxed overflow-x-auto">
        {text}
      </pre>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}
