<script setup lang="ts">
import { computed } from 'vue'
import type { FreeFolderItem } from './PageLayout'
import TagPanel from './TagPanel.vue'

// 这里的 folderData 对应你定义中的 FreeFolderItem (三种自由项的联合)
const props = defineProps<{
  folderData: FreeFolderItem
}>()

const emit = defineEmits<{
  (e: 'close-folder', id: string): void
  (e: 'update:activeTabName', folderId: string, tabName: string): void
}>()

/**
 * 样式计算逻辑：
 * 1. full-free-canvas: 无尺寸画布，相对定位，铺满 100%
 * 2. free-shell & free-canvas: 有尺寸和位置，绝对定位，使用 px
 */
const containerStyle = computed(() => {
  const item = props.folderData
  const style: Record<string, string> = {
    backgroundColor: item.backgroundColor || 'transparent'
  }

  if (item.type === 'full-free-canvas') {
    // 无尺寸画布逻辑：填满父级提供的空间 (Shell 提供或上级 Canvas 提供)
    style.width = '100%'
    style.height = '100%'
    style.position = 'relative'
  } else {
    // 自由壳 或 有尺寸画布逻辑：根据数据设定的坐标和大小定位
    style.width = `${item.size[0]}px`
    style.height = `${item.size[1]}px`
    style.left = `${item.position[0]}px`
    style.top = `${item.position[1]}px`
    style.position = 'absolute'
  }

  return style
})

// ===================== 事件转发 =====================

const handleClose = (id: string): void => {
  emit('close-folder', id)
}

const handleSwitchTab = (tabName: string): void => {
  emit('update:activeTabName', props.folderData.id, tabName)
}

const forwardSwitchTab = (folderId: string, tabName: string): void => {
  emit('update:activeTabName', folderId, tabName)
}
</script>

<template>
  <div class="free-folder-container" :style="containerStyle">
    <!-- 情况 1: 自由标签组容器壳 (free-shell) -->
    <!-- 直接渲染内部唯一的标签组叶子节点 -->
    <template v-if="folderData.type === 'free-shell'">
      <TagPanel
        :leaf-data="folderData.data[0]"
        @close="handleClose(folderData.id)"
        @update:active-tab-name="handleSwitchTab"
      />
    </template>

    <!-- 情况 2: 画布 (free-canvas 或 full-free-canvas) -->
    <!-- 遍历 data 数组，递归渲染内部的 Shell 或嵌套 Canvas -->
    <template v-else>
      <FreeFolder
        v-for="child in folderData.data"
        :key="child.id"
        :folder-data="child"
        @close-folder="handleClose"
        @update:active-tab-name="forwardSwitchTab"
      />
    </template>
  </div>
</template>

<style scoped>
.free-folder-container {
  /* 基础容器样式 */
  overflow: hidden;
  box-sizing: border-box;
  display: flex; /* 确保内部 Shell 或 Canvas 能正常撑开 */
}
</style>
