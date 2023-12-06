import {
  InvalidMove,
  MoveScene,
  moveScenes,
  type Move
} from '@sweethomemaid/logic'
import { useApp } from './context/use-app'

export function usePlayMove(): (move: Move) => Promise<void> {
  const { board, dispatch } = useApp()
  return async (move: Move) => {
    try {
      for (const scene of moveScenes(board, move)) {
        dispatch({ type: 'moved', complete: false })
        await new Promise(resolve =>
          setTimeout(resolve, scene === MoveScene.Match ? 300 : 200)
        )
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
