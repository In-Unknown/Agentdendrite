// src/renderer/src/features/layout/logic/layoutCoordinator.ts
import { type Ref } from 'vue'
import * as Engine from './layoutEngine'
import * as Layout from '../models/PageLayout'
import * as LayoutUtils from '../models/LayoutUtils'

// 1. 精准关闭：根据 layerId 定位层，只在那棵树里删
export const handleCloseFolder = (
  layers: Layout.LayoutLayer[],
  id: string,
  layerId: string
): void => {
  const layer = layers.find((l) => l.id === layerId)
  if (layer) {
    // 将 root 包装成数组传给引擎，引擎会处理 root 本身或其子孙
    Engine.removeNodeFromTree([layer.root], id)
  }
}

// 2. 精准切换：根据 layerId 定位层
export const handleSetActiveTab = (
  layers: Layout.LayoutLayer[],
  id: string,
  tabName: string,
  layerId: string
): void => {
  const layer = layers.find((l) => l.id === layerId)
  if (layer) {
    Engine.setActiveTabInTree([layer.root], id, tabName)
  }
}

export const handleMoveNode = (
  layers: Layout.LayoutLayer[],
  nodeId: string,
  targetContainerId: string,
  sourceLayerId: string,
  targetLayerId: string,
  params: {
    position?: [number, number]
    size?: [number, number]
    ratio?: Layout.BrandedRatio
    index?: number
  }
): boolean => {
  const sourceLayer = layers.find((l) => l.id === sourceLayerId)
  const targetLayer = layers.find((l) => l.id === targetLayerId)

  if (!sourceLayer || !targetLayer) return false

  // 1. 提取节点
  const node = Engine.extractNodeFromTree([sourceLayer.root], nodeId)

  // 2. 类型检查：仅允许 MovableNode (Shell) 进行移动
  if (node && (node.type === 'shell' || node.type === 'free-shell')) {
    const movableNode = node as Engine.MovableNode

    // 3. 调用重构后的插入函数
    return Engine.insertNodeIntoTree([targetLayer.root], targetContainerId, movableNode, params)
  }

  console.warn(`节点 ${nodeId} 不属于可移动类型 (MovableNode)，拒绝操作`)
  return false
}

export const handleDetachShell = (
  state: { workspace: Layout.WorkspaceState; drag: Ref<Layout.ExtractOperation | null> },
  action: {
    id: string
    layerId: string
    clientX: number
    clientY: number
    width: number
    height: number
    dragOffset?: [number, number]
  }
): void => {
  const sourceLayer = state.workspace.layer.find((l) => l.id === action.layerId)

  if (sourceLayer?.isDragLayer) {
    console.warn(`节点 ${action.id} 已经在自由层，不允许再次分离`)
    return
  }

  const targetLayer = state.workspace.layer.find((l) => l.isDragLayer)
  if (!targetLayer) return

  const rootShell = targetLayer.root.data[0]
  const fullFreeCanvas = rootShell.type === 'shell' ? rootShell.data[0] : null

  if (!fullFreeCanvas || fullFreeCanvas.type !== 'full-free-canvas') {
    console.error('严重错误：拖拽层内部没有找到 full-free-canvas 容器！')
    return
  }

  const offset = action.dragOffset || [0, 0]

  const success = handleMoveNode(
    state.workspace.layer,
    action.id,
    fullFreeCanvas.id,
    action.layerId,
    targetLayer.id,
    {
      position: [action.clientX - offset[0], action.clientY - offset[1]],
      size: [action.width, action.height]
    }
  )

  if (success) {
    state.drag.value = {
      operationType: 'extract-shell',
      id: action.id,
      dragOffset: offset
    }
  }
}

export const handleDetachTab = (
  state: { workspace: Layout.WorkspaceState; drag: Ref<Layout.ExtractOperation | null> },
  action: {
    id: string
    tabName: string
    layerId: string
    clientX: number
    clientY: number
    width: number
    height: number
    dragOffset?: [number, number]
  }
): void => {
  const sourceLayer = state.workspace.layer.find((l) => l.id === action.layerId)

  if (!sourceLayer) {
    console.error(`未找到 ID 为 ${action.layerId} 的源图层`)
    return
  }

  if (sourceLayer.isDragLayer) {
    console.warn(`标签 ${action.tabName} 已经在自由层，不允许再次分离`)
    return
  }

  const targetLayer = state.workspace.layer.find((l) => l.isDragLayer)
  if (!targetLayer) return

  const rootShell = targetLayer.root.data[0]
  const fullFreeCanvas = rootShell.type === 'shell' ? rootShell.data[0] : null

  if (!fullFreeCanvas || fullFreeCanvas.type !== 'full-free-canvas') {
    console.error('严重错误：拖拽层内部没有找到 full-free-canvas 容器！')
    return
  }

  let targetLeaf: Layout.TabLeafData | null = null

  Engine.walkTree([sourceLayer.root], (node) => {
    if ('activeTabName' in node && node.id === action.id) {
      targetLeaf = node as Layout.TabLeafData
      return true
    }
  })

  if (!targetLeaf) {
    console.error(`未找到 ID 为 ${action.id} 的标签叶子节点`)
    return
  }

  const extractResult = Engine.extractTabFromLeaf(targetLeaf, action.tabName)
  if (!extractResult) {
    console.warn(`无法从叶子节点 ${action.id} 中提取标签 ${action.tabName}（可能只剩一个标签）`)
    return
  }

  const { extractedLeaf } = extractResult

  const newShellId = `shell-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  const newLeafId = `leaf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

  const newLeaf: Layout.TabLeafData = {
    ...extractedLeaf,
    id: newLeafId
  }

  const newShell: Layout.ShellTabFolderData = {
    type: 'shell',
    id: newShellId,
    ratio: LayoutUtils.makeRatio(0.2),
    data: [newLeaf]
  }

  const offset = action.dragOffset || [0, 0]

  const success = Engine.insertNodeIntoTree([targetLayer.root], fullFreeCanvas.id, newShell, {
    position: [action.clientX - offset[0], action.clientY - offset[1]],
    size: [action.width, action.height]
  })

  if (success) {
    state.drag.value = {
      operationType: 'extract-tab',
      id: newShellId,
      tabName: action.tabName,
      dragOffset: offset
    }
  }
}
