<script setup lang="ts">
import { computed } from 'vue' // 必须导入 computed
import type { TagFolderItem, CanvasTagFolderData } from './PageLayout'
import TagPanel from './TagPanel.vue'
import FreeFolder from './FreeFolder.vue'

const props = defineProps<{
  folderData: TagFolderItem
}>()

const emit = defineEmits<{
  (e: 'close-folder', id: string): void
  (e: 'update:activeTabName', folderId: string, tabName: string): void
}>()

/**
 * 核心逻辑修复：归一化比例计算
 * 当子项被删除时，totalRatio 会减小，从而让剩余项的 percentage 自动变大
 */
const normalizedChildren = computed(() => {
  // 只有画布类型（Canvas）才需要计算子项比例
  if (props.folderData.type !== 'canvas') return []

  const canvas = props.folderData as CanvasTagFolderData
  const children = canvas.data

  // 计算当前层级所有子项的总权重
  const totalRatio = children.reduce((sum, c) => sum + (c.ratio || 0), 0)

  return children.map((child) => {
    // 计算百分比：(当前权重 / 总权重) * 100
    const percentage = totalRatio > 0 ? (child.ratio / totalRatio) * 100 : 100 / children.length

    return {
      rawData: child,
      style: {
        // 使用 flex-basis 配合百分比实现动态占据空间
        flexBasis: `${percentage}%`,
        // 根据排列方向，强制锁定主轴尺寸
        [canvas.direction === 'row' ? 'width' : 'height']: `${percentage}%`,
        // 交叉轴永远占满
        [canvas.direction === 'row' ? 'height' : 'width']: '100%'
      }
    }
  })
})

// ===================== 事件转发 =====================

const handleClose = (id: string): void => {
  emit('close-folder', id)
}

const handleUpdateActiveTabName = (folderId: string, tabName: string): void => {
  emit('update:activeTabName', folderId, tabName)
}

// 用于网格递归时的事件向上透传
const forwardSwitchTab = (folderId: string, tabName: string): void => {
  emit('update:activeTabName', folderId, tabName)
}
</script>

<template>
  <!-- 情况 1: 画布标签组容器 (Canvas) -->
  <!-- 负责通过 flex-direction 排列内部的“壳”或“子画布” -->
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
      <!-- 递归调用自身 -->
      <TagFolder
        :folder-data="child.rawData"
        @close-folder="handleClose"
        @update:active-tab-name="forwardSwitchTab"
      />
    </div>
  </div>

  <!-- 情况 2: 标签组容器壳 (Shell) -->
  <!-- 壳本身不负责排版，它只是内容的包装器，持有着父级分配的比例 -->
  <div v-else-if="folderData.type === 'shell'" class="tag-folder-shell">
    <!-- 2.1 壳内是：无尺寸自由画布 (Full Free Canvas) -->
    <template v-if="folderData.data[0].type === 'full-free-canvas'">
      <FreeFolder
        :folder-data="folderData.data[0]"
        @close-folder="handleClose"
        @update:active-tab-name="forwardSwitchTab"
      />
    </template>

    <!-- 2.2 壳内是：普通的标签组叶子 (TagLeafData) -->
    <template v-else>
      <!-- 注意：这里将 shell 的 ID 传给 handleClose，因为它是布局树中的删除单元 -->
      <TagPanel
        :leaf-data="folderData.data[0]"
        @close="handleClose(folderData.id)"
        @update:active-tab-name="(tabName) => handleUpdateActiveTabName(folderData.id, tabName)"
      />
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
