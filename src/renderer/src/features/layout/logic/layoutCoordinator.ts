// src/renderer/src/features/layout/logic/layoutCoordinator.ts
import { extractNodeFromTree, insertNodeIntoTree, TreeNode } from './layoutEngine'
import type { CanvasTagFolderData } from '../models/PageLayout'

export const handleMoveNode = (
  layers: CanvasTagFolderData[],
  nodeId: string,
  targetContainerId: string,
  position?: [number, number]
): boolean => {
  let extractedNode: TreeNode | null = null

  for (const layer of layers) {
    extractedNode = extractNodeFromTree(layer.data, nodeId)
    if (extractedNode) {
      console.log(`节点 ${nodeId} 已从层 ${layer.id} 提取`)
      break
    }
  }

  if (!extractedNode) {
    console.warn(`跨层移动失败: 找不到源节点 ${nodeId}`)
    return false
  }

  let isInserted = false
  for (const layer of layers) {
    isInserted = insertNodeIntoTree(layer.data, targetContainerId, extractedNode, position)
    if (isInserted) {
      console.log(`节点 ${nodeId} 已成功跨层移动到 ${targetContainerId}`)
      return true
    }
  }

  console.error(`跨层移动失败: 找不到目标容器 ${targetContainerId}，执行回滚/丢弃策略`)
  return false
}

export const handleMoveNodeWithFallback = (
  layers: CanvasTagFolderData[],
  nodeId: string,
  targetContainerId: string,
  fallbackContainerId: string,
  position?: [number, number]
): boolean => {
  let extractedNode: TreeNode | null = null

  for (const layer of layers) {
    extractedNode = extractNodeFromTree(layer.data, nodeId)
    if (extractedNode) break
  }

  if (!extractedNode) {
    console.warn(`跨层移动失败: 找不到源节点 ${nodeId}`)
    return false
  }

  let isInserted = insertNodeIntoTree(layers[0].data, targetContainerId, extractedNode, position)

  if (!isInserted) {
    console.warn(`目标容器 ${targetContainerId} 不存在，回滚到备用容器 ${fallbackContainerId}`)
    isInserted = insertNodeIntoTree(layers[0].data, fallbackContainerId, extractedNode, position)
  }

  return isInserted
}

export const handleSwapNodes = (
  layers: CanvasTagFolderData[],
  nodeAId: string,
  nodeBId: string
): boolean => {
  let nodeA: TreeNode | null = null
  let nodeB: TreeNode | null = null
  let nodeALayer: CanvasTagFolderData | null = null
  let nodeBLayer: CanvasTagFolderData | null = null

  for (const layer of layers) {
    if (!nodeA) {
      nodeA = extractNodeFromTree(layer.data, nodeAId)
      if (nodeA) nodeALayer = layer
    }
    if (!nodeB) {
      nodeB = extractNodeFromTree(layer.data, nodeBId)
      if (nodeB) nodeBLayer = layer
    }
    if (nodeA && nodeB) break
  }

  if (!nodeA || !nodeB) {
    console.warn(`交换节点失败: 找不到源节点 ${!nodeA ? nodeAId : nodeBId}`)
    return false
  }

  if (nodeALayer && nodeB) {
    insertNodeIntoTree(nodeALayer.data, nodeALayer.id, nodeB)
  }
  if (nodeBLayer && nodeA) {
    insertNodeIntoTree(nodeBLayer.data, nodeBLayer.id, nodeA)
  }

  console.log(`节点 ${nodeAId} 和 ${nodeBId} 交换成功`)
  return true
}

export const handleDuplicateNode = (
  layers: CanvasTagFolderData[],
  nodeId: string,
  targetContainerId: string,
  position?: [number, number]
): boolean => {
  for (const layer of layers) {
    const sourceNode = findNodeInTree(layer.data, nodeId)
    if (sourceNode) {
      const clonedNode = JSON.parse(JSON.stringify(sourceNode))
      clonedNode.id = `${nodeId}_copy_${Date.now()}`

      const isInserted = insertNodeIntoTree(layer.data, targetContainerId, clonedNode, position)
      if (isInserted) {
        console.log(`节点 ${nodeId} 已复制到 ${targetContainerId}`)
        return true
      }
    }
  }

  console.warn(`复制节点失败: 找不到源节点 ${nodeId} 或目标容器 ${targetContainerId}`)
  return false
}

const findNodeInTree = (treeData: TreeNode[], targetId: string): TreeNode | null => {
  for (const item of treeData) {
    if (item.id === targetId) {
      return item
    }
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      const found = findNodeInTree(item.data as TreeNode[], targetId)
      if (found) return found
    } else if (item.type === 'shell' || item.type === 'free-shell') {
      const content = item.data[0]
      if (content && 'type' in content && content.type === 'full-free-canvas') {
        const found = findNodeInTree(content.data as TreeNode[], targetId)
        if (found) return found
      }
    }
  }
  return null
}
