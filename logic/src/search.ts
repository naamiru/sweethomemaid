import {
  Direction,
  Kind,
  isBooster,
  isColor,
  type Board,
  type BoardState,
  type Color,
  type Position
} from './board'
import { BoardMove, InvalidMove, Move, Skill, applyMove, canMove } from './move'

type Condition = (board: Board) => boolean
type Path = Move[]

export const DEFAULT_CONDITIONS = {
  hasSpecialCombo,
  hasSpecial,
  hasBombCombo,
  hasBomb,
  hasRocket
}

export const TEAMS_CONDITIONS = {
  hasSpecialSpecial,
  hasSpecialBomb,
  hasSpecialRocket,
  hasSpecialMissile,
  hasSpecial,
  hasBombRocket,
  hasBombBomb,
  hasBomb,
  hasHRocket,
  hasVRocket,
  hasMissileHRocket,
  hasMissileVRocket,
  hasMissileBomb,
  hasMissileMissile,
  hasMissile
}

export type GoodMoves = Record<number, Record<string, Move[]>>

type Skills = number

function hasSkill(skills: Skills, skill: Skill): boolean {
  return (skills & skill) !== 0
}

function removeSkill(skills: Skills, skill: Skill): Skills {
  return skills & ~skill
}

export function searchGoodMoves(
  board: Board,
  skills: Skills = 0,
  conditions: Record<string, Condition> = DEFAULT_CONDITIONS
): GoodMoves {
  const pathsForCondition: Record<string, Path[]> = {}
  for (const [c, path] of search(board, 2, conditions, skills)) {
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

  const initialState = board.state

  type State = [BoardState, Skills, Path, Move | undefined]
  let states: State[] = [[board.state, skills, [], undefined]]
  let unfulfilleds = Object.values(conditions)
  for (let step = 0; step <= maxMove; step++) {
    const nextStates: State[] = []

    const fulfilleds = new Set<Condition>()
    while (states.length > 0) {
      const [state, skills, path, move] = states.shift() as State
      board.state = state

      let newPath = path
      if (move !== undefined) {
        const pair = new BoardMove(board, move).pieces()
        const canSwap =
          hasSkill(skills, Skill.Swap) && move.direction !== Direction.Zero

        try {
          applyMove(board, move)
        } catch (error) {
          if (error instanceof InvalidMove) {
            if (canSwap && pair.every(p => isColor(p.face))) {
              states.push([
                state,
                removeSkill(skills, Skill.Swap),
                path,
                new Move(move.position, move.direction, Skill.Swap)
              ])
            }
            continue
          }
          throw error
        }

        if (canSwap && pair.some(p => isBooster(p.face))) {
          states.push([
            state,
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
        nextStates.push([board.state, newSkills, newPath, move])
      }
    }

    unfulfilleds = unfulfilleds.filter(c => !fulfilleds.has(c))
    if (unfulfilleds.length === 0) return

    states = nextStates
  }

  board.state = initialState
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

  if (hasSkill(skills, Skill.V3Rockets)) {
    for (let x = 1; x <= board.width; x++) {
      for (let y = 1; y <= board.height; y++) {
        const move = new Move([x, y], Direction.Zero, Skill.V3Rockets)
        if (canMove(board, move)) {
          moves.push([move, removeSkill(skills, Skill.V3Rockets)])
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

  if (hasSkill(skills, Skill.VRocket)) {
    for (let y = 1; y <= board.height; y++) {
      for (let x = 1; x <= board.width; x++) {
        const move = new Move([x, y], Direction.Zero, Skill.VRocket)
        if (canMove(board, move)) {
          moves.push([move, removeSkill(skills, Skill.VRocket)])
          break
        }
      }
    }
  }

  if (hasSkill(skills, Skill.DelColor)) {
    const appeared = new Set<Color>()
    for (let y = 1; y <= board.height; y++) {
      for (let x = 1; x <= board.width; x++) {
        const color = board.piece([x, y]).face
        if (!isColor(color) || appeared.has(color)) continue
        appeared.add(color)
        moves.push([
          new Move([x, y], Direction.Zero, Skill.DelColor),
          removeSkill(skills, Skill.DelColor)
        ])
      }
    }
  }

  if (hasSkill(skills, Skill.PieceBreak)) {
    for (const pos of board.allPositions()) {
      moves.push([
        new Move(pos, Direction.Zero, Skill.PieceBreak),
        removeSkill(skills, Skill.PieceBreak)
      ])
    }
  }

  if (hasSkill(skills, Skill.Bomb)) {
    for (const pos of board.allPositions()) {
      moves.push([
        new Move(pos, Direction.Zero, Skill.Bomb),
        removeSkill(skills, Skill.Bomb)
      ])
    }
  }

  if (hasSkill(skills, Skill.MixMissile)) {
    for (const pos of board.allPositions()) {
      moves.push([
        new Move(pos, Direction.Zero, Skill.MixMissile),
        removeSkill(skills, Skill.MixMissile)
      ])
    }
  }

  if (hasSkill(skills, Skill.Missile)) {
    for (const pos of board.allPositions()) {
      moves.push([
        new Move(pos, Direction.Zero, Skill.Missile),
        removeSkill(skills, Skill.Missile)
      ])
    }
  }

  if (hasSkill(skills, Skill.MixBomb)) {
    for (const pos of board.allPositions()) {
      moves.push([
        new Move(pos, Direction.Zero, Skill.MixBomb),
        removeSkill(skills, Skill.MixBomb)
      ])
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

function isMovable(board: Board, position: Position): boolean {
  const piece = board.piece(position)
  return (
    piece.ice === 0 &&
    piece.jelly === 0 &&
    piece.chain === 0 &&
    board.cell(position).web === 0
  )
}

export function hasSpecialCombo(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Special || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (isMovable(board, adjPos) && isBooster(board.piece(adjPos).face)) {
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
    if (board.piece(pos).face !== Kind.Bomb || !isMovable(board, pos)) continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (isMovable(board, adjPos) && isBooster(board.piece(adjPos).face)) {
        return true
      }
    }
  }
  return false
}

export function hasBombRocket(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Bomb || !isMovable(board, pos)) continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (isMovable(board, adjPos)) {
        const face = board.piece(adjPos).face
        if (face === Kind.VRocket || face === Kind.HRocket) {
          return true
        }
      }
    }
  }
  return false
}

export function hasBombBomb(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Bomb || !isMovable(board, pos)) continue
    for (const [dx, dy] of ADJACENTS) {
      if (dx < 0 || dy < 0) continue // 右下側のみチェック

      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (isMovable(board, adjPos) && board.piece(adjPos).face === Kind.Bomb) {
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

export function hasHRocket(board: Board): boolean {
  for (const pos of board.allPositions()) {
    const face = board.piece(pos).face
    if (face === Kind.HRocket) return true
  }
  return false
}

export function hasVRocket(board: Board): boolean {
  for (const pos of board.allPositions()) {
    const face = board.piece(pos).face
    if (face === Kind.VRocket) return true
  }
  return false
}

export function hasMissile(board: Board): boolean {
  for (const pos of board.allPositions()) {
    const face = board.piece(pos).face
    if (face === Kind.Missile) return true
  }
  return false
}

export function hasMissileBomb(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Missile || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (isMovable(board, adjPos) && board.piece(adjPos).face === Kind.Bomb) {
        return true
      }
    }
  }
  return false
}

export function hasMissileHRocket(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Missile || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (
        isMovable(board, adjPos) &&
        board.piece(adjPos).face === Kind.HRocket
      ) {
        return true
      }
    }
  }
  return false
}

export function hasMissileVRocket(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Missile || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (
        isMovable(board, adjPos) &&
        board.piece(adjPos).face === Kind.VRocket
      ) {
        return true
      }
    }
  }
  return false
}

export function hasMissileMissile(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Missile || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      if (dx < 0 || dy < 0) continue // 右下側のみチェック

      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (
        isMovable(board, adjPos) &&
        board.piece(adjPos).face === Kind.Missile
      ) {
        return true
      }
    }
  }
  return false
}

export function hasSpecialBomb(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Special || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (isMovable(board, adjPos) && board.piece(adjPos).face === Kind.Bomb) {
        return true
      }
    }
  }
  return false
}

export function hasSpecialRocket(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Special || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (isMovable(board, adjPos)) {
        const face = board.piece(adjPos).face
        if (face === Kind.VRocket || face === Kind.HRocket) {
          return true
        }
      }
    }
  }
  return false
}

export function hasSpecialMissile(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Special || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (
        isMovable(board, adjPos) &&
        board.piece(adjPos).face === Kind.Missile
      ) {
        return true
      }
    }
  }
  return false
}

export function hasSpecialSpecial(board: Board): boolean {
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face !== Kind.Special || !isMovable(board, pos))
      continue
    for (const [dx, dy] of ADJACENTS) {
      if (dx < 0 || dy < 0) continue // 右下側のみチェック

      const adjPos: Position = [pos[0] + dx, pos[1] + dy]
      if (
        isMovable(board, adjPos) &&
        board.piece(adjPos).face === Kind.Special
      ) {
        return true
      }
    }
  }
  return false
}
