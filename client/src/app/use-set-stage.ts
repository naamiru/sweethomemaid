import { load } from '@sweethomemaid/logic'
import { useCallback } from 'react'
import { getStageConfig, type StageName } from '../stages'
import { useApp } from './use-app'

export function useSetStage(): (stage: StageName) => Promise<void> {
  const { dispatch } = useApp()
  return useCallback(
    async (stage: StageName) => {
      const config = await getStageConfig(stage)
      const board = load(config)
      dispatch({ type: 'setStage', stage, board })
    },
    [dispatch]
  )
}
