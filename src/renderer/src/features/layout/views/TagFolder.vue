// src/renderer/src/features/layout/views/TagFolder.vue
<script setup lang="ts">
import { computed } from 'vue'
import type { TagFolderItem, CanvasTagFolderData } from '../models/PageLayout'
import TagPanel from './TagPanel.vue'
import FreeFolder from './FreeFolder.vue'

const props = defineProps<{
  folderData: TagFolderItem
}>()

/**
 * 核心逻辑修复：归一化比例计算
 * 当子项被删除时，totalRatio 会减小，从而让剩余项的 percentage 自动变大
 */
const normalizedChildren = computed(() => {
  if (props.folderData.type !== 'canvas') return []

  const canvas = props.folderData as CanvasTagFolderData
  const children = canvas.data

  const totalRatio = children.reduce((sum, c) => sum + (c.ratio || 0), 0)

  return children.map((child) => {
    const percentage = totalRatio > 0 ? (child.ratio / totalRatio) * 100 : 100 / children.length

    return {
      rawData: child,
      style: {
        flexBasis: `${percentage}%`,
        [canvas.direction === 'row' ? 'width' : 'height']: `${percentage}%`,
        [canvas.direction === 'row' ? 'height' : 'width']: '100%'
      }
    }
  })
})
</script>

<template>
  <div
    v-if="folderData.type === 'canvas'"
    class="tag-folder-canvas"
    :class="`is-${folderData.direction}`"
  >
    <div
      v-for="child in normalizedChildren"
      :key="child.rawData.id"
      class="tag-folder-item"
      :style="child.style"
    >
      <TagFolder :folder-data="child.rawData" />
    </div>
  </div>

  <div v-else-if="folderData.type === 'shell'" class="tag-folder-shell">
    <template v-if="folderData.data[0].type === 'full-free-canvas'">
      <FreeFolder :folder-data="folderData.data[0]" />
    </template>
    <template v-else>
      <TagPanel :leaf-data="folderData.data[0]" :folder-id="folderData.id" />
    </template>
  </div>
</template>

<style scoped>
/* 画布容器，填满分配的空间 */
.tag-folder-canvas {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 根据方向排列 */
.tag-folder-canvas.is-row {
  flex-direction: row;
}
.tag-folder-canvas.is-col {
  flex-direction: column;
}

/* 壳容器，确保内部组件（TagPanel 或 FreeFolder）能撑满比例区域 */
.tag-folder-shell {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

/* 网格项基础样式 */
.tag-folder-item {
  display: flex;
  overflow: hidden;
  /* 禁止收缩，完全遵循 ratio 分配的 flex-basis */
  flex-shrink: 0;
}
</style>
