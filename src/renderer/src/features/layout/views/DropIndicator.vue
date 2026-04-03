<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { dropPreview, workspaceState, globalDragState } from '../stores/useLayout'

const GAP_THRESHOLD = 16
const MIN_GAP_SIZE = 4

const preview = computed(() => dropPreview.value)

const isHorizontalLine = computed(() => {
  if (
    preview.value.operationType === 'insert-gap' ||
    preview.value.operationType === 'split-insert'
  ) {
    return preview.value.width > preview.value.height
  }
  return true
})

interface GapPosition {
  x: number
  y: number
  width: number
  height: number
  distance: number
}

function calculateDistanceToGap(
  mouseX: number,
  mouseY: number,
  gapRect: DOMRect,
  isHorizontal: boolean
): number {
  if (isHorizontal) {
    if (
      mouseX >= gapRect.left &&
      mouseX <= gapRect.right &&
      mouseY >= gapRect.top &&
      mouseY <= gapRect.bottom
    ) {
      return 0
    }
    if (mouseY < gapRect.top || mouseY > gapRect.bottom) {
      return Infinity
    }
    if (mouseX < gapRect.left) {
      return gapRect.left - mouseX
    }
    return mouseX - gapRect.right
  } else {
    if (
      mouseX >= gapRect.left &&
      mouseX <= gapRect.right &&
      mouseY >= gapRect.top &&
      mouseY <= gapRect.bottom
    ) {
      return 0
    }
    if (mouseX < gapRect.left || mouseX > gapRect.right) {
      return Infinity
    }
    if (mouseY < gapRect.top) {
      return gapRect.top - mouseY
    }
    return mouseY - gapRect.bottom
  }
}

function calculateGapPosition(mouseX: number, mouseY: number): void {
  const targetLayer = workspaceState.layer.find((l) => !l.isDragLayer)
  if (!targetLayer) return

  const targetLayerElement = document.querySelector('.layer-base')
  if (!targetLayerElement) return

  const targetLayerRect = targetLayerElement.getBoundingClientRect()
  if (
    mouseX < targetLayerRect.left ||
    mouseX > targetLayerRect.right ||
    mouseY < targetLayerRect.top ||
    mouseY > targetLayerRect.bottom
  ) {
    hidePreview()
    return
  }

  const canvasElements = targetLayerElement.querySelectorAll('.Tab-folder-canvas')
  const foundGaps: (GapPosition & { containerId: string | null; index: number })[] = []

  for (let i = 0; i < canvasElements.length; i++) {
    const canvasEl = canvasElements[i]
    const canvasRect = canvasEl.getBoundingClientRect()
    const isHorizontal = canvasEl.classList.contains('is-row')
    const containerId = (canvasEl as HTMLElement).dataset.containerId || null
    const shellContainers = Array.from(canvasEl.querySelectorAll(':scope > .Tab-folder-item'))

    const childRects = shellContainers.map((el) => ({
      rect: el.getBoundingClientRect(),
      isFreeContainer: el.classList.contains('Free-folder-container')
    }))

    for (let j = 0; j <= childRects.length; j++) {
      let gapRect: DOMRect

      if (j === 0) {
        if (isHorizontal) {
          gapRect = new DOMRect(
            canvasRect.left,
            canvasRect.top,
            childRects[0]?.rect.left - canvasRect.left || 0,
            canvasRect.height
          )
        } else {
          gapRect = new DOMRect(
            canvasRect.left,
            canvasRect.top,
            canvasRect.width,
            childRects[0]?.rect.top - canvasRect.top || 0
          )
        }
      } else if (j === childRects.length) {
        if (isHorizontal) {
          const prevRight = childRects[j - 1].rect.right
          gapRect = new DOMRect(
            prevRight,
            canvasRect.top,
            canvasRect.right - prevRight,
            canvasRect.height
          )
        } else {
          const prevBottom = childRects[j - 1].rect.bottom
          gapRect = new DOMRect(
            canvasRect.left,
            prevBottom,
            canvasRect.width,
            canvasRect.bottom - prevBottom
          )
        }
      } else {
        if (isHorizontal) {
          const prevRight = childRects[j - 1].rect.right
          const nextLeft = childRects[j].rect.left
          gapRect = new DOMRect(prevRight, canvasRect.top, nextLeft - prevRight, canvasRect.height)
        } else {
          const prevBottom = childRects[j - 1].rect.bottom
          const nextTop = childRects[j].rect.top
          gapRect = new DOMRect(canvasRect.left, prevBottom, canvasRect.width, nextTop - prevBottom)
        }
      }

      const distance = calculateDistanceToGap(mouseX, mouseY, gapRect, isHorizontal)

      if (distance < GAP_THRESHOLD) {
        let x: number
        let y: number
        let width: number
        let height: number

        if (isHorizontal) {
          const gapCenter = gapRect.left + gapRect.width / 2
          x = gapCenter - targetLayerRect.left - MIN_GAP_SIZE / 2
          y = canvasRect.top - targetLayerRect.top
          width = MIN_GAP_SIZE
          height = canvasRect.height
        } else {
          const gapCenter = gapRect.top + gapRect.height / 2
          x = canvasRect.left - targetLayerRect.left
          y = gapCenter - targetLayerRect.top - MIN_GAP_SIZE / 2
          width = canvasRect.width
          height = MIN_GAP_SIZE
        }

        foundGaps.push({
          x,
          y,
          width,
          height,
          distance,
          containerId,
          index: j
        })
      }
    }
  }

  if (foundGaps.length === 0) {
    hidePreview()
    return
  }

  foundGaps.sort((a, b) => a.distance - b.distance)
  const closestGap = foundGaps[0]

  dropPreview.value = {
    visible: true,
    visualType: 'gap',
    x: closestGap.x,
    y: closestGap.y,
    width: closestGap.width,
    height: closestGap.height,
    operationType: 'insert-gap',
    targetContainerId: closestGap.containerId,
    targetIndex: closestGap.index
  }
}

function hidePreview(): void {
  dropPreview.value = {
    visible: false,
    visualType: 'gap',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    operationType: 'insert-gap',
    targetContainerId: null,
    targetIndex: null
  }
}

function handleMouseMove(e: MouseEvent): void {
  if (globalDragState.value && globalDragState.value.id) {
    calculateGapPosition(e.clientX, e.clientY)
  } else {
    hidePreview()
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div
    v-if="preview.operationType === 'insert-gap' && preview.visible && preview.visualType === 'gap'"
    class="drop-indicator"
    :class="{ 'is-horizontal': isHorizontalLine }"
    :style="{
      left: preview.x + 'px',
      top: preview.y + 'px',
      width: preview.width + 'px',
      height: preview.height + 'px'
    }"
  >
    <div class="drop-indicator-inner"></div>
  </div>
</template>

<style scoped>
.drop-indicator {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}

.drop-indicator-inner {
  width: 100%;
  height: 100%;
  background: #0078d4;
  box-sizing: border-box;
}

.drop-indicator.is-horizontal .drop-indicator-inner {
  background: linear-gradient(to right, transparent, #0078d4, transparent);
  opacity: 0.8;
}

.drop-indicator:not(.is-horizontal) .drop-indicator-inner {
  background: linear-gradient(to bottom, transparent, #0078d4, transparent);
  opacity: 0.8;
}
</style>
