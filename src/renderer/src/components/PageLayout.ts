export interface TagData {
  title: string
  tabName: string
}

export type TabHeaderPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TagLeafData {
  id: string
  data: TagData[]
  activeTabName: string
  tabHeaderPosition: TabHeaderPosition // 标签头的方向，默认时你应该设置为top
}

export interface TagFolderData {
  id: string
  data: [TagLeafData] | TagFolderData[]
  ratio: number & { __brand: '0-1-range' }
}
