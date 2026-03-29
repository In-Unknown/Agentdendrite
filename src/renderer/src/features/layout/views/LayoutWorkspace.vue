<!-- src/renderer/src/features/layout/views/LayoutWorkspace.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import LayerRoot from './LayerRoot.vue'
import { workspaceState } from '../stores/useLayout'

const handleGlobalMouseMove = (e: MouseEvent): void => {
  if (workspaceState.draggedIndex !== -1) {
    const dragLayer = workspaceState.layer.find((l) => l.isDragLayer)
    const rootShell = dragLayer?.root.data[0]
    const fullFreeCanvas = rootShell?.type === 'shell' ? rootShell.data[0] : null
    const node =
      fullFreeCanvas?.type === 'full-free-canvas'
        ? fullFreeCanvas.data[workspaceState.draggedIndex]
        : null

    if (node && 'position' in node) {
      node.position = [e.clientX, e.clientY]
    }
  }
}

const handleGlobalMouseUp = (): void => {
  workspaceState.draggedIndex = -1
}

onMounted(() => {
  window.addEventListener('mousemove', handleGlobalMouseMove)
  window.addEventListener('mouseup', handleGlobalMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleGlobalMouseMove)
  window.removeEventListener('mouseup', handleGlobalMouseUp)
})
</script>

<template>
  <div class="stack-wrapper">
    <LayerRoot
      v-for="l in workspaceState.layer"
      :key="l.id"
      :layer="l"
      :class="l.isDragLayer ? 'layer-overlay' : 'layer-base'"
    />
  </div>
</template>

<style scoped>
/* 工作区作为坐标系基准 */
.stack-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
}

/* 所有的层都绝对定位并撑满，实现完美重叠 */
.layer-base,
.layer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.layer-base {
  z-index: 1;
}

.layer-overlay {
  z-index: 2;
  pointer-events: none; /* 让顶层透明，鼠标直接点到底层 */
}

/* 只让悬浮窗恢复交互响应 */
.layer-overlay :deep(.is-floating) {
  pointer-events: auto;
}
</style>
