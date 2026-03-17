import { TagFolderItem, FreeFolderItem, FullCanvasFreeFolderData } from '../models/PageLayout'

export type LayoutAction =
  | { type: 'CLOSE_FOLDER'; id: string }
  | { type: 'SET_ACTIVE_TAB'; id: string; tabName: string }

export const applyAction = (
  tree: (TagFolderItem | FreeFolderItem | FullCanvasFreeFolderData)[],
  action: LayoutAction
): boolean => {
  switch (action.type) {
    case 'CLOSE_FOLDER':
      return findAndRemove(tree, action.id)
    case 'SET_ACTIVE_TAB':
      return findAndSetActiveTab(tree, action.id, action.tabName)
    default:
      return false
  }
}

const findAndRemove = (
  parentData: (TagFolderItem | FreeFolderItem | FullCanvasFreeFolderData)[],
  targetId: string
): boolean => {
  const index = parentData.findIndex((item) => item.id === targetId)
  if (index !== -1) {
    const item = parentData[index]
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (item.protected === true) {
        return false
      }
    }
    parentData.splice(index, 1)
    return true
  }

  for (const item of parentData) {
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (findAndRemove(item.data, targetId)) {
        if (item.data.length === 0) {
          if (item.protected === true) {
            return true
          }
          parentData.splice(parentData.indexOf(item), 1)
        }
        return true
      }
    } else if (item.type === 'shell' || item.type === 'free-shell') {
      const content = item.data[0]
      if ('activeTabName' in content) {
        if (content.id === targetId) {
          parentData.splice(parentData.indexOf(item), 1)
          return true
        }
      } else if (content.type === 'full-free-canvas') {
        if (findAndRemove(content.data, targetId)) {
          if (content.data.length === 0) {
            if (content.protected === true) {
              return true
            }
            parentData.splice(parentData.indexOf(item), 1)
          }
          return true
        }
      }
    }
  }
  return false
}

const findAndSetActiveTab = (
  treeData: (TagFolderItem | FreeFolderItem | FullCanvasFreeFolderData)[],
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
        if (findAndSetActiveTab(content.data, targetLeafId, tabName)) return true
      }
    }
    if (item.type === 'canvas' || item.type === 'free-canvas' || item.type === 'full-free-canvas') {
      if (findAndSetActiveTab(item.data, targetLeafId, tabName)) return true
    }
  }
  return false
}
