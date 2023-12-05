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
  findMatches
} from './move'

function createBoard(
  expr: string,
  options: {
    upstream?: string
    mouse?: string
    ice?: string
    killers?: Killers
  } = {}
): Board {
  const tokens = dedent(expr)
    .split('\n')
    .map(line => [...line])

  const board = new Board(tokens[0].length, tokens.length)
  for (const [y, line] of tokens.entries()) {
    for (const [x, token] of line.entries()) {
      board.setPiece([x + 1, y + 1], new Piece(parseFace(token, x + 1, y + 1)))
    }
  }

  if (options.upstream !== undefined) {
    updateUpstream(board, options.upstream)
  }

  if (options.mouse !== undefined) {
    updateMouse(board, options.mouse)
  }

  if (options.ice !== undefined) {
    updateIce(board, options.ice)
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

function updateMouse(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, new Piece({ kind: Kind.Mouse, count }, piece.ice))
  }
}

function updateIce(board: Board, expr: string): void {
  for (const [pos, count] of digitToken(expr)) {
    const piece = board.piece(pos)
    board.setPiece(pos, new Piece(piece.face, count))
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
})
