import { setActiveTabInTree, removeNodeFromTree } from './layoutEngine'
import { handleMoveNode, handleSwapNodes, handleDuplicateNode } from './layoutCoordinator'
import type { CanvasTagFolderData } from '../models/PageLayout'

export type LayoutAction =
  | { type: 'CLOSE_FOLDER'; id: string }
  | { type: 'SET_ACTIVE_TAB'; id: string; tabName: string }
  | { type: 'MOVE_NODE'; id: string; targetContainerId: string; position?: [number, number] }
  | { type: 'SWAP_NODES'; nodeAId: string; nodeBId: string }
  | { type: 'DUPLICATE_NODE'; id: string; targetContainerId: string; position?: [number, number] }

export const dispatchAction = (layers: CanvasTagFolderData[], action: LayoutAction): void => {
  console.log('Dispatcher收到指令:', action.type, action)

  switch (action.type) {
    case 'MOVE_NODE': {
      handleMoveNode(layers, action.id, action.targetContainerId, action.position)
      break
    }

    case 'SWAP_NODES': {
      handleSwapNodes(layers, action.nodeAId, action.nodeBId)
      break
    }

    case 'DUPLICATE_NODE': {
      handleDuplicateNode(layers, action.id, action.targetContainerId, action.position)
      break
    }

    case 'CLOSE_FOLDER': {
      for (const layer of layers) {
        if (removeNodeFromTree(layer.data, action.id)) {
          console.log(`指令由层 ${layer.id} 处理成功`)
          return
        }
      }
      break
    }

    case 'SET_ACTIVE_TAB': {
      for (const layer of layers) {
        if (setActiveTabInTree(layer.data, action.id, action.tabName)) {
          console.log(`指令由层 ${layer.id} 处理成功`)
          return
        }
      }
      break
    }

    default:
      console.warn('未知的 Action:', action)
  }
}
