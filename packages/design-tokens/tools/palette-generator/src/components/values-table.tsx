import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { copyToClipboard } from '@/lib/clipboard'
import { MAIN_STEPS } from '@/lib/constants'
import type { PaletteStep } from '@/lib/types'
import { useState } from 'react'

interface ValuesTableProps {
  palette: PaletteStep[]
}

function CopyableHex({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copyToClipboard(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="cursor-pointer inline-flex items-center gap-1.5 bg-transparent border-0 p-0 font-mono text-inherit"
      title="Click to copy"
    >
      <span
        className="size-2.5 rounded-sm shrink-0 border border-border"
        style={{ backgroundColor: hex }}
      />
      <span className="transition-colors duration-150">{copied ? 'Copied!' : hex}</span>
    </button>
  )
}

export function ValuesTable({ palette }: ValuesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead rowSpan={2} className="w-10">
            Step
          </TableHead>
          <TableHead rowSpan={2} className="w-20">
            HEX
          </TableHead>
          <TableHead
            colSpan={3}
            className="text-center border-b text-[10px] uppercase tracking-widest text-muted-foreground font-bold"
          >
            OKLCH
          </TableHead>
          <TableHead
            colSpan={3}
            className="text-center border-b text-[10px] uppercase tracking-widest text-muted-foreground font-bold"
          >
            HSL
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="w-14">L</TableHead>
          <TableHead className="w-14">C</TableHead>
          <TableHead className="w-14">H</TableHead>
          <TableHead className="w-12 text-muted-foreground">H</TableHead>
          <TableHead className="w-12 text-muted-foreground">S</TableHead>
          <TableHead className="w-12 text-muted-foreground">L</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {palette.map((item) => {
          const isMain = MAIN_STEPS.has(item.step)
          return (
            <TableRow
              key={item.step}
              className={`font-mono text-xs ${
                item.isMidpoint ? 'bg-accent font-bold' : !isMain ? 'text-muted-foreground/50' : ''
              }`}
            >
              <TableCell>{item.step}</TableCell>
              <TableCell>
                <CopyableHex hex={item.hex} />
              </TableCell>
              <TableCell>{item.L.toFixed(3)}</TableCell>
              <TableCell>{item.C.toFixed(3)}</TableCell>
              <TableCell>{item.H.toFixed(1)}</TableCell>
              <TableCell className="text-muted-foreground">{item.hsl.h.toFixed(0)}&deg;</TableCell>
              <TableCell className="text-muted-foreground">{item.hsl.s.toFixed(0)}%</TableCell>
              <TableCell className="text-muted-foreground">{item.hsl.l.toFixed(0)}%</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
