// src/renderer/src/features/layout/models/PageLayout.ts
/**
 * 1. 基础枚举与叶子定义
 */
export type LayoutDirection = 'row' | 'col'
export type TabHeaderPosition = 'top' | 'bottom' | 'left' | 'right' | 'none'
export type LeafType = 'normal' | 'placeholder' | 'singleton'

// models/PageLayout.ts

export type BrandedRatio = number & { __brand: '0-1-range' }

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

export interface WorkspaceState {
  id: string
  layer: LayoutLayer[]
}

// ==========================================================
// 4. 拖拽与放置系统
// ==========================================================

// 4.1 基础枚举类型
export type DropType = 'gap' | 'block'
export type InsertDirection = 'row' | 'col'
export type InsertPosition = 'before' | 'after'

// 4.2 字段池 - 可重用的基础字段接口
// 这些接口定义了各个操作可能需要的字段，通过组合来构建具体的操作类型

interface WithId {
  id: string
}

interface WithDragOffset {
  dragOffset: [number, number]
}

interface WithTabName {
  tabName: string
}

interface WithTargetContainerId {
  targetContainerId: string | null
}

interface WithTargetIndex {
  targetIndex: number | null
}

interface WithTargetBlockId {
  targetBlockId: string
}

interface WithInsertDirection {
  insertDirection: InsertDirection
}

interface WithInsertPosition {
  insertPosition: InsertPosition
}

interface WithVisual {
  visible: boolean
  visualType: DropType
  x: number
  y: number
  width: number
  height: number
}

// 4.3 具体的提取操作类型 - 使用字段池 + 组合模式
// 提取操作：从现有布局中拖拽出某个对象

type ExtractShell = WithId & WithDragOffset & { operationType: 'extract-shell' }

type ExtractTab = WithId & WithTabName & WithDragOffset & { operationType: 'extract-tab' }

// 4.4 提取操作联合类型 - 所有提取操作的联合
export type ExtractOperation = ExtractShell | ExtractTab

// 4.5 具体的插入操作类型 - 使用字段池 + 组合模式
// 插入操作：将拖拽的对象放置到目标位置

type InsertToGap = WithVisual &
  WithTargetContainerId &
  WithTargetIndex & { operationType: 'insert-gap' }

type SplitInsert = WithVisual &
  WithTargetBlockId &
  WithInsertDirection &
  WithInsertPosition & { operationType: 'split-insert' }

type MergeTabs = WithTargetContainerId & WithTargetBlockId & { operationType: 'merge-tabs' }

// 4.6 插入操作联合类型 - 所有插入操作的联合
type InsertOperation = InsertToGap | SplitInsert | MergeTabs

// 4.7 视觉类型 - 用于隐藏预览
type HiddenPreview = {
  visible: false
  visualType: 'gap'
  x: 0
  y: 0
  width: 0
  height: 0
  operationType: 'insert-gap'
  targetContainerId: null
  targetIndex: null
}

// 4.8 放置决策联合类型 - 插入操作 + 隐藏预览
// DropDecision 用于决定拖拽对象应该如何放置到目标位置
export type DropDecision = InsertOperation | HiddenPreview
