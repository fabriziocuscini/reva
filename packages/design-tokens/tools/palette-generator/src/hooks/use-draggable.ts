import { useRef, useState, useCallback, useEffect } from "react"

interface DraggableReturn {
  /** Spread onto the drag-handle element */
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    style: React.CSSProperties
  }
  /** Attach to the panel root for measuring bounds */
  panelRef: React.RefObject<HTMLDivElement | null>
  /** Style to spread onto the panel root (position + transform) */
  style: React.CSSProperties
}

/**
 * Lightweight drag hook using pointer capture.
 *
 * @param initialPos – fixed position for the panel (`left`, `top`)
 */
export function useDraggable(initialPos: { x: number; y: number }): DraggableReturn {
  const panelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const dragStart = useRef<{
    mx: number
    my: number
    ox: number
    oy: number
  } | null>(null)
  const rafId = useRef(0)
  const [, setTick] = useState(0)

  /* ---- clamp so at least 80px stays visible ---- */
  const clamp = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const minVisible = 80

    let { x, y } = offsetRef.current
    // right edge must be at least minVisible inside viewport
    if (initialPos.x + x + rect.width < minVisible) {
      x = minVisible - rect.width - initialPos.x
    }
    // left edge
    if (initialPos.x + x > vw - minVisible) {
      x = vw - minVisible - initialPos.x
    }
    // bottom edge
    if (initialPos.y + y + rect.height < minVisible) {
      y = minVisible - rect.height - initialPos.y
    }
    // top edge
    if (initialPos.y + y > vh - minVisible) {
      y = vh - minVisible - initialPos.y
    }

    offsetRef.current = { x, y }
  }, [initialPos.x, initialPos.y])

  /* ---- pointer handlers (spread onto handle element) ---- */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        ox: offsetRef.current.x,
        oy: offsetRef.current.y,
      }
    },
    []
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      offsetRef.current = {
        x: dragStart.current.ox + dx,
        y: dragStart.current.oy + dy,
      }
      clamp()
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => setTick((t) => t + 1))
    },
    [clamp]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    dragStart.current = null
  }, [])

  /* ---- re-clamp on window resize ---- */
  useEffect(() => {
    const onResize = () => {
      clamp()
      setTick((t) => t + 1)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [clamp])

  /* ---- computed styles ---- */
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: initialPos.x,
    top: initialPos.y,
    transform: `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`,
    willChange: "transform",
  }

  const handleStyle: React.CSSProperties = {
    cursor: dragStart.current ? "grabbing" : "grab",
    touchAction: "none",
    userSelect: "none",
  }

  return {
    panelRef,
    style: panelStyle,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      style: handleStyle,
    },
  }
}
