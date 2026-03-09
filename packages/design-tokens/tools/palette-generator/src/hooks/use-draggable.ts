import { useCallback, useEffect, useRef, useState } from 'react'

interface DraggableOptions {
  initialPos: { x: number; y: number }
  enabled?: boolean
  onDragMove?: (pos: { clientX: number; clientY: number }) => void
  onDragEnd?: (pos: { clientX: number; clientY: number }) => void
}

interface DraggableReturn {
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    style: React.CSSProperties
  }
  panelRef: React.RefObject<HTMLDivElement | null>
  style: React.CSSProperties
  isDragging: boolean
}

export function useDraggable({
  initialPos,
  enabled = true,
  onDragMove,
  onDragEnd,
}: DraggableOptions): DraggableReturn {
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
  const [isDragging, setIsDragging] = useState(false)

  const callbackRefs = useRef({ onDragMove, onDragEnd })
  callbackRefs.current = { onDragMove, onDragEnd }

  const clamp = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const minVisible = 80

    let { x, y } = offsetRef.current
    if (initialPos.x + x + rect.width < minVisible) {
      x = minVisible - rect.width - initialPos.x
    }
    if (initialPos.x + x > vw - minVisible) {
      x = vw - minVisible - initialPos.x
    }
    if (initialPos.y + y + rect.height < minVisible) {
      y = minVisible - rect.height - initialPos.y
    }
    if (initialPos.y + y > vh - minVisible) {
      y = vh - minVisible - initialPos.y
    }

    offsetRef.current = { x, y }
  }, [initialPos.x, initialPos.y])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y,
    }
    setIsDragging(true)
  }, [])

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
      callbackRefs.current.onDragMove?.({ clientX: e.clientX, clientY: e.clientY })
    },
    [clamp],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    const wasDragging = dragStart.current !== null
    dragStart.current = null
    setIsDragging(false)
    if (wasDragging) {
      callbackRefs.current.onDragEnd?.({ clientX: e.clientX, clientY: e.clientY })
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      offsetRef.current = { x: 0, y: 0 }
    }
  }, [enabled])

  useEffect(() => {
    const onResize = () => {
      clamp()
      setTick((t) => t + 1)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp])

  const panelStyle: React.CSSProperties = enabled
    ? {
        position: 'fixed',
        left: initialPos.x,
        top: initialPos.y,
        transform: `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`,
        willChange: 'transform',
      }
    : {}

  const handleStyle: React.CSSProperties = {
    cursor: dragStart.current ? 'grabbing' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
  }

  return {
    panelRef,
    style: panelStyle,
    isDragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      style: handleStyle,
    },
  }
}
