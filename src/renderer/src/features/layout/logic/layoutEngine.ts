// src/renderer/src/features/layout/logic/layoutEngine.ts
import * as Layout from '../models/PageLayout'
import * as LayoutUtils from '../models/LayoutUtils'

export type TreeNode =
  | Layout.TabFolderItem
  | Layout.FreeFolderItem
  | Layout.FullCanvasFreeFolderData
  | Layout.TabLeafData

export type MovableNode = Layout.ShellTabFolderData | Layout.ShellFreeFolderData

type Visitor = (node: TreeNode, parent: TreeNode[], index: number) => boolean | void

export const walkTree = (
  treeData: TreeNode[],
  visitor: Visitor,
  // 初始调用时，parent 就是 treeData 自身
  parent: TreeNode[] = treeData
): boolean => {
  for (let i = 0; i < treeData.length; i++) {
    const node = treeData[i]

    // 这里的 parent 正确指向了包含当前 node 的数组
    if (visitor(node, parent, i) === true) return true

    if ('data' in node && Array.isArray(node.data) && node.data.length > 0) {
      // 【关键修改】：递归进入子树时，子树的 parent 数组就是 node.data
      if (walkTree(node.data as TreeNode[], visitor, node.data as TreeNode[])) return true
    }
  }
  return false
}

const isProtectedContainer = (node: TreeNode): boolean => {
  return (
    (node.type === 'canvas' || node.type === 'free-canvas' || node.type === 'full-free-canvas') &&
    !!node.protected
  )
}

const pruneEmptyContainers = (treeData: TreeNode[]): void => {
  for (let i = treeData.length - 1; i >= 0; i--) {
    const node = treeData[i]
    if ('data' in node && Array.isArray(node.data)) {
      pruneEmptyContainers(node.data as TreeNode[])
      if (node.data.length === 0 && !isProtectedContainer(node)) {
        treeData.splice(i, 1)
      }
    }
  }
}

export const setActiveTabInTree = (
  treeData: TreeNode[],
  targetLeafId: string,
  tabName: string
): boolean => {
  return walkTree(treeData, (node) => {
    if ('activeTabName' in node && node.id === targetLeafId) {
      node.activeTabName = tabName
      return true
    }
  })
}

export const removeNodeFromTree = (treeData: TreeNode[], targetId: string): boolean => {
  let removed = false

  walkTree(treeData, (node, parent, index) => {
    if (node.id !== targetId) return
    if (isProtectedContainer(node)) return true

    parent!.splice(index, 1)
    removed = true
    return true
  })

  if (removed) pruneEmptyContainers(treeData)
  return removed
}

export const extractNodeFromTree = (treeData: TreeNode[], targetId: string): TreeNode | null => {
  let extracted: TreeNode | null = null

  walkTree(treeData, (node, parent, index) => {
    if (node.id !== targetId) return
    if (isProtectedContainer(node)) return true

    extracted = parent!.splice(index, 1)[0]
    return true
  })

  if (extracted) pruneEmptyContainers(treeData)
  return extracted
}

/**
 * 将节点插入目标容器，并根据目标容器的物理法则自动转换节点属性
 * @param treeData 当前递归的树数据
 * @param targetContainerId 目标容器 ID
 * @param nodeToInsert 被移动的节点
 * @param params 转换所需的物理属性（由调用者计算并提供）
 */
export const insertNodeIntoTree = (
  treeData: TreeNode[],
  targetContainerId: string,
  nodeToInsert: MovableNode,
  params?: {
    position?: [number, number]
    size?: [number, number]
    ratio?: Layout.BrandedRatio
    zIndex?: number
    backgroundColor?: string
    index?: number
  }
): boolean => {
  return walkTree(treeData, (node) => {
    // 1. 寻找目标容器
    if (node.id !== targetContainerId) return
    if (!('data' in node) || !Array.isArray(node.data)) return

    let finalNode: MovableNode

    // --- A. 目标是自由层容器 ---
    if (node.type === 'free-canvas' || node.type === 'full-free-canvas') {
      if (nodeToInsert.type === 'shell') {
        // 【调用你准备的转换函数】
        const converted = LayoutUtils.shellToFreeShell(
          nodeToInsert,
          params?.position ?? [0, 0],
          params?.size ?? [300, 200],
          params?.backgroundColor // 这里使用了你函数中的默认参数逻辑
        )
        if (!converted) return true // 内部数据不匹配，中止操作

        finalNode = converted
        // 由于你的 shellToFreeShell 内部硬编码了 zIndex: 999，
        // 我们可以在这里根据 params 覆盖它，实现“调用者提供”的原则
        if (params?.zIndex !== undefined) finalNode.zIndex = params.zIndex
      } else {
        // 本身就是自由壳，直接应用新参数
        if (params?.position) nodeToInsert.position = params.position
        if (params?.size) nodeToInsert.size = params.size
        if (params?.zIndex !== undefined) nodeToInsert.zIndex = params.zIndex
        if (params?.backgroundColor) nodeToInsert.backgroundColor = params.backgroundColor
        finalNode = nodeToInsert
      }
    }

    // --- B. 目标是普通网格容器 ---
    else if (node.type === 'canvas') {
      if (nodeToInsert.type === 'free-shell') {
        // 【调用你准备的转换函数】
        finalNode = LayoutUtils.freeShellToShell(
          nodeToInsert,
          params?.ratio ?? LayoutUtils.makeRatio(0.2)
        )
      } else {
        // 本身就是网格壳，直接更新比例
        if (params?.ratio) nodeToInsert.ratio = params.ratio
        finalNode = nodeToInsert
      }
    } else {
      return
    }

    // --- 【核心修改】：实现索引插入 ---
    const targetArray = node.data as TreeNode[]

    // 如果指定了有效索引则插入到对应位置，否则默认追加到末尾
    if (params?.index !== undefined && params.index >= 0 && params.index <= targetArray.length) {
      targetArray.splice(params.index, 0, finalNode)
    } else {
      targetArray.push(finalNode)
    }

    return true
  })
}

/**
 * 从TabLeafData中提取指定标签，创建新的TabLeafData
 * @param leaf 原始标签叶子节点
 * @param tabName 要提取的标签名称
 * @returns 提取结果：包含新的leaf和被移除的tab，如果原leaf只剩一个标签则返回null
 */
export const extractTabFromLeaf = (
  leaf: Layout.TabLeafData,
  tabName: string
): { extractedLeaf: Layout.TabLeafData; removedTab: Layout.TabData } | null => {
  if (leaf.data.length <= 1) {
    return null
  }

  const tabIndex = leaf.data.findIndex((t) => t.tabName === tabName)
  if (tabIndex === -1) {
    console.warn(`标签 ${tabName} 不存在于叶子节点 ${leaf.id} 中`)
    return null
  }

  const removedTab = leaf.data[tabIndex]

  const newLeafData: Layout.TabData[] = leaf.data.filter((t) => t.tabName !== tabName)

  const extractedLeaf: Layout.TabLeafData = {
    id: leaf.id,
    type: 'normal',
    activeTabName: removedTab.tabName,
    tabHeaderPosition: leaf.tabHeaderPosition,
    data: [removedTab]
  }

  leaf.data = newLeafData

  if (!leaf.data.some((t) => t.tabName === leaf.activeTabName)) {
    leaf.activeTabName = leaf.data[0].tabName
  }

  return { extractedLeaf, removedTab }
}
