<script setup lang="ts">
import { reactive } from 'vue'
import TagFolder from './components/TagFolder.vue'
import type {
  CanvasTagFolderData,
  TagFolderItem,
  FreeFolderItem,
  TagLeafData
} from './components/PageLayout'

// 比例转换辅助函数
const toRatio = (val: number): CanvasTagFolderData['ratio'] => val as CanvasTagFolderData['ratio']

/**
 * 核心布局数据 (layoutData)
 * 遵循：网格画布(canvas) -> 比例壳(shell) -> 无尺寸画布(full-free-canvas) -> 自由窗口(free-shell)
 */
const layoutData = reactive<CanvasTagFolderData>({
  id: 'root-layout',
  type: 'canvas',
  direction: 'col',
  ratio: toRatio(1),
  data: [
    // 1. 顶部菜单栏 (壳)
    {
      id: 'folder-top-bar',
      type: 'shell',
      ratio: toRatio(0.04),
      data: [
        {
          id: 'leaf-top-bar',
          type: 'singleton',
          activeTabName: 'MenuBar',
          tabHeaderPosition: 'none',
          data: [{ title: '菜单栏', tabName: 'MenuBar' }]
        }
      ]
    },
    // 2. 中间主内容区 (网格画布)
    {
      id: 'folder-main-content',
      type: 'canvas',
      direction: 'row',
      ratio: toRatio(0.93),
      data: [
        // 2.1 左侧边栏 (网格画布)
        {
          id: 'folder-sidebar',
          type: 'canvas',
          direction: 'col',
          ratio: toRatio(0.2),
          data: [
            {
              id: 'shell-activity-bar',
              type: 'shell',
              ratio: toRatio(0.12),
              data: [
                {
                  id: 'activity-bar',
                  type: 'singleton',
                  activeTabName: 'Activity',
                  tabHeaderPosition: 'none',
                  data: [{ title: '活动栏', tabName: 'Activity' }]
                }
              ]
            },
            {
              id: 'shell-explorer',
              type: 'shell',
              ratio: toRatio(0.88),
              data: [
                {
                  id: 'explorer',
                  type: 'normal',
                  activeTabName: 'Explorer',
                  tabHeaderPosition: 'left',
                  data: [
                    { title: '资源管理器', tabName: 'Explorer' },
                    { title: '搜索', tabName: 'Search' }
                  ]
                }
              ]
            }
          ]
        },
        // 2.2 编辑器区域 (壳 -> 嵌入无尺寸自由画布)
        {
          id: 'shell-editor-area',
          type: 'shell',
          ratio: toRatio(0.7),
          data: [
            {
              id: 'editor-canvas',
              type: 'full-free-canvas',
              backgroundColor: '#ffffff00',
              data: [
                // 画布中的浮动窗口 1 (自由壳)
                {
                  id: 'free-win-main',
                  type: 'free-shell',
                  position: [30, 30],
                  size: [500, 400],
                  backgroundColor: '#252526',
                  data: [
                    {
                      id: 'leaf-editor-1',
                      type: 'normal',
                      activeTabName: 'App',
                      tabHeaderPosition: 'top',
                      data: [
                        { title: 'App.vue', tabName: 'App' },
                        { title: 'TagPanel.vue', tabName: 'TagPanel' }
                      ]
                    }
                  ]
                },
                // 画布中的浮动窗口 2 (自由壳)
                {
                  id: 'free-win-sub',
                  type: 'free-shell',
                  position: [400, 150],
                  size: [300, 200],
                  backgroundColor: '#2d2d2d',
                  data: [
                    {
                      id: 'leaf-editor-2',
                      type: 'normal',
                      activeTabName: 'Layout',
                      tabHeaderPosition: 'top',
                      data: [{ title: 'PageLayout.ts', tabName: 'Layout' }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        // 2.3 右侧面板 (网格画布)
        {
          id: 'folder-right-panel',
          type: 'canvas',
          direction: 'col',
          ratio: toRatio(0.1),
          data: [
            {
              id: 'shell-ai',
              type: 'shell',
              ratio: toRatio(1),
              data: [
                {
                  id: 'ai-assistant',
                  type: 'normal',
                  activeTabName: 'AiChat',
                  tabHeaderPosition: 'right',
                  data: [{ title: 'AI 辅助', tabName: 'AiChat' }]
                }
              ]
            }
          ]
        }
      ]
    },
    // 3. 底部状态栏 (壳)
    {
      id: 'folder-status-bar',
      type: 'shell',
      ratio: toRatio(0.03),
      data: [
        {
          id: 'leaf-status-bar',
          type: 'singleton',
          activeTabName: 'StatusBar',
          tabHeaderPosition: 'none',
          data: [{ title: '状态栏', tabName: 'StatusBar' }]
        }
      ]
    }
  ]
})

/**
 * 递归删除逻辑：适配 Shell 和 Canvas 结构
 */
const findAndRemove = (
  parentData: (TagFolderItem | FreeFolderItem)[],
  targetId: string
): boolean => {
  const index = parentData.findIndex((item) => item.id === targetId)
  if (index !== -1) {
    parentData.splice(index, 1)
    return true
  }

  for (const item of parentData) {
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (findAndRemove(item.data, targetId)) {
        if (item.data.length === 0) {
          const idx = parentData.indexOf(item)
          parentData.splice(idx, 1)
        }
        return true
      }
    } else if (item.type === 'shell' && item.data[0].type === 'full-free-canvas') {
      // 如果网格壳里面装的是自由画布，递归进画布
      if (findAndRemove(item.data[0].data, targetId)) return true
    }
  }
  return false
}

const handleCloseFolder = (id: string): void => {
  console.log('正在关闭 ID:', id)
  findAndRemove(layoutData.data, id)
}

/**
 * 递归查找并更新指定 ID 的 activeTabName
 */
const findAndUpdateActiveTab = (
  items: (TagFolderItem | FreeFolderItem)[],
  targetId: string,
  tabName: string
): boolean => {
  for (const item of items) {
    // 如果找到了对应的壳（网格壳或自由壳）
    if (item.id === targetId && (item.type === 'shell' || item.type === 'free-shell')) {
      const leaf = item.data[0] as TagLeafData
      leaf.activeTabName = tabName
      return true
    }

    // 递归容器
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (findAndUpdateActiveTab(item.data, targetId, tabName)) return true
    } else if (item.type === 'shell' && item.data[0].type === 'full-free-canvas') {
      if (findAndUpdateActiveTab(item.data[0].data, targetId, tabName)) return true
    }
  }
  return false
}

const handleUpdateActiveTabName = (folderId: string, tabName: string): void => {
  findAndUpdateActiveTab(layoutData.data, folderId, tabName)
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
