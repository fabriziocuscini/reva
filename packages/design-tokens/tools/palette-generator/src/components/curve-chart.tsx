import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { PaletteStep } from '@/lib/types'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

interface CurveChartProps {
  palette: PaletteStep[]
  dataKey: 'L' | 'C' | 'H'
  color: string
  className?: string
}

const chartConfig: ChartConfig = {
  value: {
    label: 'Value',
    color: 'var(--foreground)',
  },
}

export function CurveChart({ palette, dataKey, color, className }: CurveChartProps) {
  const values = palette.map((p) => p[dataKey])
  const min = Math.min(...values)
  const max = Math.max(...values)

  let yMin: number
  let yMax: number

  if (dataKey === 'H') {
    const padding = Math.max((max - min) * 0.15, 2)
    yMin = Math.floor(min - padding)
    yMax = Math.ceil(max + padding)
  } else {
    const padding = (max - min) * 0.1 || 0.05
    yMin = Math.max(0, Math.floor((min - padding) * 100) / 100)
    yMax = dataKey === 'L' ? 1.0 : Math.ceil((max + padding) * 1000) / 1000
  }

  return (
    <ChartContainer config={chartConfig} className={className ?? 'h-48 w-full'}>
      <LineChart data={palette} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="step" hide />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={dataKey === 'H' ? 42 : 36}
          tickCount={5}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const data = payload[0].payload as PaletteStep
            return (
              <div className="rounded-md bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-border/50">
                <span className="font-mono">
                  Step {data.step}: {data[dataKey].toFixed(dataKey === 'H' ? 1 : 3)}
                  {dataKey === 'H' ? '°' : ''}
                </span>
              </div>
            )
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--card)', stroke: color, strokeWidth: 2 }}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ChartContainer>
  )
}
