// src/renderer/src/features/layout/models/PageLayout.ts
/**
 * 1. 基础枚举与叶子定义
 */
export type LayoutDirection = 'row' | 'col'
export type TabHeaderPosition = 'top' | 'bottom' | 'left' | 'right' | 'none'
export type LeafType = 'normal' | 'placeholder' | 'singleton'

export interface TagData {
  title: string
  tabName: string
}

/**
 * 最小单元：标签组叶子数据 (Leaf)
 * 仅包含实际业务标签的数据
 */
export interface TagLeafData {
  id: string
  type: LeafType
  activeTabName: string
  tabHeaderPosition: TabHeaderPosition
  data: TagData[]
}

// ==========================================================
// 2. 普通标签组系统 (网格/列表布局)
// ==========================================================

/**
 * 标签组网格项联合类型 (TagFolderItem)
 * 允许在网格数组中混装“壳”与“画布”
 */
export type TagFolderItem = ShellTagFolderData | CanvasTagFolderData

/**
 * 标签组容器壳 (Shell)
 * 作用：网格占位符，持有比例 (ratio)。
 * 它的内容是单一的：要么是标签组叶子，要么是无尺寸自由画布。
 */
export interface ShellTagFolderData {
  type: 'shell'
  id: string
  ratio: number & { __brand: '0-1-range' }
  data: [TagLeafData] | [FullCanvasFreeFolderData]
}

/**
 * 画布标签组容器 (Canvas)
 * 作用：管理多个网格项（壳或子画布）的排列方向。
 */
export interface CanvasTagFolderData {
  type: 'canvas'
  id: string
  ratio: number & { __brand: '0-1-range' }
  direction: LayoutDirection
  data: TagFolderItem[]
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
  data: [TagLeafData]
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
