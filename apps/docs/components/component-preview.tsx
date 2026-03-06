import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import type { ReactNode } from 'react'

interface ComponentPreviewProps {
  children: ReactNode
  code: string
}

export function ComponentPreview({ children, code }: ComponentPreviewProps) {
  return (
    <Tabs items={['Preview', 'Code']}>
      <Tab value="Preview">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem',
            border: '1px solid var(--fd-border)',
            borderRadius: '0.5rem',
            background: 'white',
          }}
        >
          {children}
        </div>
      </Tab>
      <Tab value="Code">
        <pre>
          <code className="language-tsx">{code}</code>
        </pre>
      </Tab>
    </Tabs>
  )
}
