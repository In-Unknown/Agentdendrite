<!-- src/renderer/src/components/TagFolder.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { TagFolderData, TagLeafData } from './PageLayout'
import TagPanel from './TagPanel.vue'

const props = defineProps<{
  folderData: TagFolderData
}>()

// 定义事件：通知父级删除某个 ID 的子项
const emit = defineEmits<{
  (e: 'close-folder', id: string): void
  (e: 'update:activeTabName', folderId: string, tabName: string): void
}>()

/**
 * 1. 判断当前是"叶子"还是"容器"
 */
const isLeaf = computed(() => {
  const first = props.folderData.data[0]
  // 根据数据结构约定，如果第一个元素有 activeTabName，它就是叶子节点
  return first && 'activeTabName' in first
})

/**
 * 2. 比例计算 (归一化)
 * 将 ratio 转换为百分比，用于控制子项占用的空间
 */
const normalizedChildren = computed(() => {
  if (isLeaf.value) return []

  const children = props.folderData.data as TagFolderData[]
  const totalRatio = children.reduce((sum, c) => sum + (c.ratio || 0), 0)

  return children.map((child) => {
    // 算百分比：(当前权重 / 总权重) * 100
    const percentage = totalRatio > 0 ? (child.ratio / totalRatio) * 100 : 100 / children.length

    return {
      data: child,
      style: {
        flexBasis: `${percentage}%`,
        // 确保在 Flex 布局中，子项在主轴方向占满比例，在交叉轴方向占满 100%
        [props.folderData.direction === 'row' ? 'width' : 'height']: `${percentage}%`,
        [props.folderData.direction === 'row' ? 'height' : 'width']: '100%'
      }
    }
  })
})

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
  <!-- 情况 A: 如果是叶子节点，直接渲染标签组面板 -->
  <template v-if="isLeaf">
    <TagPanel
      :leaf-data="folderData.data[0] as TagLeafData"
      @close="handleClose(folderData.id)"
      @update:active-tab-name="handleSwitchTab"
    />
  </template>

  <!-- 情况 B: 如果是容器节点，根据 direction 递归生成子文件夹 -->
  <div
    v-else-if="folderData.data.length > 0"
    class="tag-folder"
    :class="`is-${folderData.direction}`"
  >
    <div
      v-for="child in normalizedChildren"
      :key="child.data.id"
      class="tag-folder__item"
      :style="child.style"
    >
      <!-- 递归调用自身 -->
      <TagFolder
        :folder-data="child.data"
        @close-folder="handleClose"
        @update:active-tab-name="forwardSwitchTab"
      />
    </div>
  </div>
</template>

<style scoped>
.tag-folder {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 根据数据里的 direction 决定排列方式 */
.tag-folder.is-row {
  flex-direction: row;
}
.tag-folder.is-col {
  flex-direction: column;
}

.tag-folder__item {
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
}
</style>
