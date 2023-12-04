import dedent from 'ts-dedent'
import { describe, expect, test } from 'vitest'
import { findMatches } from './move'
import { Board, Kind, Piece, type Face } from './stage'

function createBoard(expr: string): Board {
  const tokens = dedent(expr)
    .split('\n')
    .map(line => [...line])

  const board = new Board(tokens[0].length, tokens.length)
  for (const [y, line] of tokens.entries()) {
    for (const [x, token] of line.entries()) {
      board.setPiece([x + 1, y + 1], new Piece(parseFace(token, x + 1, y + 1)))
    }
  }

  return board
}

function parseFace(token: string, x: number, y: number): Face {
  if (token === '+') return Kind.Red
  if (token === '-') return ([Kind.Green, Kind.Yellow] as const)[(x + y) % 2]
  if (token === 'r') return Kind.Red
  if (token === 'b') return Kind.Blue
  if (token === 'g') return Kind.Green
  if (token === 'y') return Kind.Yellow
  if (token === '.') return Kind.Empty
  if (token === 'M') return Kind.Missile
  if (token === 'H') return Kind.HRocket
  if (token === 'V') return Kind.VRocket
  if (token === 'B') return Kind.Bomb
  if (token === 'S') return Kind.Special
  if (token === 'x') return Kind.Unknown
  return Kind.Out
}

describe('findMatch', () => {
  function expectMatch(initial: string, expected: string): void {
    const board = createBoard(initial)
    for (const match of findMatches(board)) {
      for (const position of match.positions) {
        board.setPiece(position, new Piece(Kind.Empty))
      }
      if (match.booster !== undefined) {
        board.setPiece(match.booster.position, new Piece(match.booster.kind))
      }
    }
    const expectedBoard = createBoard(expected)
    expect(board.pieces).toEqual(expectedBoard.pieces)
  }

  test('横3つ', () => {
    expectMatch(
      `
      -----
      -+++-
      -----
      `,
      `
      -----
      -...-
      -----
      `
    )
  })

  test('左上で横3つ', () => {
    expectMatch(
      `
      +++-
      ----
      `,
      `
      ...-
      ----
      `
    )
  })

  test('右下で横3つ', () => {
    expectMatch(
      `
      ----
      -+++
      `,
      `
      ----
      -...
      `
    )
  })

  test('横2つはマッチしない', () => {
    expectMatch(
      `
      ----
      -++-
      ----
      `,
      `
      ----
      -++-
      ----
      `
    )
  })

  test('縦3つ', () => {
    expectMatch(
      `
      ---
      -+-
      -+-
      -+-
      ---
      `,
      `
      ---
      -.-
      -.-
      -.-
      ---
      `
    )
  })

  test('左上で縦3つ', () => {
    expectMatch(
      `
      +-
      +-
      +-
      --
      `,
      `
      .-
      .-
      .-
      --
      `
    )
  })

  test('右下で縦3つ', () => {
    expectMatch(
      `
      --
      -+
      -+
      -+
      `,
      `
      --
      -.
      -.
      -.
      `
    )
  })

  test('縦2つはマッチしない', () => {
    expectMatch(
      `
      ---
      -+-
      -+-
      ---
      `,
      `
      ---
      -+-
      -+-
      ---
      `
    )
  })

  test('横5', () => {
    expectMatch('-+++++-', '-..S..-')
  })

  test('縦5', () => {
    expectMatch(
      `
      -
      +
      +
      +
      +
      +
      -
      `,
      `
      -
      .
      .
      S
      .
      .
      -
      `
    )
  })

  test('横5と縦3が重なった場合、横5のみ消える', () => {
    expectMatch(
      `
      +++++
      --+--
      --+--
      `,
      `
      ..S..
      --+--
      --+--
      `
    )
  })

  test('縦5と横3が重なった場合、横5のみ消える', () => {
    expectMatch(
      `
      +--
      +--
      +++
      +--
      +--
      `,
      `
      .--
      .--
      S++
      .--
      .--
      `
    )
  })

  test('縦5と横4が重なった場合、縦5が優先', () => {
    expectMatch(
      `
      +---
      +---
      ++++
      +---
      +---
      `,
      `
      .---
      .---
      S...
      .---
      .---
      `
    )
  })

  test('十字', () => {
    expectMatch(
      `
      -+-
      +++
      -+-
      `,
      `
      -.-
      .B.
      -.-
      `
    )
  })

  test('L字', () => {
    expectMatch(
      `
      +--
      +--
      +++
      `,
      `
      .--
      .--
      B..
      `
    )
  })

  test('L字(+90)', () => {
    expectMatch(
      `
      +++
      +--
      +--
      `,
      `
      B..
      .--
      .--
      `
    )
  })

  test('L字(+180)', () => {
    expectMatch(
      `
      +++
      --+
      --+
      `,
      `
      ..B
      --.
      --.
      `
    )
  })

  test('L字(+270)', () => {
    expectMatch(
      `
      --+
      --+
      +++
      `,
      `
      --.
      --.
      ..B
      `
    )
  })

  test('T字', () => {
    expectMatch(
      `
      +++
      -+-
      -+-
      `,
      `
      ...
      -B-
      -.-
      `
    )
  })

  test('T字(+90)', () => {
    expectMatch(
      `
      --+
      +++
      --+
      `,
      `
      --.
      .B.
      --.
      `
    )
  })

  test('T字(+180)', () => {
    expectMatch(
      `
      -+-
      -+-
      +++
      `,
      `
      -.-
      -B-
      ...
      `
    )
  })

  test('T字(+270)', () => {
    expectMatch(
      `
      +--
      +++
      +--
      `,
      `
      .--
      .B.
      .--
      `
    )
  })

  test('十字とL字がある場合、十字が優先される', () => {
    expectMatch(
      `
      -+--
      -+--
      ++++
      -+--
      `,
      `
      -+--
      -.--
      .B.+
      -.--
      `
    )
  })

  test('十字とT字がある場合、十字が優先される', () => {
    expectMatch(
      `
      -+-
      -+-
      +++
      -+-
      `,
      `
      -+-
      -.-
      .B.
      -.-
      `
    )
  })

  test('L字とT字がある場合、L字が優先される', () => {
    expectMatch(
      `
      -+--
      -+--
      ++++
      `,
      `
      -.--
      -.--
      +B..
      `
    )
  })

  test('横4', () => {
    expectMatch('-++++-', '-..V.-')
  })

  test('縦4', () => {
    expectMatch(
      `
      -
      +
      +
      +
      +
      -
      `,
      `
      -
      .
      H
      .
      .
      -
      `
    )
  })

  test('4x1と2x2が重なった場合、4x1のみ消える', () => {
    expectMatch(
      `
      -++++-
      --++--
      `,
      `
      -..V.-
      --++--
      `
    )
  })

  test('2x2', () => {
    expectMatch(
      `
      ----
      -++-
      -++-
      ----
      `,
      `
      ----
      -..-
      -.M-
      ----
      `
    )
  })

  test('2x2と3x1が重なった場合(1)', () => {
    expectMatch(
      `
      -+--
      -++-
      -++-
      ----
      `,
      `
      -.--
      -.M-
      -..-
      ----
      `
    )
  })

  test('2x2と3x1が重なった場合(2)', () => {
    expectMatch(
      `
      --+-
      -++-
      -++-
      ----
      `,
      `
      --.-
      -M.-
      -..-
      ----
      `
    )
  })

  test('2x2と3x1が重なった場合(3)', () => {
    expectMatch(
      `
      ----
      -+++
      -++-
      ----
      `,
      `
      ----
      -...
      -.M-
      ----
      `
    )
  })

  test('2x2と3x1が重なった場合(4)', () => {
    expectMatch(
      `
      ----
      -++-
      -+++
      ----
      `,
      `
      ----
      -.M-
      -...
      ----
      `
    )
  })

  test('2x2と3x1が重なった場合(5)', () => {
    expectMatch(
      `
      ----
      -++-
      -++-
      --+-
      `,
      `
      ----
      -..-
      -M.-
      --.-
      `
    )
  })

  test('2x2と3x1が重なった場合(6)', () => {
    expectMatch(
      `
      ----
      -++-
      -++-
      -+--
      `,
      `
      ----
      -..-
      -.M-
      -.--
      `
    )
  })

  test('2x2と3x1が重なった場合(7)', () => {
    expectMatch(
      `
      ----
      -++-
      +++-
      ----
      `,
      `
      ----
      -M.-
      ...-
      ----
      `
    )
  })

  test('2x2と3x1が重なった場合(8)', () => {
    expectMatch(
      `
      ----
      +++-
      -++-
      ----
      `,
      `
      ----
      ...-
      -M.-
      ----
      `
    )
  })

  test('2x2と複数の3x1が重なった場合、1つの3x1だけ消える', () => {
    expectMatch(
      `
      -++-
      -++-
      -++-
      `,
      `
      -..-
      -.M-
      -.+-
      `
    )
  })
})
