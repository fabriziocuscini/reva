'use client'

import { Button } from '@reva/ui'

export const code = `<Button disabled>Disabled</Button>
<Button variant="outline" disabled>Disabled</Button>
<Button variant="ghost" disabled>Disabled</Button>`

export default function ButtonDisabled() {
  return (
    <>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
      <Button variant="ghost" disabled>
        Disabled
      </Button>
    </>
  )
}
