import {
  Kind,
  createPiece,
  load,
  type BoardConfig,
  type Color,
  type Piece
} from '@sweethomemaid/logic'
import { useCallback } from 'react'
import { getStageConfig, type StageName } from '../stages'
import { useApp } from './use-app'

export function useSetStage(): (stage: StageName) => Promise<void> {
  const { dispatch } = useApp()
  return useCallback(
    async (stage: StageName) => {
      const config = await getStageConfig(stage)
      const board = load(config)
      const suppliedPieces = getSuppliedPieces(config)
      dispatch({ type: 'setStage', stage, board, suppliedPieces })
    },
    [dispatch]
  )
}

const COLOR_TOKENS: Record<string, Color> = {
  r: Kind.Red,
  b: Kind.Blue,
  g: Kind.Green,
  y: Kind.Yellow,
  a: Kind.Aqua,
  p: Kind.Pink
}

function getSuppliedPieces(config: BoardConfig): Piece[] {
  const pieces: Piece[] = []

  const colors = config.colors ?? ''
  for (const [token, color] of Object.entries(COLOR_TOKENS)) {
    if (colors.includes(token)) {
      pieces.push(createPiece(color))
    }
  }

  return pieces
}
