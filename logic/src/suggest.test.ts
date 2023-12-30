import dedent from 'ts-dedent'
import { describe, expect, test } from 'vitest'
import { Board, Kind, createPiece, type Face } from './board'
import { suggest } from './suggest'

function createBoard(expr: string): Board {
  const tokens = dedent(expr)
    .split('\n')
    .map(line => [...line])

  const board = Board.create(tokens[0].length, tokens.length)
  for (const [y, line] of tokens.entries()) {
    for (const [x, token] of line.entries()) {
      board.setPiece(
        [x + 1, y + 1],
        createPiece(parseFace(token, x + 1, y + 1))
      )
    }
  }

  return board
}

function parseFace(token: string, x: number, y: number): Face {
  if (token === '+') return Kind.Red
  if (token === '-') return ([Kind.Green, Kind.Yellow] as const)[(x + y) % 2]
  return Kind.Out
}

describe('suggest', () => {
  test('3x1 マッチを探す', () => {
    const board = createBoard(
      `
      ++-
      --+
      `
    )
    const suggests = suggest(board)
    expect(suggests).toHaveLength(3)
    expect(suggests).toContainEqual([1, 1])
    expect(suggests).toContainEqual([2, 1])
    expect(suggests).toContainEqual([3, 2])
  })
})
