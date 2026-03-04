import { useRef, useCallback } from "react"
import type { PaletteParams } from "@/lib/types"

const MAX_HISTORY = 100
const DEBOUNCE_MS = 500

function paramsEqual(a: PaletteParams, b: PaletteParams): boolean {
  return (Object.keys(a) as (keyof PaletteParams)[]).every((k) => a[k] === b[k])
}

export function useHistory() {
  const past = useRef<PaletteParams[]>([])
  const future = useRef<PaletteParams[]>([])
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSnapshot = useRef<PaletteParams | null>(null)

  /** Flush any pending debounced snapshot into history immediately. */
  const flush = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = null
    }
    if (pendingSnapshot.current) {
      past.current.push(pendingSnapshot.current)
      if (past.current.length > MAX_HISTORY) past.current.shift()
      pendingSnapshot.current = null
    }
  }, [])

  /**
   * Record a snapshot before a param change (debounced).
   * Call this with the *current* params right before applying a new value.
   * Multiple rapid calls (e.g. slider dragging) collapse into one history entry.
   */
  const record = useCallback(
    (before: PaletteParams) => {
      // If there's already a pending snapshot, keep the older one (start of drag)
      if (pendingSnapshot.current === null) {
        pendingSnapshot.current = { ...before }
      }

      // Reset the debounce timer
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        flush()
      }, DEBOUNCE_MS)

      // Any new change clears redo stack
      future.current = []
    },
    [flush]
  )

  /**
   * Undo: restore the most recent past snapshot.
   * Returns the params to restore, or null if nothing to undo.
   */
  const undo = useCallback(
    (current: PaletteParams): PaletteParams | null => {
      // Flush any pending snapshot first so the current drag is committed
      flush()

      const prev = past.current.pop()
      if (!prev) return null

      // Don't push if current already matches (avoids duplicate entries)
      if (!paramsEqual(current, prev)) {
        future.current.push({ ...current })
      }
      return { ...prev }
    },
    [flush]
  )

  /**
   * Redo: restore the most recent future snapshot.
   * Returns the params to restore, or null if nothing to redo.
   */
  const redo = useCallback(
    (current: PaletteParams): PaletteParams | null => {
      const next = future.current.pop()
      if (!next) return null

      if (!paramsEqual(current, next)) {
        past.current.push({ ...current })
        if (past.current.length > MAX_HISTORY) past.current.shift()
      }
      return { ...next }
    },
    []
  )

  /** Clear all history (e.g. when switching presets). */
  const clear = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = null
    }
    pendingSnapshot.current = null
    past.current = []
    future.current = []
  }, [])

  const canUndo = useCallback(
    () => past.current.length > 0 || pendingSnapshot.current !== null,
    []
  )
  const canRedo = useCallback(() => future.current.length > 0, [])

  return { record, undo, redo, clear, canUndo, canRedo }
}
