type MoveHandler = (clientX: number, clientY: number) => void
type EndHandler = () => void

interface DragSession {
  id: string
  onMove: MoveHandler
  onEnd: EndHandler
}

let activeSession: DragSession | null = null

const moveSubscribers = new Set<MoveHandler>()
const endSubscribers = new Set<EndHandler>()

const handleMouseMove = (e: MouseEvent): void => {
  if (!activeSession) return
  activeSession.onMove(e.clientX, e.clientY)
  moveSubscribers.forEach((fn) => fn(e.clientX, e.clientY))
}

const handleMouseUp = (): void => {
  if (!activeSession) return
  activeSession.onEnd()
  endSubscribers.forEach((fn) => fn())
  activeSession = null
}

document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mouseup', handleMouseUp)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })
}

export const startDrag = (
  id: string,
  callbacks: { onMove: MoveHandler; onEnd: EndHandler }
): void => {
  activeSession = { id, ...callbacks }
}

export const cancelDrag = (id: string): void => {
  if (!activeSession || activeSession.id !== id) return
  activeSession.onEnd()
  activeSession = null
}

export const subscribeToMove = (fn: MoveHandler): (() => void) => {
  moveSubscribers.add(fn)
  return () => {
    moveSubscribers.delete(fn)
  }
}

export const subscribeToEnd = (fn: EndHandler): (() => void) => {
  endSubscribers.add(fn)
  return () => {
    endSubscribers.delete(fn)
  }
}
