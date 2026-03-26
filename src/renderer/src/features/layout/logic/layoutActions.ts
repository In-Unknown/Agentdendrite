// src/renderer/src/features/layout/logic/layoutActions.ts
import * as Layout from '../models/PageLayout'
import { handleCloseFolder, handleSetActiveTab, handleMoveNode } from './layoutCoordinator'

export type LayoutAction =
  | { type: 'CLOSE_FOLDER'; id: string; layerId: string } // 必须带上所在层 ID
  | { type: 'SET_ACTIVE_TAB'; id: string; tabName: string; layerId: string } // 必须带上所在层 ID
  | {
      type: 'MOVE_NODE'
      id: string
      targetContainerId: string
      sourceLayerId: string
      targetLayerId: string
      position?: [number, number]
      size?: [number, number]
      ratio?: Layout.BrandedRatio
      index?: number
    }

export const dispatchAction = (layers: Layout.LayoutLayer[], action: LayoutAction): void => {
  switch (action.type) {
    case 'CLOSE_FOLDER':
      // 直接调用，不写逻辑
      handleCloseFolder(layers, action.id, action.layerId)
      break

    case 'SET_ACTIVE_TAB':
      handleSetActiveTab(layers, action.id, action.tabName, action.layerId)
      break

    case 'MOVE_NODE':
      handleMoveNode(
        layers,
        action.id,
        action.targetContainerId,
        action.sourceLayerId,
        action.targetLayerId,
        {
          position: action.position,
          size: action.size,
          ratio: action.ratio,
          index: action.index
        }
      )
      break
  }
}
