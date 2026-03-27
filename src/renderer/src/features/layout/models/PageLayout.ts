// src/renderer/src/features/layout/models/PageLayout.ts
/**
 * 1. 基础枚举与叶子定义
 */
export type LayoutDirection = 'row' | 'col'
export type TabHeaderPosition = 'top' | 'bottom' | 'left' | 'right' | 'none'
export type LeafType = 'normal' | 'placeholder' | 'singleton'

// models/PageLayout.ts

export type BrandedRatio = number & { __brand: '0-1-range' }

export function makeRatio(value: number): BrandedRatio {
  if (value < 0 || value > 1) throw new RangeError(`ratio must be 0-1, got ${value}`)
  return value as BrandedRatio
}

export interface TabData {
  title: string
  tabName: string
}

/**
 * 最小单元：标签组叶子数据 (Leaf)
 * 仅包含实际业务标签的数据
 */
export interface TabLeafData {
  id: string
  type: LeafType
  activeTabName: string
  tabHeaderPosition: TabHeaderPosition
  data: TabData[]
}

// ==========================================================
// 2. 普通标签组系统 (网格/列表布局)
// ==========================================================

/**
 * 标签组网格项联合类型 (TabFolderItem)
 * 允许在网格数组中混装“壳”与“画布”
 */
export type TabFolderItem = ShellTabFolderData | CanvasTabFolderData

/**
 * 标签组容器壳 (Shell)
 * 作用：网格占位符，持有比例 (ratio)。
 * 它的内容是单一的：要么是标签组叶子，要么是无尺寸自由画布。
 */
export interface ShellTabFolderData {
  type: 'shell'
  id: string
  ratio: BrandedRatio
  data: [TabLeafData] | [FullCanvasFreeFolderData]
}

/**
 * 画布标签组容器 (Canvas)
 * 作用：管理多个网格项（壳或子画布）的排列方向。
 */
export interface CanvasTabFolderData {
  type: 'canvas'
  id: string
  ratio: BrandedRatio
  direction: LayoutDirection
  data: TabFolderItem[]
  protected?: boolean
}

// ==========================================================
// 3. 自由标签组系统 (浮动布局)
// ==========================================================

/**
 * 自由项联合类型 (FreeFolderItem)
 * 仅允许在自由画布数组中嵌套"自由壳"与"有尺寸的自由画布"
 */
export type FreeFolderItem = ShellFreeFolderData | CanvasFreeFolderData

/**
 * 自由标签组容器壳 (Free Shell)
 * 作用：给标签组施加具体的 坐标 (position) 和 尺寸 (size)
 */
export interface ShellFreeFolderData {
  type: 'free-shell'
  id: string
  position: [number, number]
  size: [number, number]
  zIndex: number
  backgroundColor: string
  data: [TabLeafData]
}

/**
 * 有尺寸的画布自由标签组容器 (Free Canvas)
 * 作用：在自由容器内嵌套一个带位置和大小限制的排版区域
 */
export interface CanvasFreeFolderData {
  type: 'free-canvas'
  id: string
  position: [number, number]
  size: [number, number]
  zIndex: number
  backgroundColor: string
  data: FreeFolderItem[]
  protected?: boolean
}

/**
 * 无尺寸画布自由标签组容器 (Full Free Canvas)
 * 作用：字面意义上的无尺寸画布，默认填满父空间（如填满 Shell 或上级画布）
 */
export interface FullCanvasFreeFolderData {
  type: 'full-free-canvas'
  id: string
  backgroundColor: string
  data: FreeFolderItem[]
  protected?: boolean
}

// 新增层的包装类型
export interface LayoutLayer {
  id: string
  root: CanvasTabFolderData | FullCanvasFreeFolderData
  isDragLayer: boolean
}

export function shellToFreeShell(
  node: ShellTabFolderData,
  position: [number, number],
  size: [number, number],
  backgroundColor = '#ffffff'
): ShellFreeFolderData | null {
  const leaf = node.data[0]
  if (!('activeTabName' in leaf)) return null
  return {
    type: 'free-shell',
    id: node.id,
    position,
    size,
    zIndex: 999,
    backgroundColor,
    data: [leaf]
  }
}

export function freeShellToShell(
  node: ShellFreeFolderData,
  ratio: BrandedRatio
): ShellTabFolderData {
  return {
    type: 'shell',
    id: node.id,
    ratio,
    data: node.data
  }
}
