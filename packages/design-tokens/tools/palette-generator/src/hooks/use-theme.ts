import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'palette-gen-color-mode'

export function useTheme() {
  const hasToggled = useRef(false)

  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light') return false
    if (stored === 'dark') return true
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggle = useCallback(() => {
    hasToggled.current = true
    setDark((d) => {
      const next = !d
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
      return next
    })
  }, [])

  return { dark, toggle }
}
