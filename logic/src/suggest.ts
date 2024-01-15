import { Direction, isColor, type Board, type Position } from './board'
import { BoardMove, Move, canMove, findMatches, positionToInt } from './move'
import { GeneralSet } from './utils'

/**
 * 一手で消せるピースを探す。ブースターは含まない。
 *
 * @return {Position[]} 動かす前のピースの位置
 */
export function suggest(board: Board): Position[] {
  board = board.copy()
  let positions: Position[] = []

  for (let x = 1; x < board.width; x++) {
    for (let y = 1; y <= board.height; y++) {
      positions = positions.concat(
        findSuggestedPositions(board, new Move([x, y], Direction.Right))
      )
    }
  }

  for (let x = 1; x <= board.width; x++) {
    for (let y = 1; y < board.height; y++) {
      positions = positions.concat(
        findSuggestedPositions(board, new Move([x, y], Direction.Down))
      )
    }
  }

  return [...new GeneralSet(positionToInt, positions)]
}

function findSuggestedPositions(board: Board, move: Move): Position[] {
  const positions = new BoardMove(board, move).positions()
  if (
    positions.some(pos => !isColor(board.piece(pos).face)) ||
    !canMove(board, move)
  )
    return []

  const state = board.state
  try {
    // swap pieces
    const p = board.piece(positions[0])
    board.setPiece(positions[0], board.piece(positions[1]))
    board.setPiece(positions[1], p)

    const suggests = new GeneralSet(
      positionToInt,
      findMatches(board)
        .map(match => match.positions)
        .flat()
    )

    // swap した分を戻す
    const contains = positions.map(pos => suggests.has(pos))
    for (const pos of positions) suggests.delete(pos)
    if (contains[0]) suggests.add(positions[1])
    if (contains[1]) suggests.add(positions[0])

    return [...suggests]
  } finally {
    board.state = state
  }
}
