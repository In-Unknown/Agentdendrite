<!-- src/renderer/src/App.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import TagFolder from './components/TagFolder.vue'
import type { TagFolderData, TagLeafData } from './components/PageLayout'

const toRatio = (val: number): TagFolderData['ratio'] => val as TagFolderData['ratio']

const asLeafData = (leaf: TagLeafData): [TagLeafData] => [leaf]

const layoutData = reactive<TagFolderData>({
  id: 'root-layout',
  direction: 'col',
  ratio: toRatio(1),
  data: [
    {
      id: 'folder-top-bar',
      direction: 'row',
      ratio: toRatio(0.04),
      data: asLeafData({
        id: 'leaf-top-bar',
        type: 'singleton',
        activeTabName: 'MenuBar',
        tabHeaderPosition: 'none',
        data: [{ title: '菜单栏', tabName: 'MenuBar' }]
      })
    },
    {
      id: 'folder-main-content',
      direction: 'row',
      ratio: toRatio(0.96),
      data: [
        {
          id: 'folder-sidebar',
          direction: 'col',
          ratio: toRatio(0.2),
          data: [
            {
              id: 'leaf-activity-bar',
              direction: 'row',
              ratio: toRatio(0.12),
              data: asLeafData({
                id: 'activity-bar',
                type: 'singleton',
                activeTabName: 'Activity',
                tabHeaderPosition: 'none',
                data: [{ title: '活动栏', tabName: 'Activity' }]
              })
            },
            {
              id: 'leaf-explorer',
              direction: 'row',
              ratio: toRatio(0.88),
              data: asLeafData({
                id: 'explorer',
                type: 'normal',
                activeTabName: 'Explorer',
                tabHeaderPosition: 'left',
                data: [
                  { title: '资源管理器', tabName: 'Explorer' },
                  { title: '搜索', tabName: 'Search' },
                  { title: '源代码管理', tabName: 'Git' },
                  { title: 'AiChat.vue', tabName: 'AiChat' },
                  { title: '调试', tabName: 'Debug' }
                ]
              })
            }
          ]
        },
        {
          id: 'folder-editor-area',
          direction: 'col',
          ratio: toRatio(0.7),
          data: [
            {
              id: 'leaf-editor-tabs',
              direction: 'row',
              ratio: toRatio(0.9),
              data: asLeafData({
                id: 'editor-tabs',
                type: 'normal',
                activeTabName: 'App',
                tabHeaderPosition: 'top',
                data: [
                  { title: 'App.vue', tabName: 'App' },
                  { title: 'TagPanel.vue', tabName: 'TagPanel' },
                  { title: 'PageLayout.ts', tabName: 'Layout' },
                  { title: 'AiChat.vue', tabName: 'AiChat' },
                  { title: 'package.json', tabName: 'Package' }
                ]
              })
            },
            {
              id: 'leaf-bottom-panel',
              direction: 'row',
              ratio: toRatio(0.1),
              data: asLeafData({
                id: 'bottom-panel',
                type: 'normal',
                activeTabName: 'Terminal',
                tabHeaderPosition: 'bottom',
                data: [
                  { title: '终端', tabName: 'Terminal' },
                  { title: '输出', tabName: 'Output' },
                  { title: '问题', tabName: 'Problems' },
                  { title: '调试控制台', tabName: 'DebugConsole' }
                ]
              })
            }
          ]
        },
        {
          id: 'folder-right-panel',
          direction: 'col',
          ratio: toRatio(0.1),
          data: [
            {
              id: 'leaf-ai-assistant',
              direction: 'row',
              ratio: toRatio(0.5),
              data: asLeafData({
                id: 'ai-assistant',
                type: 'normal',
                activeTabName: 'AI',
                tabHeaderPosition: 'right',
                data: [
                  { title: 'AI 辅助', tabName: 'AI' },
                  { title: '聊天历史', tabName: 'History' }
                ]
              })
            },
            {
              id: 'leaf-outline',
              direction: 'row',
              ratio: toRatio(0.5),
              data: asLeafData({
                id: 'outline',
                type: 'normal',
                activeTabName: 'Outline',
                tabHeaderPosition: 'right',
                data: [
                  { title: '大纲', tabName: 'Outline' },
                  { title: '时间线', tabName: 'Timeline' }
                ]
              })
            }
          ]
        }
      ]
    },
    {
      id: 'folder-status-bar',
      direction: 'row',
      ratio: toRatio(0.03),
      data: asLeafData({
        id: 'leaf-status-bar',
        type: 'singleton',
        activeTabName: 'StatusBar',
        tabHeaderPosition: 'none',
        data: [{ title: '状态栏', tabName: 'StatusBar' }]
      })
    }
  ]
})

/**
 * 递归删除逻辑：并在删除后检查父节点是否为空
 */
const findAndRemove = (parent: TagFolderData, targetId: string): boolean => {
  const children = parent.data as TagFolderData[]
  const index = children.findIndex((item) => item.id === targetId)

  if (index !== -1) {
    // 1. 执行删除
    children.splice(index, 1)
    // 2. 删除后，不需要额外操作，Vue 的响应式会处理
    return true
  }

  // 如果当前层没找到，递归进子层找
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // 只有容器节点（没有 activeTabName）才需要继续递归
    const firstData = child.data[0]
    const isChildContainer = firstData && !('activeTabName' in firstData)

    if (isChildContainer) {
      if (findAndRemove(child, targetId)) {
        // --- 核心修复逻辑 ---
        // 如果子节点返回 true（说明在其内部删除了东西）
        // 检查这个子节点现在是否变空了
        if (child.data.length === 0) {
          // 如果子节点空了，把子节点也从当前父节点中删掉
          children.splice(i, 1)
        }
        return true
      }
    }
  }
  return false
}

const handleCloseFolder = (id: string): void => {
  console.log('正在关闭窗口 ID:', id)
  findAndRemove(layoutData, id)
  console.log('关闭后:', layoutData)
}

/**
 * 递归查找并更新指定 folderId 的 activeTabName
 */
const findAndUpdateActiveTab = (
  folder: TagFolderData,
  targetFolderId: string,
  tabName: string
): boolean => {
  const firstData = folder.data[0]
  const isLeaf = firstData && 'activeTabName' in firstData

  if (folder.id === targetFolderId) {
    if (isLeaf) {
      firstData.activeTabName = tabName
      return true
    }
    console.warn('目标 folderId 对应的是容器节点，没有 activeTabName:', targetFolderId)
    return false
  }

  if (!isLeaf) {
    const children = folder.data as TagFolderData[]
    for (const child of children) {
      if (findAndUpdateActiveTab(child, targetFolderId, tabName)) {
        return true
      }
    }
  }

  return false
}

const handleUpdateActiveTabName = (folderId: string, tabName: string): void => {
  console.log('切换标签:', folderId, '→', tabName)
  findAndUpdateActiveTab(layoutData, folderId, tabName)
}
</script>

<template>
  <div class="app-container">
    <TagFolder
      :folder-data="layoutData"
      @close-folder="handleCloseFolder"
      @update:active-tab-name="handleUpdateActiveTabName"
    />
  </div>
</template>

<style>
/* 基础样式重置，确保铺满全屏 */
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  padding: 6px;
}
</style>
