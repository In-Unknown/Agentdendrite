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
  const DEFAULT_WEIGHT = 0.2

  // 1. 计算总权重
  const totalWeight = children.reduce((sum, c) => sum + (c.ratio || DEFAULT_WEIGHT), 0)

  return children.map((child) => {
    // 2. 计算百分比
    const r = child.ratio || DEFAULT_WEIGHT
    const percentage = (r / totalWeight) * 100

    return {
      id: child.id,
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
    <template v-if="folderData.data[0]">
      <!-- 1. 判断是全屏自由画布 -->
      <template v-if="folderData.data[0].type === 'full-free-canvas'">
        <FreeFolder :folder-data="folderData.data[0]" />
      </template>

      <!-- 2. 判断是普通标签页 -->
      <template v-else>
        <TagPanel :leaf-data="folderData.data[0] as any" :folder-id="folderData.id" />
      </template>
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
