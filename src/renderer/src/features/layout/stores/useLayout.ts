// src/renderer/src/features/layout/stores/useLayout.ts
import { reactive } from 'vue'
import type { CanvasTabFolderData, LayoutLayer, WorkspaceState } from '../models/PageLayout'
import { LayoutAction, dispatchAction } from '../logic/layoutActions'

const toRatio = (val: number): CanvasTabFolderData['ratio'] => val as CanvasTabFolderData['ratio']

// 【新增：扩展全局 Window 接口】
declare global {
  interface Window {
    __LAYOUT_STORE__: {
      dispatch: typeof dispatch
      layoutLayers: typeof layoutLayers
      workspaceState: typeof workspaceState
      makeRatio: (v: number) => number
    }
  }
}

export const layoutData = reactive<CanvasTabFolderData>({
  id: 'root-layout',
  type: 'canvas',
  direction: 'col',
  ratio: toRatio(1),
  data: [
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
    {
      id: 'folder-main-content',
      type: 'canvas',
      direction: 'row',
      ratio: toRatio(0.93),
      data: [
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
        {
          id: 'shell-editor-area',
          type: 'shell',
          ratio: toRatio(0.7),
          data: [
            {
              id: 'editor-canvas',
              type: 'full-free-canvas',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              data: [
                {
                  id: 'free-win-main',
                  type: 'free-shell',
                  position: [30, 30],
                  size: [500, 400],
                  zIndex: 1,
                  backgroundColor: '#252526',
                  data: [
                    {
                      id: 'leaf-editor-1',
                      type: 'normal',
                      activeTabName: 'App',
                      tabHeaderPosition: 'top',
                      data: [
                        { title: 'App.vue', tabName: 'App' },
                        { title: 'TabPanel.vue', tabName: 'TabPanel' }
                      ]
                    }
                  ]
                },
                {
                  id: 'free-win-sub',
                  type: 'free-shell',
                  position: [400, 150],
                  size: [300, 200],
                  zIndex: 2,
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
                },
                {
                  id: 'free-canvas-container',
                  type: 'free-canvas',
                  position: [100, 300],
                  size: [400, 250],
                  zIndex: 3,
                  backgroundColor: '#1e1e1e',
                  data: [
                    {
                      id: 'free-shell-in-canvas-1',
                      type: 'free-shell',
                      position: [20, 20],
                      size: [150, 100],
                      zIndex: 1,
                      backgroundColor: '#333333',
                      data: [
                        {
                          id: 'leaf-canvas-1',
                          type: 'normal',
                          activeTabName: 'Component',
                          tabHeaderPosition: 'top',
                          data: [{ title: 'Component.vue', tabName: 'Component' }]
                        }
                      ]
                    },
                    {
                      id: 'free-shell-in-canvas-2',
                      type: 'free-shell',
                      position: [200, 30],
                      size: [160, 120],
                      zIndex: 2,
                      backgroundColor: '#3c3c3c',
                      data: [
                        {
                          id: 'leaf-canvas-2',
                          type: 'normal',
                          activeTabName: 'Utils',
                          tabHeaderPosition: 'top',
                          data: [{ title: 'Utils.ts', tabName: 'Utils' }]
                        }
                      ]
                    }
                  ]
                },
                {
                  id: 'free-win-floating',
                  type: 'free-shell',
                  position: [550, 50],
                  size: [280, 180],
                  zIndex: 4,
                  backgroundColor: '#252526',
                  data: [
                    {
                      id: 'leaf-floating',
                      type: 'normal',
                      activeTabName: 'Console',
                      tabHeaderPosition: 'top',
                      data: [{ title: '控制台', tabName: 'Console' }]
                    }
                  ]
                },
                {
                  id: 'free-shell-preview',
                  type: 'free-shell',
                  position: [350, 250],
                  size: [200, 150],
                  zIndex: 5,
                  backgroundColor: '#2d2d2d',
                  data: [
                    {
                      id: 'leaf-preview',
                      type: 'normal',
                      activeTabName: 'Preview',
                      tabHeaderPosition: 'top',
                      data: [{ title: '预览', tabName: 'Preview' }]
                    }
                  ]
                }
              ]
            }
          ]
        },
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

export const topLayoutData = reactive<CanvasTabFolderData>({
  id: 'top-root',
  type: 'canvas',
  direction: 'col',
  ratio: toRatio(1),
  data: [
    {
      id: 'top-full-shell',
      type: 'shell',
      ratio: toRatio(1),
      data: [
        {
          id: 'top-canvas-container',
          type: 'full-free-canvas',
          backgroundColor: 'transparent',
          data: [
            {
              id: 'top-float-win-1',
              type: 'free-shell',
              position: [100, 50],
              size: [350, 250],
              zIndex: 1,
              backgroundColor: 'rgba(37, 37, 38, 0.95)',
              data: [
                {
                  id: 'top-leaf-1',
                  type: 'normal',
                  activeTabName: 'QuickActions',
                  tabHeaderPosition: 'top',
                  data: [
                    { title: '快速操作', tabName: 'QuickActions' },
                    { title: '快捷键', tabName: 'Shortcuts' }
                  ]
                }
              ]
            },
            {
              id: 'top-float-win-2',
              type: 'free-shell',
              position: [500, 80],
              size: [400, 300],
              zIndex: 2,
              backgroundColor: 'rgba(45, 45, 46, 0.95)',
              data: [
                {
                  id: 'top-leaf-2',
                  type: 'normal',
                  activeTabName: 'Notifications',
                  tabHeaderPosition: 'top',
                  data: [
                    { title: '通知中心', tabName: 'Notifications' },
                    { title: '日志', tabName: 'Logs' }
                  ]
                }
              ]
            },
            {
              id: 'top-float-win-3',
              type: 'free-shell',
              position: [920, 120],
              size: [280, 200],
              zIndex: 3,
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              data: [
                {
                  id: 'top-leaf-3',
                  type: 'singleton',
                  activeTabName: 'Clock',
                  tabHeaderPosition: 'none',
                  data: [{ title: '时钟', tabName: 'Clock' }]
                }
              ]
            }
          ],
          protected: true
        }
      ]
    }
  ]
})

export const layoutLayers = reactive<LayoutLayer[]>([
  {
    id: 'top-layer',
    root: topLayoutData,
    isDragLayer: true // 标记顶层为挂起层
  },
  {
    id: 'main-layer',
    root: layoutData,
    isDragLayer: false
  }
])

export const workspaceState = reactive<WorkspaceState>({
  id: 'main-workspace',
  layer: layoutLayers,
  draggedIndex: -1
})

export const dispatch = (action: LayoutAction): void => {
  dispatchAction(workspaceState, action)
}

if (import.meta.env.DEV) {
  window.__LAYOUT_STORE__ = {
    dispatch,
    layoutLayers,
    workspaceState,
    makeRatio: (v: number) => v
  }
  console.log('🛠️ 布局测试 API 已挂载到 window.__LAYOUT_STORE__')
}
