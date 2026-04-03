// src/renderer/src/features/layout/logic/layoutActions.ts
import { type Ref } from 'vue'
import * as Layout from '../models/PageLayout'
import {
  handleCloseFolder,
  handleSetActiveTab,
  handleMoveNode,
  handleDetachShell
} from './layoutCoordinator'

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
  | {
      type: 'DETACH_SHELL'
      id: string
      layerId: string
      clientX: number
      clientY: number
      width: number
      height: number
      dragOffset?: [number, number]
    }

export const dispatchAction = (
  state: { workspace: Layout.WorkspaceState; drag: Ref<Layout.ExtractOperation | null> },
  action: LayoutAction
): void => {
  switch (action.type) {
    case 'CLOSE_FOLDER':
      handleCloseFolder(state.workspace.layer, action.id, action.layerId)
      break

    case 'SET_ACTIVE_TAB':
      handleSetActiveTab(state.workspace.layer, action.id, action.tabName, action.layerId)
      break

    case 'MOVE_NODE':
      handleMoveNode(
        state.workspace.layer,
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

    case 'DETACH_SHELL':
      handleDetachShell(state, action)
      break
  }
}
