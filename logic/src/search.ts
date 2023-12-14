import { Kind, type Board, type Piece } from './board'
import { BoardMove, Direction, InvalidMove, Move, applyMove } from './move'

type Condition = (board: Board) => boolean
type Path = Move[]

const DEFAULT_CONDITIONS = {
  hasSpecialCombo,
  hasSpecial,
  hasBombCombo,
  hasBomb,
  hasRocket
}

export type GoodMoves = Record<number, Record<string, Move[]>>

export function searchGoodMoves(
  board: Board,
  swapSkill: boolean = false
): GoodMoves {
  const pathsForCondition: Record<string, Path[]> = {}
  for (const [c, path] of search(board, 2, DEFAULT_CONDITIONS, swapSkill)) {
    if (!(c in pathsForCondition)) pathsForCondition[c] = []
    pathsForCondition[c].push(path)
  }

  const goodMoves: GoodMoves = {}
  for (const [c, paths] of Object.entries(pathsForCondition)) {
    const step = paths[0].length
    if (!(step in goodMoves)) goodMoves[step] = {}

    const moves = paths.map(path => path[0])
    moves.sort(a => (a.swapSkill ? 1 : -1))

    const uniqueMoves: Move[] = []
    const appeared = new Set<string>()
    for (const move of moves) {
      const key = [move.position[0], move.position[1], move.direction].join('-')
      if (appeared.has(key)) continue
      appeared.add(key)
      uniqueMoves.push(move)
    }
    goodMoves[step][c] = uniqueMoves
  }

  return goodMoves
}

export function* search<T extends Record<string, Condition>>(
  board: Board,
  maxMove: number,
  conditions: T,
  swapSkill: boolean = false
): Generator<[keyof T, Path], void, void> {
  if (maxMove <= 0) return

  const conditionToName = new Map<Condition, string>()
  for (const [name, cond] of Object.entries(conditions)) {
    conditionToName.set(cond, name)
  }

  const initialPieces = board.pieces

  type State = [Piece[][], boolean, Path, Move | undefined]
  let states: State[] = [[board.pieces, swapSkill, [], undefined]]
  let unfulfilleds = Object.values(conditions)
  for (let step = 0; step <= maxMove; step++) {
    const nextStates: State[] = []

    const fulfilleds = new Set<Condition>()
    while (states.length > 0) {
      const [pieces, swap, path, move] = states.shift() as State
      board.pieces = pieces

      let newPath = path
      if (move !== undefined) {
        const pair = new BoardMove(board, move).pieces()
        const canSwap = swap && move.direction !== Direction.Zero

        try {
          applyMove(board, move)
        } catch (error) {
          if (error instanceof InvalidMove) {
            if (canSwap && pair.every(p => p.isColor())) {
              states.push([
                pieces,
                false,
                path,
                new Move(move.position, move.direction, true)
              ])
            }
            continue
          }
          throw error
        }

        if (canSwap && pair.some(p => p.isBooster())) {
          states.push([
            pieces,
            false,
            path,
            new Move(move.position, move.direction, true)
          ])
        }

        newPath = path.concat([move])
      }

      for (const condition of unfulfilleds) {
        if (condition(board)) {
          if (step >= 1) {
            const name = conditionToName.get(condition)
            if (name !== undefined) yield [name, newPath]
          }
          fulfilleds.add(condition)
        }
      }

      for (const move of allMoves(board)) {
        nextStates.push([board.pieces, swap, newPath, move])
      }
    }

    unfulfilleds = unfulfilleds.filter(c => !fulfilleds.has(c))
    if (unfulfilleds.length === 0) return

    states = nextStates
  }

  board.pieces = initialPieces
}

function allMoves(board: Board): Move[] {
  const moves = []

  for (let x = 1; x < board.width; x++) {
    for (let y = 1; y <= board.height; y++) {
      moves.push(new Move([x, y], Direction.Right))
    }
  }

  for (let x = 1; x <= board.width; x++) {
    for (let y = 1; y < board.height; y++) {
      moves.push(new Move([x, y], Direction.Down))
    }
  }

  for (const pos of board.allPositions()) {
    moves.push(new Move(pos, Direction.Zero))
  }

  return moves
}

const ADJACENTS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
]

export function hasSpecialCombo(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Special) continue
    for (const [dx, dy] of ADJACENTS) {
      if (board.piece([pos[0] + dx, pos[1] + dy]).isBooster()) {
        return true
      }
    }
  }
  return false
}

export function hasSpecial(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face === Kind.Special) return true
  }
  return false
}

export function hasBombCombo(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Bomb) continue
    for (const [dx, dy] of ADJACENTS) {
      if (board.piece([pos[0] + dx, pos[1] + dy]).isBooster()) {
        return true
      }
    }
  }
  return false
}

export function hasBomb(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face === Kind.Bomb) return true
  }
  return false
}

export function hasRocket(board: Board): boolean {
  for (const pos of board.allPositions()) {
    const face = board.piece(pos).face
    if (face === Kind.HRocket || face === Kind.VRocket) return true
  }
  return false
}
