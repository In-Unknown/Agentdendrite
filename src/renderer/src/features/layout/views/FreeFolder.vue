// src/renderer/src/features/layout/views/FreeFolder.vue
<script lang="ts">
// 【重要新增】模块级变量，用于在所有 FreeFolder 实例间共享和递增 z-index
// 这样无论你点击哪个悬浮窗，都能拿到全局最高的层级
let globalMaxZIndex = 100
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  FreeFolderItem,
  FullCanvasFreeFolderData,
  ShellFreeFolderData,
  CanvasFreeFolderData
} from '../models/PageLayout'
import TabPanel from './TabPanel.vue'

const props = defineProps<{
  folderData: FreeFolderItem | FullCanvasFreeFolderData
}>()

// 用于获取当前组件的 DOM 实例
const containerRef = ref<HTMLElement | null>(null)

const containerStyle = computed(() => {
  const item = props.folderData
  const style: Record<string, string | number> = {
    backgroundColor: item.backgroundColor || 'var(--color-bg-100)'
  }

  if (item.type === 'full-free-canvas') {
    style.width = '100%'
    style.height = '100%'
    style.position = 'relative'
  } else {
    style.width = `${item.size[0]}px`
    style.height = `${item.size[1]}px`
    style.left = `${item.position[0]}px`
    style.top = `${item.position[1]}px`
    style.position = 'absolute'
    style.zIndex = item.zIndex || 1
  }

  return style
})

const bringToFront = (): void => {
  const item = props.folderData
  if (item.type === 'full-free-canvas') return

  globalMaxZIndex += 1
  ;(item as ShellFreeFolderData | CanvasFreeFolderData).zIndex = globalMaxZIndex
}

const startDrag = (e: MouseEvent): void => {
  const item = props.folderData
  if (item.type === 'full-free-canvas') return

  e.preventDefault()
  bringToFront()

  // 【性能优化】在拖拽开始时获取一次父容器尺寸，避免在 onMouseMove 中重复触发回流
  const parentEl = containerRef.value?.parentElement
  // 先获取基础宽度（优先父容器，没有则用窗口），然后统一减去 15
  const baseWidth = parentEl?.clientWidth ?? window.innerWidth
  const baseHeight = parentEl?.clientHeight ?? window.innerHeight
  const maxX = baseWidth - 15
  const maxY = baseHeight - 15

  const startX = e.clientX
  const startY = e.clientY
  const initialPosX = item.position[0]
  const initialPosY = item.position[1]

  const onMouseMove = (moveEvent: MouseEvent): void => {
    // 计算新位置
    const nextX = initialPosX + moveEvent.clientX - startX
    const nextY = initialPosY + moveEvent.clientY - startY

    // 限位逻辑：确保左上角坐标在 [0, Max] 之间
    // 如果你想让窗口完全不超出右边界，请将 maxX 改为 (maxX - 窗口宽度)
    item.position[0] = Math.max(0, Math.min(nextX, maxX))
    item.position[1] = Math.max(0, Math.min(nextY, maxY))
  }

  const onMouseUp = (): void => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <!-- 文件夹容器：根据类型判断是悬浮窗还是全屏画布 -->
  <div
    ref="containerRef"
    class="free-folder-container"
    :class="{ 'is-floating': folderData.type !== 'full-free-canvas' }"
    :style="containerStyle"
    @mousedown.capture="bringToFront"
  >
    <!-- 拖拽手柄：仅在悬浮窗模式下显示，用于拖动整个窗口 -->
    <div
      v-if="folderData.type !== 'full-free-canvas'"
      class="free-folder-drag-handle"
      @mousedown="startDrag"
    >
      <div class="drag-indicator"></div>
    </div>

    <!-- 内容区域：根据类型显示不同内容 -->
    <div class="free-folder-content">
      <!-- 如果是叶子节点（free-shell），显示标签面板 -->
      <template v-if="folderData.type === 'free-shell'">
        <TabPanel :leaf-data="folderData.data[0]" :folder-id="folderData.id" />
      </template>

      <!-- 如果是容器节点（canvas），递归渲染子文件夹 -->
      <template v-else>
        <FreeFolder v-for="child in folderData.data" :key="child.id" :folder-data="child" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.free-folder-container {
  box-sizing: border-box;
  /* 【关键修改】：变成纵向弹性盒布局 */
  display: flex;
  flex-direction: column;
}

.free-folder-container.is-floating {
  /* 悬浮窗增加边框和阴影，使其看起来像一个完整的实体窗口 */
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden; /* 统一裁剪内部内容，圆角才会生效 */
}

/* 全屏画布不需要外边框和阴影 */
.free-folder-container:not(.is-floating) {
  overflow: hidden;
}

.free-folder-drag-handle {
  /* 【关键修改】：移除 position: absolute，让它作为普通的 flex 头 */
  height: 12px;
  flex-shrink: 0; /* 保证标题栏不被压缩 */
  background: var(--color-bg-300);
  border-bottom: 1px solid var(--color-border);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.free-folder-drag-handle:active {
  cursor: grabbing;
}

.drag-indicator {
  width: 32px;
  height: 4px;
  background: var(--color-text-muted);
  border-radius: 2px;
  opacity: 0.6;
}

.free-folder-content {
  /* 主体内容占据剩余的所有空间 */
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
