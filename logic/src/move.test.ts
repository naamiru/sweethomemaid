import dedent from 'ts-dedent'
import { describe, expect, test } from 'vitest'
import {
  Board,
  Direction,
  Kind,
  createPiece,
  type Face,
  type Killers,
  type Position
} from './board'
import {
  InvalidMove,
  Move,
  Skill,
  applyMove,
  fall,
  findMatches,
  positionToInt
} from './move'
import { GeneralMap, GeneralSet } from './utils'

function createBoard(
  expr: string,
  options: {
    link?: Array<[Position, Position]>
    fallFrom?: string
    mouse?: string
    ice?: string
    chain?: string
    jelly?: string
    mikan?: string
    web?: string
    killers?: Killers
    upstreams?: string
  } = {}
): Board {
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

  if (options.link !== undefined) updateLink(board, options.link)
  if (options.fallFrom !== undefined) updateFallFrom(board, options.fallFrom)
  if (options.mouse !== undefined) updateMouse(board, options.mouse)
  if (options.ice !== undefined) updateIce(board, options.ice)
  if (options.chain !== undefined) updateChain(board, options.chain)
  if (options.jelly !== undefined) updateJelly(board, options.jelly)
  if (options.mikan !== undefined) updateMikan(board, options.mikan)
  if (options.web !== undefined) updateWeb(board, options.web)
  if (options.killers !== undefined) board.killers = options.killers
  if (options.upstreams !== undefined) updateUpstream(board, options.upstreams)

  return board
}

function parseFace(token: string, x: number, y: number): Face {
  if (token === '+') return Kind.Red
  if (token === '-') return ([Kind.Green, Kind.Yellow] as const)[(x + y) % 2]
  if (token === 'r') return Kind.Red
  if (token === 'b') return Kind.Blue
  if (token === 'g') return Kind.Green
  if (token === 'y') return Kind.Yellow
  if (token === 'a') return Kind.Aqua
  if (token === 'p') return Kind.Pink
  if (token === '.') return Kind.Empty
  if (token === 'M') return Kind.Missile
  if (token === 'H') return Kind.HRocket
  if (token === 'V') return Kind.VRocket
  if (token === 'B') return Kind.Bomb
  if (token === 'S') return Kind.Special
  if (token === 'x') return Kind.Unknown
  return Kind.Out
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

function updateMouse(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
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

function updateIce(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      createPiece(piece.face, count, piece.chain, piece.jelly)
    )
  }
}

function updateChain(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, createPiece(piece.face, piece.ice, count, piece.jelly))
  }
}

function updateJelly(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, createPiece(piece.face, piece.ice, piece.chain, count))
  }
}

function updateMikan(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
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

function updateWeb(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const cell = board.cell(pos)
    board.setCell(pos, { ...cell, web: count })
  }
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

function* digitToken(expr: string): Generator<[Position, number], void, void> {
  for (const [pos, token] of tokens(expr)) {
    if (/^\d+$/.test(token)) {
      const value = parseInt(token, 10)
      if (value > 0) yield [pos, parseInt(token, 10)]
    }
  }
}

describe('findMatch', () => {
  function expectMatch(initial: string, expected: string): void {
    const board = createBoard(initial)
    for (const match of findMatches(board)) {
      for (const position of match.positions) {
        board.setPiece(position, createPiece(Kind.Empty))
      }
      if (match.booster !== undefined) {
        board.setPiece(match.booster.position, createPiece(match.booster.kind))
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

  test('1つの並びが複数の並びと交わる場合', () => {
    expectMatch(
      `
      +++-
      -+--
      -+++
      `,
      `
      ...-
      -B--
      -.++
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

describe('fall', () => {
  function expectFall(initial: Board, expected: Board): void {
    if (initial.links === undefined)
      initial.links = new GeneralMap(positionToInt)
    fall(initial)
    expect(initial.pieces).toEqual(expected.pieces)
  }

  test('空位置に不明なピースが落下', () => {
    expectFall(
      createBoard(
        `
        -.-
        ---
        `
      ),
      createBoard(
        `
        -x-
        ---
        `
      )
    )
  })

  test('空位置に上流のピースが落下', () => {
    expectFall(
      createBoard(
        `
        -+-
        -.-
        ---
        `
      ),
      createBoard(
        `
        -x-
        -+-
        ---
        `
      )
    )
  })

  test('直線的な落下が優先 左寄り', () => {
    expectFall(
      createBoard(
        `
        b_
        r_
        ..
        `
      ),
      createBoard(
        `
        x_
        x_
        rb
        `
      )
    )
  })

  test('直線的な落下が優先 右寄り', () => {
    expectFall(
      createBoard(
        `
        _b
        _r
        ..
        `
      ),
      createBoard(
        `
        _x
        _x
        br
        `
      )
    )
  })

  test('優先度が同じであれば右側が落下', () => {
    expectFall(
      createBoard(
        `
        r___y
        _._._
        __.__
        `
      ),
      createBoard(
        `
        x___x
        _r_x_
        __y__
        `
      )
    )
  })

  test('優先度が同じ場合に左が落ちるように設定', () => {
    expectFall(
      createBoard(
        `
        r___y
        _._._
        __.__
        `,
        {
          fallFrom: `
          .___.
          _._._
          __l__
          `
        }
      ),
      createBoard(
        `
        x___x
        _x_y_
        __r__
        `
      )
    )
  })

  test('直前に斜め移動していない方が優先的に落下', () => {
    expectFall(
      createBoard(
        `
        r__y
        ._._
        _.__
        `
      ),
      createBoard(
        `
        x__x
        x_y_
        _r__
        `
      )
    )
  })

  test('直前でない斜め移動は落下に影響しない', () => {
    expectFall(
      createBoard(
        `
        r__y
        ._._
        ._._
        _.__
        `
      ),
      createBoard(
        `
        x__x
        x_x_
        r_x_
        _y__
        `
      )
    )
  })

  test('下にある方が先に落下', () => {
    expectFall(
      createBoard(
        `
        ._y
        r_.
        _._
        `
      ),
      createBoard(
        `
        x_x
        x_y
        _r_
        `
      )
    )
  })

  test('角通常落下', () => {
    expectFall(
      createBoard(
        `
        _b
        r.
        ..
        `
      ),
      createBoard(
        `
        _x
        xx
        rb
        `
      )
    )
  })

  test('角 リンクした落下', () => {
    expectFall(
      createBoard(
        `
        _b
        ry
        ..
        `,
        {
          link: [
            [
              [1, 2],
              [2, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        _x
        bx
        ry
        `
      )
    )
  })

  test('リンク箇所にピースがない場合は効果がない', () => {
    expectFall(
      createBoard(
        `
        _b
        ..
        ..
        `,
        {
          link: [
            [
              [1, 2],
              [2, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        _x
        xx
        xb
        `
      )
    )
  })

  test('リンク落下 右側', () => {
    expectFall(
      createBoard(
        `
        g_y
        _r_
        .__
        `,
        {
          link: [
            [
              [2, 2],
              [3, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        g_x
        _y_
        r__
        `
      )
    )
  })

  test('リンク落下 左側', () => {
    expectFall(
      createBoard(
        `
        g_y
        _r_
        .__
        `,
        {
          link: [
            [
              [2, 2],
              [1, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        x_y
        _g_
        r__
        `
      )
    )
  })

  test('直線的なリンクが優先される', () => {
    expectFall(
      createBoard(
        `
        _g
        rb
        ..
        `,
        {
          link: [
            [
              [1, 2],
              [2, 1]
            ],
            [
              [2, 2],
              [2, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        _x
        xg
        rb
        `
      )
    )
  })

  test('障害物がない場合リンクは機能しない', () => {
    expectFall(
      createBoard(
        `
        gy
        rb
        .y
        `,
        {
          link: [
            [
              [1, 2],
              [2, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        xy
        gb
        ry
        `
      )
    )
  })

  test('ワープリンク', () => {
    expectFall(
      createBoard(
        `
        rb
        __
        ..
        `,
        {
          link: [
            [
              [1, 3],
              [1, 1]
            ],
            [
              [2, 3],
              [2, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        xx
        __
        rb
        `
      )
    )
  })

  test('下にあるピースが落ちている途中の斜めへの落下', () => {
    expectFall(
      createBoard(
        `
        _g
        .r
        ..
        `
      ),
      createBoard(
        `
        _x
        xx
        gr
        `
      )
    )
  })

  test('リンクによって下にあるピースが落ちている途中の斜めへの落下をしない', () => {
    expectFall(
      createBoard(
        `
        _g
        .r
        ..
        `,
        {
          link: [
            [
              [2, 2],
              [2, 1]
            ]
          ]
        }
      ),
      createBoard(
        `
        _x
        xg
        xr
        `
      )
    )
  })

  test('下落下中は斜めに落下しない', () => {
    expectFall(
      createBoard(
        `
        _b
        _r
        ..
        ..
        `
      ),
      createBoard(
        `
        _x
        _x
        xb
        xr
        `
      )
    )
  })

  test('鎖は落下しない', () => {
    expectFall(
      createBoard(
        `
        rb
        yg
        ..
        `,
        {
          chain: `
          00
          01
          00
          `
        }
      ),
      createBoard(
        `
        xb
        xg
        yr
        `,
        {
          chain: `
          00
          01
          00
          `
        }
      )
    )
  })

  test('1未満の鎖は1step後に消える', () => {
    const board = createBoard(
      `
      rb
      yg
      ..
      `
    )
    const piece = board.piece([2, 2])
    board.setPiece([2, 2], createPiece(piece.face, 0, 0.5))

    expectFall(
      board,
      createBoard(
        `
        xx
        rb
        yg
        `
      )
    )
  })

  test('上への落下', () => {
    expectFall(
      createBoard(
        `
        ..
        yg
         r
        `,
        {
          upstreams: `
          dd
          dd
          dd
          `
        }
      ),
      createBoard(
        `
        yg
        xr
         x
        `
      )
    )
  })

  test('右への落下', () => {
    expectFall(
      createBoard(
        `
        rg.
         y.
        `,
        {
          upstreams: `
          lll
          lll
          `
        }
      ),
      createBoard(
        `
        xrg
         xy
        `
      )
    )
  })

  test('左への落下', () => {
    expectFall(
      createBoard(
        `
        .gr
        .y
        `,
        {
          upstreams: `
          rrr
          rrr
          `
        }
      ),
      createBoard(
        `
        grx
        yx
        `
      )
    )
  })

  test('上に落下後右に落下', () => {
    expectFall(
      createBoard(
        `
        br.
        g
        `,
        {
          upstreams: `
          dll
          d
          `
        }
      ),
      createBoard(
        `
        gbr
        x
        `
      )
    )
  })

  test('上落下時の左右優先順位 右', () => {
    expectFall(
      createBoard(
        `
        _.
        r b
        `,
        {
          upstreams: `
          ddd
          ddd
          `,
          fallFrom: `
          _r
          . .
          `
        }
      ),
      createBoard(
        `
        _r
        x b
        `
      )
    )
  })

  test('上落下時の左右優先順位 左', () => {
    expectFall(
      createBoard(
        `
        _._
        r b
        `,
        {
          upstreams: `
          ddd
          ddd
          `,
          fallFrom: `
          _l_
          . .
          `
        }
      ),
      createBoard(
        `
        _b_
        r x
        `
      )
    )
  })

  test('右落下時の左右優先順位 右', () => {
    expectFall(
      createBoard(
        `
        r_
         .
        b
        `,
        {
          upstreams: `
          ll
          ll
          ll
          `,
          fallFrom: `
          .
           r
          .
          `
        }
      ),
      createBoard(
        `
        x_
         r
        b
        `
      )
    )
  })

  test('右落下時の左右優先順位 左', () => {
    expectFall(
      createBoard(
        `
        r_
         .
        b
        `,
        {
          upstreams: `
          ll
          ll
          ll
          `,
          fallFrom: `
          .
           l
          .
          `
        }
      ),
      createBoard(
        `
        r_
         b
        x
        `
      )
    )
  })

  test('左落下時の左右優先順位 右', () => {
    expectFall(
      createBoard(
        `
        _r
        .
         b
        `,
        {
          upstreams: `
          rr
          rr
          rr
          `,
          fallFrom: `
          _.
          r
           .
          `
        }
      ),
      createBoard(
        `
        _r
        b
         x
        `
      )
    )
  })

  test('左落下時の左右優先順位 左', () => {
    expectFall(
      createBoard(
        `
        _r
        .
         b
        `,
        {
          upstreams: `
          rr
          rr
          rr
          `,
          fallFrom: `
          _.
          l
           .
          `
        }
      ),
      createBoard(
        `
        _x
        r
         b
        `
      )
    )
  })

  test('最上段ではない空きマスへの落下', () => {
    expectFall(
      createBoard(
        `
        bb
        r.
        r.
        `,
        {
          chain: `
          11
          00
          00
          `
        }
      ),
      createBoard(
        `
        bb
        ..
        rr
        `,
        {
          chain: `
          11
          00
          00
          `
        }
      )
    )
  })
})

describe('applyMove', () => {
  function moved(initial: Board | string, move: Move): Board {
    const board = initial instanceof Board ? initial : createBoard(initial)
    applyMove(board, move)
    return board
  }

  function expectMove(
    initial: Board | string,
    move: Move,
    expected: Board | string
  ): void {
    const board = initial instanceof Board ? initial : createBoard(initial)
    applyMove(board, move)
    const expectedBoard =
      expected instanceof Board ? expected : createBoard(expected)
    expect(board.pieces, 'pieces').toEqual(expectedBoard.pieces)
    expect(board.cells, 'cells').toEqual(expectedBoard.cells)
  }

  test('盤面外は動かせない', () => {
    expect(() => moved('- -', new Move([1, 1], Direction.Right))).toThrowError(
      InvalidMove
    )
  })

  test('空位置は動かせない', () => {
    expect(() => moved('-.-', new Move([1, 1], Direction.Right))).toThrowError(
      InvalidMove
    )
  })

  test('不明ピースは動かせない', () => {
    expect(() => moved('-x-', new Move([1, 1], Direction.Right))).toThrowError(
      InvalidMove
    )
  })

  test('色のその場起動は無効', () => {
    expect(() => moved('-', new Move([1, 1], Direction.Zero))).toThrowError(
      InvalidMove
    )
  })

  test('氷は動かせない', () => {
    expect(() => {
      applyMove(
        createBoard('---', { ice: '010' }),
        new Move([1, 1], Direction.Right)
      )
    }).toThrowError(InvalidMove)
  })

  test('マッチしない色は動かせない', () => {
    expect(() => moved('rbrb', new Move([1, 1], Direction.Right))).toThrowError(
      InvalidMove
    )
  })

  test('スワップスキル使用時はマッチしない色を動かせる', () => {
    expectMove('rbrb', new Move([1, 1], Direction.Right, Skill.Swap), 'brrb')
  })

  test('マッチした色が消える', () => {
    expectMove('rbrr', new Move([1, 1], Direction.Right), 'bxxx')
  })

  test('マッチした色が連鎖して消える', () => {
    expectMove(
      `
      rbbr
      rbrr
      `,
      new Move([1, 2], Direction.Right),
      `
      xxxx
      rxxr
      `
    )
  })

  test('ブースター位置を操作位置に合わせる 横4', () => {
    expectMove(
      `
      grgg
      rbrr
      `,
      new Move([2, 1], Direction.Down),
      `
      xbxx
      gVgg
      `
    )
  })

  test('ブースター位置を操作位置に合わせる 横4 反対方向', () => {
    expectMove(
      `
      grgg
      rbrr
      `,
      new Move([2, 2], Direction.Up),
      `
      xbxx
      gVgg
      `
    )
  })

  test('スペシャルはその場起動できない', () => {
    expect(() => moved('-S-', new Move([2, 1], Direction.Zero))).toThrowError(
      InvalidMove
    )
  })

  test('スペシャル起動', () => {
    expectMove('Srbrb', new Move([1, 1], Direction.Right), 'xxbxb')
  })

  test('ボムその場起動', () => {
    expectMove(
      `
      gygygyg
      rbrbrbr
      gygygyg
      rbrBrbr
      gygygyg
      rbrbrbr
      gygygyg
      `,
      new Move([4, 4], Direction.Zero),
      `
      gxxxxxg
      rxxxxxr
      gxxxxxg
      ryxxxyr
      gbxxxbg
      rbgygbr
      gygygyg
      `
    )
  })

  test('ボムずらし起動', () => {
    expectMove(
      `
      gygygyg
      rbrbrbr
      gygygyg
      rbBrrbr
      gygygyg
      rbrbrbr
      gygygyg
      `,
      new Move([3, 4], Direction.Right),
      `
      gxxxxxg
      rxxxxxr
      gxxxxxg
      ryxxxyr
      gbxxxbg
      rbgygbr
      gygygyg
      `
    )
  })

  test('横ロケットその場起動', () => {
    expectMove(
      `
      gygygyg
      rbrHrbr
      gygygyg
      `,
      new Move([4, 2], Direction.Zero),
      `
      xxxxxxx
      gygygyg
      gygygyg
      `
    )
  })

  test('横ロケットずらし起動', () => {
    expectMove(
      `
      gygygyg
      rbrHrbr
      gygygyg
      `,
      new Move([4, 2], Direction.Down),
      `
      xxxxxxx
      gygygyg
      rbryrbr
      `
    )
  })

  test('縦ロケットその場起動', () => {
    expectMove(
      `
      gyg
      rVr
      gyg
      `,
      new Move([2, 2], Direction.Zero),
      `
      gxg
      rxr
      gxg
      `
    )
  })

  test('縦ロケットずらし起動', () => {
    expectMove(
      `
      gyg
      rVr
      gyg
      `,
      new Move([2, 2], Direction.Left),
      `
      xyg
      xrr
      xyg
      `
    )
  })

  test('ミサイルその場起動', () => {
    expectMove(
      `
      rbrbr
      gygyg
      rbMbr
      gygyg
      rbrbr
      `,
      new Move([3, 3], Direction.Zero),
      `
      rxxxr
      gbxbg
      ryxyr
      gyryg
      rbrbr
      `
    )
  })

  test('ミサイルずらし起動', () => {
    expectMove(
      `
      rbrbr
      gygyg
      rbMbr
      gygyg
      rbrbr
      `,
      new Move([3, 3], Direction.Right),
      `
      rbxxx
      gyrxr
      rbgxg
      gygbg
      rbrbr
      `
    )
  })

  test('ミサイル誘爆', () => {
    expectMove(
      `
      HbV
      gyg
      rbr
      `,
      new Move([1, 1], Direction.Zero),
      `
      xxx
      gyx
      rbx
      `
    )
  })

  test('ミサイル誘爆 多段', () => {
    expectMove(
      `
      HbV
      gyg
      VbH
      `,
      new Move([1, 1], Direction.Zero),
      `
      xxx
      xxx
      xyx
      `
    )
  })

  test('移動でできたブースターは誘爆しない', () => {
    expectMove(
      `
      brbb
      rVrr
      `,
      new Move([2, 1], Direction.Down),
      `
      xxxx
      bVbb
      `
    )
  })

  test('氷を消す', () => {
    expectMove(
      createBoard('rbrr', { ice: '0012' }),
      new Move([1, 1], Direction.Right),
      createBoard('bxrr', { ice: '0001' })
    )
  })

  test('氷をスペシャルで消す キラーは効かない', () => {
    expectMove(
      createBoard('Srbrr', {
        ice: '00012',
        killers: { ice: { bomb: 1, rocket: 1, missile: 1 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xxbrr', { ice: '00001' })
    )
  })

  test('氷をボムで消す', () => {
    expectMove(
      createBoard('B---', { ice: '0123' }),
      new Move([1, 1], Direction.Zero),
      createBoard('x---', { ice: '0013' })
    )
  })

  test('氷をボムで消す キラー1', () => {
    expectMove(
      createBoard('B---', { ice: '0123', killers: { ice: { bomb: 1 } } }),
      new Move([1, 1], Direction.Zero),
      createBoard('x---', { ice: '0003' })
    )
  })

  test('氷をボムで消す キラー2', () => {
    expectMove(
      createBoard('B---', { ice: '0345', killers: { ice: { bomb: 2 } } }),
      new Move([1, 1], Direction.Zero),
      createBoard('x---', { ice: '0015' })
    )
  })

  test('氷をロケットで消す', () => {
    expectMove(
      createBoard('H---', { ice: '0123' }),
      new Move([1, 1], Direction.Zero),
      createBoard('x---', { ice: '0012' })
    )
  })

  test('氷をロケットで消す キラー1', () => {
    expectMove(
      createBoard('H---', { ice: '0123', killers: { ice: { rocket: 1 } } }),
      new Move([1, 1], Direction.Zero),
      createBoard('x---', { ice: '0001' })
    )
  })

  test('氷をミサイルで消す', () => {
    expectMove(
      createBoard('--M--', { ice: '01023' }),
      new Move([3, 1], Direction.Zero),
      createBoard('--x--', { ice: '00013' })
    )
  })

  test('氷をミサイルで消す キラー1', () => {
    expectMove(
      createBoard('--M--', { ice: '01023', killers: { ice: { missile: 1 } } }),
      new Move([3, 1], Direction.Zero),
      createBoard('--x--', { ice: '00003' })
    )
  })

  test('ネズミをロケットで消す', () => {
    expectMove(
      createBoard('H-.-', { mouse: '..2.' }),
      new Move([1, 1], Direction.Zero),
      createBoard('xxxx')
    )
  })

  test('スペシャル+スペシャルで全消し', () => {
    expectMove(
      `
      SS.
      ...
      `,
      new Move([1, 1], Direction.Right),
      `
      xxx
      xxx
      `
    )
  })

  test('スペシャル+スペシャルは最大キラーが乗る', () => {
    expectMove(
      createBoard('SS--', {
        ice: '0045',
        killers: { ice: { bomb: 1, rocket: 2, missile: 3 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xx--', { ice: '0001' })
    )
  })

  test('スペシャル+ボムで全消し、ボムのキラーが乗る', () => {
    expectMove(
      createBoard('SB----', {
        ice: '000123',
        killers: { ice: { bomb: 1, rocket: 2, missile: 3 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xxx---', { ice: '000001' })
    )
  })

  test('スペシャル+ロケットで全消し、ロケットのキラーが乗る', () => {
    expectMove(
      createBoard('SV----', {
        ice: '000123',
        killers: { ice: { bomb: 3, rocket: 1, missile: 2 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xxx---', { ice: '000001' })
    )
  })

  test('スペシャル+ミサイルで全消し、ミサイルのキラーが乗る', () => {
    expectMove(
      createBoard('SM----', {
        ice: '000123',
        killers: { ice: { bomb: 2, rocket: 3, missile: 1 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xxx---', { ice: '000001' })
    )
  })

  test('ボム+ボム', () => {
    // 爆発前にずらした位置への落下処理が入ることに注意
    expectMove(
      `
      rbrbrbrbr
      gygygygyg
      rbrbrbrbr
      gygygygyg
      rbrBBbrbr
      gygygygyg
      rbrbrbrbr
      gygygygyg
      rbrbrbrrb
      `,
      new Move([4, 5], Direction.Right),
      `
      rxxxxxxxr
      gxxxxxxxg
      rxxxxxxxr
      gbxxxxxbg
      ryxxxxxyr
      gbrxxxrbg
      rbgxxxgbr
      gygxrbgyg
      rbrbrbrrb
      `
    )
  })

  test('ボム+ボム ボムのキラーが乗る', () => {
    expectMove(
      createBoard('BB--', {
        ice: '0023',
        killers: { ice: { bomb: 1 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xx--', { ice: '0001' })
    )
  })

  test('ボム+ロケット', () => {
    expectMove(
      `
      rbrbr
      gygyg
      rHBbr
      gygyg
      rbrbr
      `,
      new Move([2, 3], Direction.Right),
      `
      xxxxx
      xxxxx
      xxxxx
      rxxxr
      rxxxr
      `
    )
  })

  test('ボム+ロケット ロケットのキラーが乗る', () => {
    expectMove(
      createBoard('HB--', {
        ice: '0023',
        killers: { ice: { bomb: 2, rocket: 1 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xx--', { ice: '0001' })
    )
  })

  test('ロケット+ロケット', () => {
    // 爆発前にずらした位置への落下処理が入ることに注意
    expectMove(
      `
      rbrbr
      gygyg
      rHHbr
      gygyg
      rbrbr
      `,
      new Move([2, 3], Direction.Right),
      `
      xxxxx
      rxxbr
      gbxyg
      gyxyg
      rbxbr
      `
    )
  })

  test('ロケット+ロケット ロケットのキラーが乗る', () => {
    expectMove(
      createBoard('VV--', {
        ice: '0023',
        killers: { ice: { bomb: 2, rocket: 1 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xx--', { ice: '0001' })
    )
  })

  test('ミサイル+ミサイル', () => {
    expectMove(
      `
      rbrbr
      gygyg
      rMMbr
      gygyg
      rbrbr
      `,
      new Move([2, 3], Direction.Right),
      `
      rxxxr
      gxxxg
      rxxxr
      gxrbg
      rbrbr
      `
    )
  })

  test('ミサイル+ミサイル ミサイルのキラーが乗る', () => {
    expectMove(
      createBoard('MM--', {
        ice: '0023',
        killers: { ice: { bomb: 2, missile: 1 } }
      }),
      new Move([1, 1], Direction.Right),
      createBoard('xx--', { ice: '0003' })
    )
  })

  test('風呂ひまり子スキル', () => {
    expectMove(
      `
      rbr
      gyg
      rbr
      `,
      new Move([2, 2], Direction.Zero, Skill.CrossRockets),
      `
      xxx
      rxr
      rxr
      `
    )
  })

  test('風呂ひまり子スキル ロケットのキラーが乗る', () => {
    expectMove(
      createBoard('---', {
        ice: '023',
        killers: { ice: { bomb: 2, rocket: 1 } }
      }),
      new Move([1, 1], Direction.Zero, Skill.CrossRockets),
      createBoard('x--', { ice: '001' })
    )
  })

  test('風呂ニアスキル', () => {
    expectMove(
      `
      rbrbr
      gygyg
      rbrbr
      gygyg
      rbrbr
      `,
      new Move([3, 3], Direction.Zero, Skill.H3Rockets),
      `
      xxxxx
      xxxxx
      xxxxx
      rbrbr
      rbrbr
      `
    )
  })

  test('風呂ニアスキル ロケットのキラーが乗る', () => {
    expectMove(
      createBoard('---', {
        ice: '023',
        killers: { ice: { bomb: 2, rocket: 1 } }
      }),
      new Move([1, 1], Direction.Zero, Skill.H3Rockets),
      createBoard('x--', { ice: '001' })
    )
  })

  test('ゼリーは動かせない 移動元', () => {
    expect(() =>
      moved(
        createBoard('rbrr', { jelly: '1000' }),
        new Move([1, 1], Direction.Right)
      )
    ).toThrowError(InvalidMove)
  })

  test('ゼリーは動かせない 移動先', () => {
    expect(() =>
      moved(
        createBoard('rbrr', { jelly: '0100' }),
        new Move([1, 1], Direction.Right)
      )
    ).toThrowError(InvalidMove)
  })

  test('ゼリーはマッチしない', () => {
    expect(() =>
      moved(
        createBoard('rbrr', { jelly: '0010' }),
        new Move([1, 1], Direction.Right)
      )
    ).toThrowError(InvalidMove)
  })

  test('ゼリーをブースターで消す', () => {
    expectMove(
      createBoard('Hrrr', { jelly: '0012' }),
      new Move([1, 1], Direction.Zero),
      createBoard('xxrr', { jelly: '0001' })
    )
  })

  test('ゼリーをブースターで消す キラー1', () => {
    expectMove(
      createBoard('Hrrrr', {
        jelly: '00123',
        killers: { jelly: { rocket: 1 } }
      }),
      new Move([1, 1], Direction.Zero),
      createBoard('xxrrr', { jelly: '00001' })
    )
  })

  test('蜘蛛の巣は動かせない 移動元', () => {
    expect(() =>
      moved(
        createBoard('rbrr', { web: '1000' }),
        new Move([1, 1], Direction.Right)
      )
    ).toThrowError(InvalidMove)
  })

  test('蜘蛛の巣は動かせない 移動先', () => {
    expect(() =>
      moved(
        createBoard('rbrr', { web: '0100' }),
        new Move([1, 1], Direction.Right)
      )
    ).toThrowError(InvalidMove)
  })

  test('蜘蛛の巣の中身はマッチするが蜘蛛の巣は消えない', () => {
    expectMove(
      createBoard('rbrr', { web: '0010' }),
      new Move([1, 1], Direction.Right),
      createBoard('bxxx', { web: '0010' })
    )
  })

  test('蜘蛛の巣をブースターで消す', () => {
    expectMove(
      createBoard('Hrbr', { web: '0012' }),
      new Move([1, 1], Direction.Zero),
      createBoard('xxbr', { web: '0001' })
    )
  })

  test('蜘蛛の巣をブースターで消す キラー1', () => {
    expectMove(
      createBoard('Hrbrb', {
        web: '00123',
        killers: { web: { rocket: 1 } }
      }),
      new Move([1, 1], Direction.Zero),
      createBoard('xxbrb', { web: '00001' })
    )
  })

  test('ミサイル作成 下落下', () => {
    expectMove(
      `
      yrg
      gry
      ryg
      gry
      `,
      new Move([1, 3], Direction.Right),
      `
      yxg
      gxy
      yxg
      gHy
      `
    )
  })

  test('ミサイル作成 右落下', () => {
    expectMove(
      createBoard(
        `
        gygy
        rryr
        ygrg
        `,
        {
          upstreams: `
          llll
          llll
          llll
          `
        }
      ),
      new Move([3, 3], Direction.Up),
      `
      gygy
      xxxV
      ygyg
      `
    )
  })

  test('供給ピース指定', () => {
    const board = createBoard('Br')
    const move = new Move([1, 1], Direction.Zero)
    applyMove(board, move, { suppliedPieces: [createPiece(Kind.Blue)] })
    const expectedBoard = createBoard('bb')
    expect(board.pieces).toEqual(expectedBoard.pieces)
  })
})
