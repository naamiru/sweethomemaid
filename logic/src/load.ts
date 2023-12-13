import dedent from 'ts-dedent'
import { Board, Kind, Piece, type Face, type Position } from './board'
import { positionToInt } from './move'
import { GeneralMap, GeneralSet } from './utils'
export type BoardConfig = {
  width?: number
  height?: number
  colors?: string
  mice?: string
  woods?: string
  ices?: string
  chains?: string
  upstreams?: string
  warps?: string
  links?: Array<[Position, Position]>
  fallFrom?: string
}

export function load(config: BoardConfig): Board {
  const board = Board.create(config.width ?? 9, config.height ?? 9)
  if (config.colors !== undefined) updateColor(board, config.colors)
  if (config.mice !== undefined) updateMouse(board, config.mice)
  if (config.woods !== undefined) updateWood(board, config.woods)
  if (config.ices !== undefined) updateIce(board, config.ices)
  if (config.chains !== undefined) updateChain(board, config.chains)
  if (config.upstreams !== undefined) updateUpstream(board, config.upstreams)
  if (config.warps !== undefined) updateWarp(board, config.warps)
  if (config.links !== undefined) updateLink(board, config.links)
  if (config.fallFrom !== undefined) updateFallFrom(board, config.fallFrom)

  return board
}

function updateColor(board: Board, expr: string): void {
  for (const [pos, token] of tokens(expr)) {
    let face: Face | undefined
    if (token === 'r') {
      face = Kind.Red
    } else if (token === 'b') {
      face = Kind.Blue
    } else if (token === 'g') {
      face = Kind.Green
    } else if (token === 'y') {
      face = Kind.Yellow
    } else if (token === 'a') {
      face = Kind.Aqua
    } else if (token === 'p') {
      face = Kind.Pink
    } else if (token === '.') {
      face = Kind.Unknown
    }
    if (face !== undefined) {
      const piece = board.piece(pos)
      board.setPiece(pos, new Piece(face, piece.ice, piece.chain))
    }
  }
}

function updateMouse(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      new Piece({ kind: Kind.Mouse, count }, piece.ice, piece.chain)
    )
  }
}

function updateWood(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      new Piece({ kind: Kind.Wood, count }, piece.ice, piece.chain)
    )
  }
}

function updateIce(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, new Piece(piece.face, count, piece.chain))
  }
}

function updateChain(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, new Piece(piece.face, piece.ice, count))
  }
}

function updateUpstream(board: Board, expr: string): void {
  for (const [pos, token] of tokens(expr)) {
    let diff: [number, number] | undefined
    if (token === '1') {
      diff = [-1, -1]
    } else if (token === '2' || token === 'u') {
      diff = [0, -1]
    } else if (token === '3') {
      diff = [1, -1]
    } else if (token === '4' || token === 'l') {
      diff = [-1, 0]
    } else if (token === '6' || token === 'r') {
      diff = [1, 0]
    } else if (token === '7') {
      diff = [-1, 1]
    } else if (token === '8' || token === 'd') {
      diff = [0, 1]
    } else if (token === '9') {
      diff = [1, 1]
    }
    if (diff !== undefined) {
      board.setUpstream(pos, [pos[0] + diff[0], pos[1] + diff[1]])
      const piece = board.piece(pos)
      if (piece.face === Kind.Out) {
        board.setPiece(pos, new Piece(Kind.Unknown, piece.ice, piece.chain))
      }
    }
  }
}

function updateWarp(board: Board, expr: string): void {
  const warps = new Map<string, Array<[number, number]>>()
  for (const [pos, token] of tokens(expr)) {
    if (!/^[a-z]$/i.test(token)) continue
    const key = token.toLowerCase()
    let positions = warps.get(key)
    if (positions === undefined) {
      positions = []
      warps.set(key, positions)
    }
    if (token === key) {
      // token は小文字 -> ワープ元
      positions.unshift(pos)
    } else {
      // token は大文字 -> ワープ先
      positions.push(pos)
    }
  }

  for (const positions of warps.values()) {
    if (positions.length !== 2) continue
    const [from, to] = positions
    board.setUpstream(to, from)
  }
}

function updateLink(board: Board, pairs: Array<[Position, Position]>): void {
  const links = new GeneralMap<Position, Position[], number>(positionToInt)
  for (const [from, to] of pairs) {
    const upstreams = links.get(from) ?? []
    upstreams.push(to)
    links.set(from, upstreams)
  }
  board.links = links
}

function updateFallFrom(board: Board, expr: string): void {
  const fallFromLeftPositions = new GeneralSet(positionToInt)
  for (const [pos, token] of tokens(expr)) {
    if (token === 'l') {
      fallFromLeftPositions.add(pos)
    }
  }
  board.fallFromLeftPositions = fallFromLeftPositions
}

function* tokens(expr: string): Generator<[Position, string], void, void> {
  for (const [y, line] of dedent(expr).split('\n').entries()) {
    for (const [x, token] of [...line].entries()) {
      yield [[x + 1, y + 1], token]
    }
  }
}

function* positiveDigitToken(
  expr: string
): Generator<[Position, number], void, void> {
  for (const [pos, token] of tokens(expr)) {
    if (/^\d+$/.test(token)) {
      const value = parseInt(token, 10)
      if (value > 0) yield [pos, parseInt(token, 10)]
    }
  }
}
