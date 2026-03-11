export type LayoutDirection = 'row' | 'col'
export type TabHeaderPosition = 'top' | 'bottom' | 'left' | 'right' | 'none'
export type LeafType = 'normal' | 'placeholder' | 'singleton'

export interface TagData {
  title: string
  tabName: string
}

type TagDataArray<T extends LeafType> = T extends 'singleton' ? [TagData] : TagData[]

export interface TagLeafData {
  id: string
  type: LeafType
  data: TagDataArray<LeafType>
  activeTabName: string
  tabHeaderPosition: TabHeaderPosition // 标签头的方向，默认时你应该设置为top
}

export interface TagFolderData {
  id: string
  /**
   * 结构约定：
   * 1. 如果是叶子层：data 数组包含且仅包含一个 TagLeafData
   * 2. 如果是容器层：data 数组包含多个 TagFolderData
   */
  data: [TagLeafData] | TagFolderData[]
  direction: LayoutDirection
  ratio: number & { __brand: '0-1-range' }
}
