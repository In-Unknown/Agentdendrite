import * as Layout from './PageLayout'

export function makeRatio(value: number): Layout.BrandedRatio {
  if (value < 0 || value > 1) throw new RangeError(`ratio must be 0-1, got ${value}`)
  return value as Layout.BrandedRatio
}

export function shellToFreeShell(
  node: Layout.ShellTabFolderData,
  position: [number, number],
  size: [number, number],
  backgroundColor = '#ffffff'
): Layout.ShellFreeFolderData | null {
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
  node: Layout.ShellFreeFolderData,
  ratio: Layout.BrandedRatio
): Layout.ShellTabFolderData {
  return {
    type: 'shell',
    id: node.id,
    ratio,
    data: node.data
  }
}
