import dedent from 'ts-dedent'
import {
  Board,
  Direction,
  Kind,
  createPiece,
  type Face,
  type Position
} from './board'
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
  jellies?: string
  presents?: string
  mikans?: string
  links?: Array<[Position, Position]>
  fallFrom?: string
  upstream?: string
}

export function load(config: BoardConfig): Board {
  const board = Board.create(config.width ?? 9, config.height ?? 9)
  if (config.colors !== undefined) updateColor(board, config.colors)
  if (config.mice !== undefined) updateMouse(board, config.mice)
  if (config.woods !== undefined) updateWood(board, config.woods)
  if (config.ices !== undefined) updateIce(board, config.ices)
  if (config.chains !== undefined) updateChain(board, config.chains)
  if (config.jellies !== undefined) updateJelly(board, config.jellies)
  if (config.presents !== undefined) updatePresent(board, config.presents)
  if (config.mikans !== undefined) updateMikan(board, config.mikans)
  if (config.links !== undefined) updateLink(board, config.links)
  if (config.fallFrom !== undefined) updateFallFrom(board, config.fallFrom)
  if (config.upstream !== undefined) updateUpstream(board, config.upstream)

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
    } else if (token === 'S') {
      face = Kind.Special
    } else if (token === 'B') {
      face = Kind.Bomb
    } else if (token === 'H') {
      face = Kind.HRocket
    } else if (token === 'V') {
      face = Kind.VRocket
    } else if (token === 'M') {
      face = Kind.Missile
    } else if (token === '.') {
      face = Kind.Empty
    } else if (token === '?') {
      face = Kind.Unknown
    }
    if (face !== undefined) {
      const piece = board.piece(pos)
      board.setPiece(
        pos,
        createPiece(face, piece.ice, piece.chain, piece.jelly)
      )
    }
  }
}

function updateMouse(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      createPiece(
        { kind: Kind.Mouse, count },
        piece.ice,
        piece.chain,
        piece.jelly
      )
    )
  }
}

function updateWood(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      createPiece(
        { kind: Kind.Wood, count },
        piece.ice,
        piece.chain,
        piece.jelly
      )
    )
  }
}

function updateIce(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      createPiece(piece.face, count, piece.chain, piece.jelly)
    )
  }
}

function updateChain(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, createPiece(piece.face, piece.ice, count, piece.jelly))
  }
}

function updateJelly(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, createPiece(piece.face, piece.ice, piece.chain, count))
  }
}

function updatePresent(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      createPiece(
        { kind: Kind.Present, count },
        piece.ice,
        piece.chain,
        piece.jelly
      )
    )
  }
}

function updateMikan(board: Board, expr: string): void {
  for (const [pos, count] of positiveDigitToken(expr)) {
    for (const mikanPosition of [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ] as Array<[0 | 1, 0 | 1]>) {
      const position: Position = [
        pos[0] + mikanPosition[0],
        pos[1] + mikanPosition[1]
      ]
      const piece = board.piece(position)
      board.setPiece(
        position,
        createPiece(
          { kind: Kind.Mikan, count, position: mikanPosition },
          piece.ice,
          piece.chain,
          piece.jelly
        )
      )
    }
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

function updateUpstream(board: Board, expr: string): void {
  for (const [[x, y], token] of tokens(expr)) {
    if (token === 'u') {
      board.upstreams[x][y] = Direction.Up
    } else if (token === 'd') {
      board.upstreams[x][y] = Direction.Down
    } else if (token === 'l') {
      board.upstreams[x][y] = Direction.Left
    } else if (token === 'r') {
      board.upstreams[x][y] = Direction.Right
    }
  }
}

function* tokens(expr: string): Generator<[Position, string], void, void> {
  for (const [y, line] of dedent(expr).split('\n').entries()) {
    for (const [x, token] of [...line].entries()) {
      yield [[x + 1, y + 1], token]
    }
  }
}

export function* positiveDigitToken(
  expr: string
): Generator<[Position, number], void, void> {
  for (const [pos, token] of tokens(expr)) {
    if (/^[a-z\d]+$/.test(token)) {
      const value = parseInt(token, 36)
      if (value > 0) yield [pos, value]
    }
  }
}
