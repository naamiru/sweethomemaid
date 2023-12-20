import {
  InvalidMove,
  MoveScene,
  moveScenes,
  type Move
} from '@sweethomemaid/logic'
import { useApp } from './use-app'

export function usePlayMove(): (move: Move) => Promise<void> {
  const { board, dispatch } = useApp()
  return async (move: Move) => {
    try {
      let needInterval = false
      for (const scene of moveScenes(board, move)) {
        if (needInterval) {
          await new Promise(resolve =>
            setTimeout(resolve, scene === MoveScene.Match ? 300 : 200)
          )
        }
        needInterval = true

        dispatch({ type: 'moved', complete: false })
      }
      dispatch({ type: 'moved', complete: true })
    } catch (e) {
      if (e instanceof InvalidMove) {
        console.warn('InvalidMove', move)
        return
      }
      throw e
    }
  }
}
