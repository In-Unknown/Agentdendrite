// src/renderer/src/features/layout/logic/layoutEngine.ts
import {
  TagFolderItem,
  FreeFolderItem,
  FullCanvasFreeFolderData,
  ShellFreeFolderData,
  TagLeafData
} from '../models/PageLayout'

export type TreeNode = TagFolderItem | FreeFolderItem | FullCanvasFreeFolderData | TagLeafData

export const setActiveTabInTree = (
  treeData: TreeNode[],
  targetLeafId: string,
  tabName: string
): boolean => {
  for (const item of treeData) {
    if (item.type === 'shell' || item.type === 'free-shell') {
      const content = item.data[0]
      if ('activeTabName' in content && content.id === targetLeafId) {
        content.activeTabName = tabName
        return true
      }
      if (!('activeTabName' in content) && content.type === 'full-free-canvas') {
        if (setActiveTabInTree(content.data as TreeNode[], targetLeafId, tabName)) return true
      }
    }
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (setActiveTabInTree(item.data as TreeNode[], targetLeafId, tabName)) return true
    }
  }
  return false
}

export const removeNodeFromTree = (treeData: TreeNode[], targetId: string): boolean => {
  const index = treeData.findIndex((node) => node.id === targetId)

  if (index !== -1) {
    const node = treeData[index]

    if (
      (node.type === 'canvas' || node.type === 'free-canvas' || node.type === 'full-free-canvas') &&
      node.protected
    ) {
      return false
    }

    treeData.splice(index, 1)
    return true
  }

  for (let i = 0; i < treeData.length; i++) {
    const item = treeData[i]

    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (removeNodeFromTree(item.data as TreeNode[], targetId)) {
        if (item.data.length === 0 && !item.protected) {
          treeData.splice(i, 1)
        }
        return true
      }
    } else if (item.type === 'shell' || item.type === 'free-shell') {
      const content = item.data[0]
      if (!content) continue

      if ('activeTabName' in content && content.id === targetId) {
        treeData.splice(i, 1)
        return true
      } else if ('type' in content && content.type === 'full-free-canvas') {
        if (removeNodeFromTree(content.data as TreeNode[], targetId)) {
          if (content.data.length === 0 && !content.protected) {
            treeData.splice(i, 1)
          }
          return true
        }
      }
    }
  }

  return false
}

export const extractNodeFromTree = (treeData: TreeNode[], targetId: string): TreeNode | null => {
  const index = treeData.findIndex((item) => item.id === targetId)
  if (index !== -1) {
    const item = treeData[index]

    if (
      (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') &&
      item.protected
    ) {
      return null
    }
    return treeData.splice(index, 1)[0]
  }

  for (let i = 0; i < treeData.length; i++) {
    const item = treeData[i]

    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      const extracted = extractNodeFromTree(item.data as TreeNode[], targetId)
      if (extracted) {
        if (item.data.length === 0 && !item.protected) {
          treeData.splice(i, 1)
        }
        return extracted
      }
    } else if (item.type === 'shell' || item.type === 'free-shell') {
      const content = item.data[0]
      if (!content) continue

      if ('activeTabName' in content && content.id === targetId) {
        return treeData.splice(i, 1)[0]
      } else if ('type' in content && content.type === 'full-free-canvas') {
        const extracted = extractNodeFromTree(content.data as TreeNode[], targetId)
        if (extracted) {
          if (content.data.length === 0 && !content.protected) {
            treeData.splice(i, 1)
          }
          return extracted
        }
      }
    }
  }
  return null
}

export const insertNodeIntoTree = (
  treeData: TreeNode[],
  targetContainerId: string,
  nodeToInsert: TreeNode,
  position?: [number, number]
): boolean => {
  for (const item of treeData) {
    if (item.id === targetContainerId) {
      if (position && (item.type === 'free-canvas' || item.type === 'full-free-canvas')) {
        const shellNode = nodeToInsert as ShellFreeFolderData
        if (shellNode.type === 'free-shell') {
          shellNode.position = position
        }
      }
      if (
        item.type === 'canvas' ||
        item.type === 'free-canvas' ||
        item.type === 'full-free-canvas'
      ) {
        ;(item.data as TreeNode[]).push(nodeToInsert)
      }
      return true
    }
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (insertNodeIntoTree(item.data as TreeNode[], targetContainerId, nodeToInsert, position))
        return true
    } else if (item.type === 'shell' || item.type === 'free-shell') {
      const content = item.data[0]
      if (content.type === 'full-free-canvas') {
        if (
          insertNodeIntoTree(content.data as TreeNode[], targetContainerId, nodeToInsert, position)
        )
          return true
      }
    }
  }
  return false
}
