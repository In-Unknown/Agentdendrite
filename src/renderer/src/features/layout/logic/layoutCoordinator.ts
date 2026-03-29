// src/renderer/src/features/layout/logic/layoutCoordinator.ts
import * as Engine from './layoutEngine'
import * as Layout from '../models/PageLayout'

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

export const handleDetachNode = (
  state: Layout.WorkspaceState,
  action: {
    id: string
    layerId: string
    clientX: number
    clientY: number
    width: number
    height: number
  }
): void => {
  const targetLayer = state.layer.find((l) => l.isDragLayer)
  if (!targetLayer) return

  const rootShell = targetLayer.root.data[0]
  const fullFreeCanvas = rootShell.type === 'shell' ? rootShell.data[0] : null

  if (!fullFreeCanvas || fullFreeCanvas.type !== 'full-free-canvas') {
    console.error('严重错误：拖拽层内部没有找到 full-free-canvas 容器！')
    return
  }

  const success = handleMoveNode(
    state.layer,
    action.id,
    fullFreeCanvas.id,
    action.layerId,
    targetLayer.id,
    {
      position: [action.clientX, action.clientY],
      size: [action.width, action.height]
    }
  )

  if (success) {
    state.draggedIndex = fullFreeCanvas.data.length - 1
  }
}
