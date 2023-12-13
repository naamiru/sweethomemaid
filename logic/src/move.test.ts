import dedent from 'ts-dedent'
import { describe, expect, test } from 'vitest'
import {
  Board,
  Kind,
  Piece,
  type Face,
  type Killers,
  type Position
} from './board'
import {
  Direction,
  InvalidMove,
  Move,
  applyMove,
  fall,
  findMatches,
  positionToInt
} from './move'
import { GeneralMap, GeneralSet } from './utils'

function createBoard(
  expr: string,
  options: {
    upstream?: string
    link?: Array<[Position, Position]>
    fallFrom?: string
    mouse?: string
    ice?: string
    chain?: string
    killers?: Killers
  } = {}
): Board {
  const tokens = dedent(expr)
    .split('\n')
    .map(line => [...line])

  const board = Board.create(tokens[0].length, tokens.length)
  for (const [y, line] of tokens.entries()) {
    for (const [x, token] of line.entries()) {
      board.setPiece([x + 1, y + 1], new Piece(parseFace(token, x + 1, y + 1)))
    }
  }

  if (options.upstream !== undefined) {
    updateUpstream(board, options.upstream)
  }

  if (options.link !== undefined) {
    updateLink(board, options.link)
  }

  if (options.fallFrom !== undefined) {
    updateFallFrom(board, options.fallFrom)
  }

  if (options.mouse !== undefined) {
    updateMouse(board, options.mouse)
  }

  if (options.ice !== undefined) {
    updateIce(board, options.ice)
  }

  if (options.chain !== undefined) {
    updateChain(board, options.chain)
  }

  if (options.killers !== undefined) {
    board.killers = options.killers
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

function updateUpstream(board: Board, expr: string): void {
  for (const [[x, y], token] of tokens(expr)) {
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
      board.setUpstream([x, y], [x + diff[0], y + diff[1]])
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

function updateMouse(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(
      pos,
      new Piece({ kind: Kind.Mouse, count }, piece.ice, piece.chain)
    )
  }
}

function updateIce(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, new Piece(piece.face, count, piece.chain))
  }
}

function updateChain(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, new Piece(piece.face, piece.ice, count))
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
  function expectFall(
    initial: string,
    upstream: string,
    expected: string
  ): void {
    const board = createBoard(initial, { upstream })
    fall(board)
    const expectedBoard = createBoard(expected)
    expect(board.pieces).toEqual(expectedBoard.pieces)
  }

  test('空位置に不明なピースが落下', () => {
    expectFall(
      `
      -.-
      ---
      `,
      '',
      `
      -x-
      ---
      `
    )
  })

  test('空位置に上流のピースが落下', () => {
    expectFall(
      `
      -+-
      -.-
      ---
      `,
      '',
      `
      -x-
      -+-
      ---
      `
    )
  })

  test('カスタムフロー', () => {
    expectFall(
      `
      --.-
      r.r-
      ----
      `,
      `
      lldd
      llld
      llll
      `,
      `
      --r-
      xxr-
      ----
      `
    )
  })

  test('直線的な落下が優先 左寄り', () => {
    expectFall(
      `
      -b--
      -r--
      -..-
      `,
      `
      uuuu
      uuuu
      uu1u
      `,
      `
      -x--
      -x--
      -rb-
      `
    )
  })

  test('直線的な落下が優先 右寄り', () => {
    expectFall(
      `
      --b-
      --r-
      -..-
      `,
      `
      uuuu
      uuuu
      u3uu
      `,
      `
      --x-
      --x-
      -br-
      `
    )
  })
})

describe('fallWithChain', () => {
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
        r.
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
        rx
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
    board.setPiece([2, 2], new Piece(piece.face, 0, 0.5))

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
})

describe('applyMove', () => {
  function moved(initial: string, move: Move): Board {
    const board = createBoard(initial)
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
    expect(board.pieces).toEqual(expectedBoard.pieces)
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
    expectMove('rbrb', new Move([1, 1], Direction.Right, true), 'brrb')
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

  test('ネズミをロケットで減らす', () => {
    expectMove(
      createBoard('H-.-', { mouse: '..2.' }),
      new Move([1, 1], Direction.Zero),
      createBoard('xx.x', { mouse: '..1.' })
    )
  })

  test('ネズミをロケットで消す', () => {
    expectMove(
      createBoard('H-.-', { mouse: '..1.' }),
      new Move([1, 1], Direction.Zero),
      createBoard('xxxx')
    )
  })

  test('ネズミをロケットで減らす キラー1', () => {
    expectMove(
      createBoard('H-.-', { mouse: '..3.', killers: { mouse: { rocket: 1 } } }),
      new Move([1, 1], Direction.Zero),
      createBoard('xx.x', { mouse: '..1.' })
    )
  })

  test('ネズミをロケットで消す キラー1', () => {
    expectMove(
      createBoard('H-.-', { mouse: '..2.', killers: { mouse: { rocket: 1 } } }),
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
})
