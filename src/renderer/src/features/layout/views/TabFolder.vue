// src/renderer/src/features/layout/views/TabFolder.vue
<script setup lang="ts">
import { computed } from 'vue'
import type { TabFolderItem, CanvasTabFolderData } from '../models/PageLayout'
import TabPanel from './TabPanel.vue'
import FreeFolder from './FreeFolder.vue'

const props = defineProps<{
  folderData: TabFolderItem
}>()

/**
 * 核心逻辑修复：归一化比例计算
 * 当子项被删除时，totalRatio 会减小，从而让剩余项的 percenTabe 自动变大
 */
const normalizedChildren = computed(() => {
  if (props.folderData.type !== 'canvas') return []
  const canvas = props.folderData as CanvasTabFolderData

  const children = canvas.data
  const DEFAULT_WEIGHT = 0.2

  // 1. 计算总权重
  const totalWeight = children.reduce((sum, c) => sum + (c.ratio || DEFAULT_WEIGHT), 0)

  return children.map((child) => {
    // 2. 计算百分比
    const r = child.ratio || DEFAULT_WEIGHT
    const percenTabe = (r / totalWeight) * 100

    return {
      id: child.id,
      rawData: child,
      style: {
        flexBasis: `${percenTabe}%`,
        [canvas.direction === 'row' ? 'width' : 'height']: `${percenTabe}%`,
        [canvas.direction === 'row' ? 'height' : 'width']: '100%'
      }
    }
  })
})
</script>

<template>
  <div
    v-if="folderData.type === 'canvas'"
    class="Tab-folder-canvas"
    :class="`is-${folderData.direction}`"
    :data-container-id="folderData.id"
  >
    <div
      v-for="child in normalizedChildren"
      :key="child.rawData.id"
      class="Tab-folder-item"
      :style="child.style"
    >
      <TabFolder :folder-data="child.rawData" />
    </div>
  </div>
  <div v-else-if="folderData.type === 'shell'" class="Tab-folder-shell">
    <template v-if="folderData.data[0]">
      <!-- 1. 判断是全屏自由画布 -->
      <template v-if="folderData.data[0].type === 'full-free-canvas'">
        <FreeFolder :folder-data="folderData.data[0]" />
      </template>

      <!-- 2. 判断是普通标签页 -->
      <template v-else>
        <TabPanel :leaf-data="folderData.data[0] as any" :folder-id="folderData.id" />
      </template>
    </template>
  </div>
</template>

<style scoped>
/* 画布容器，填满分配的空间 */
.Tab-folder-canvas {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 根据方向排列 */
.Tab-folder-canvas.is-row {
  flex-direction: row;
}
.Tab-folder-canvas.is-col {
  flex-direction: column;
}

/* 壳容器，确保内部组件（TabPanel 或 FreeFolder）能撑满比例区域 */
.Tab-folder-shell {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

/* 网格项基础样式 */
.Tab-folder-item {
  display: flex;
  overflow: hidden;
  /* 禁止收缩，完全遵循 ratio 分配的 flex-basis */
  flex-shrink: 0;
}
</style>
