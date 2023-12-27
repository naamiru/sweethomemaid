import { Kind, type Board, type Piece } from './board'
import {
  BoardMove,
  Direction,
  InvalidMove,
  Move,
  Skill,
  applyMove,
  canMove
} from './move'

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

type Skills = number

function hasSkill(skills: Skills, skill: Skill): boolean {
  return (skills & skill) !== 0
}

function removeSkill(skills: Skills, skill: Skill): Skills {
  return skills & ~skill
}

export function searchGoodMoves(board: Board, skills: Skills = 0): GoodMoves {
  const pathsForCondition: Record<string, Path[]> = {}
  for (const [c, path] of search(board, 2, DEFAULT_CONDITIONS, skills)) {
    if (!(c in pathsForCondition)) pathsForCondition[c] = []
    pathsForCondition[c].push(path)
  }

  const goodMoves: GoodMoves = {}
  for (const [c, paths] of Object.entries(pathsForCondition)) {
    const step = paths[0].length
    if (!(step in goodMoves)) goodMoves[step] = {}

    const moves = paths.map(path => path[0])
    moves.sort(a => a.skill ?? -1) // swap よりも通常の move を優先する

    const uniqueMoves: Move[] = []
    const appeared = new Set<string>()
    for (const move of moves) {
      const key = [
        move.position[0],
        move.position[1],
        move.direction,
        // swap の場合は通常の move とまとめるが、それ以外のスキルはまとめない
        move.skill !== undefined && move.skill !== Skill.Swap ? move.skill : 0
      ].join('-')
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
  skills: Skills = 0
): Generator<[keyof T, Path], void, void> {
  if (maxMove <= 0) return

  const conditionToName = new Map<Condition, string>()
  for (const [name, cond] of Object.entries(conditions)) {
    conditionToName.set(cond, name)
  }

  const initialPieces = board.pieces

  type State = [Piece[][], Skills, Path, Move | undefined]
  let states: State[] = [[board.pieces, skills, [], undefined]]
  let unfulfilleds = Object.values(conditions)
  for (let step = 0; step <= maxMove; step++) {
    const nextStates: State[] = []

    const fulfilleds = new Set<Condition>()
    while (states.length > 0) {
      const [pieces, skills, path, move] = states.shift() as State
      board.pieces = pieces

      let newPath = path
      if (move !== undefined) {
        const pair = new BoardMove(board, move).pieces()
        const canSwap =
          hasSkill(skills, Skill.Swap) && move.direction !== Direction.Zero

        try {
          applyMove(board, move)
        } catch (error) {
          if (error instanceof InvalidMove) {
            if (canSwap && pair.every(p => p.isColor())) {
              states.push([
                pieces,
                removeSkill(skills, Skill.Swap),
                path,
                new Move(move.position, move.direction, Skill.Swap)
              ])
            }
            continue
          }
          throw error
        }

        if (canSwap && pair.some(p => p.isBooster())) {
          states.push([
            pieces,
            removeSkill(skills, Skill.Swap),
            path,
            new Move(move.position, move.direction, Skill.Swap)
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

      for (const [move, newSkills] of allMoves(board, skills)) {
        nextStates.push([board.pieces, newSkills, newPath, move])
      }
    }

    unfulfilleds = unfulfilleds.filter(c => !fulfilleds.has(c))
    if (unfulfilleds.length === 0) return

    states = nextStates
  }

  board.pieces = initialPieces
}

function allMoves(board: Board, skills: Skills): Array<[Move, Skills]> {
  const moves: Array<[Move, Skills]> = []

  for (let x = 1; x < board.width; x++) {
    for (let y = 1; y <= board.height; y++) {
      moves.push([new Move([x, y], Direction.Right), skills])
    }
  }

  for (let x = 1; x <= board.width; x++) {
    for (let y = 1; y < board.height; y++) {
      moves.push([new Move([x, y], Direction.Down), skills])
    }
  }

  for (const pos of board.allPositions()) {
    moves.push([new Move(pos, Direction.Zero), skills])
  }

  if (hasSkill(skills, Skill.CrossRockets)) {
    for (const pos of board.allPositions()) {
      moves.push([
        new Move(pos, Direction.Zero, Skill.CrossRockets),
        removeSkill(skills, Skill.CrossRockets)
      ])
    }
  }

  if (hasSkill(skills, Skill.H3Rockets)) {
    for (let y = 1; y <= board.height; y++) {
      for (let x = 1; x <= board.width; x++) {
        const move = new Move([x, y], Direction.Zero, Skill.H3Rockets)
        if (canMove(board, move)) {
          moves.push([move, removeSkill(skills, Skill.H3Rockets)])
          break
        }
      }
    }
  }

  if (hasSkill(skills, Skill.HRocket)) {
    for (let y = 1; y <= board.height; y++) {
      for (let x = 1; x <= board.width; x++) {
        const move = new Move([x, y], Direction.Zero, Skill.HRocket)
        if (canMove(board, move)) {
          moves.push([move, removeSkill(skills, Skill.HRocket)])
          break
        }
      }
    }
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
