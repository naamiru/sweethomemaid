import PriorityQueue from 'ts-priority-queue'
import { Kind, Piece, type Board, type Booster, type Position } from './stage'
import { NotImplemented, range } from './utils'

export enum Direction {
  Up,
  Down,
  Left,
  Right,
  Zero
}

export type Move = {
  position: Position
  direction: Direction
  swapSkill?: boolean
}

/** 揃っている色の並びと、それによってできるブースター */
class Match {
  constructor(
    public positions: Position[] = [],
    public booster:
      | {
          kind: Booster
          position: Position
        }
      | undefined = undefined
  ) {}
}

/** 縦横軸 */
enum Axis {
  H, // 横
  V // 縦
}

class Line {
  constructor(
    public axis: Axis,
    public position: Position, // 左上の座標
    public length: number
  ) {}

  get x(): number {
    return this.position[0]
  }

  get y(): number {
    return this.position[1]
  }

  positions(): Position[] {
    if (this.axis === Axis.H) {
      return range(this.x, this.x + this.length).map(x => [x, this.y])
    } else {
      return range(this.y, this.y + this.length).map(y => [this.x, y])
    }
  }

  /** 中心位置。偶数長の時は右上に寄せる */
  center(): Position {
    if (this.axis === Axis.H) {
      return [this.x + Math.ceil((this.length - 1) / 2), this.y]
    } else {
      return [this.x, this.y + Math.floor((this.length - 1) / 2)]
    }
  }

  /**
   * Line上の指定位置の点を取り除いて分割する。
   * 長さ3未満の分割されたLineは返さない。
   */
  split(position: Position): Line[] {
    const lines: Line[] = []
    const [x, y] = position
    if (this.axis === Axis.H) {
      if (x - this.x >= 3) {
        lines.push(new Line(Axis.H, this.position, x - this.x))
      }
      if (this.x + this.length - 1 - x >= 3) {
        lines.push(
          new Line(Axis.H, [x + 1, this.y], this.x + this.length - 1 - x)
        )
      }
    } else {
      if (y - this.y >= 3) {
        lines.push(new Line(Axis.V, this.position, y - this.y))
      }
      if (this.y + this.length - 1 - y >= 3) {
        lines.push(
          new Line(Axis.V, [this.x, y + 1], this.y + this.length - 1 - y)
        )
      }
    }
    return lines
  }
}

export class InvalidMove extends Error {
  static {
    this.prototype.name = 'InvalidMove'
  }
}

class BoardMove {
  constructor(
    public board: Board,
    public move: Move
  ) {}

  get swapSkill(): boolean {
    return this.move.swapSkill ?? false
  }

  private diff(): [number, number] {
    switch (this.move.direction) {
      case Direction.Up:
        return [0, -1]
      case Direction.Down:
        return [0, 1]
      case Direction.Left:
        return [-1, 0]
      case Direction.Right:
        return [1, 0]
      case Direction.Zero:
        return [0, 0]
    }
  }

  positions(): Position[] {
    return [this.move.position, add(this.move.position, this.diff())]
  }

  uniquePositions(): Position[] {
    return this.move.direction === Direction.Zero
      ? [this.move.position]
      : this.positions()
  }

  pieces(): Piece[] {
    return this.positions().map(pos => this.board.piece(pos))
  }

  boosterCount(): number {
    return this.uniquePositions().filter(pos =>
      this.board.piece(pos).isBooster()
    ).length
  }

  swap(): void {
    const [from, to] = this.positions()
    const piece = this.board.piece(to)
    this.board.setPiece(to, this.board.piece(from))
    this.board.setPiece(from, piece)
  }
}

function add(position: Position, diff: [number, number]): Position {
  return [position[0] + diff[0], position[1] + diff[1]]
}

function isFixedPiece(piece: Piece): boolean {
  if (piece.ice > 0) return true
  return (
    piece.face === Kind.Out ||
    piece.face === Kind.Empty ||
    piece.face === Kind.Unknown
  )
}

export function applyMove(board: Board, move: Move): void {
  const mv = new BoardMove(board, move)

  if (mv.pieces().some(isFixedPiece)) {
    throw InvalidMove
  }

  if (move.direction === Direction.Zero) {
    const [piece] = mv.pieces()
    if (!piece.isBooster() || piece.face === Kind.Special) {
      throw InvalidMove
    }
  }

  if (mv.boosterCount() === 2 && !mv.swapSkill) {
    // ブースター結合は未実装
    throw NotImplemented
  }

  mv.swap()
  let matches = findMatches(board)

  if (matches.length === 0 && mv.boosterCount() === 0 && !mv.swapSkill) {
    mv.swap()
    throw InvalidMove
  }

  do {
    applyMatches(board, matches)
    fall(board)
    matches = findMatches(board)
  } while (matches.length > 0)
}

/** 揃っている色を探す  */
export function findMatches(board: Board): Match[] {
  const matches: Match[] = []

  const lineMap = createLineMap(board)

  // 5個以上の列を消す
  // fix: 6個以上は一度に消えない
  for (const line of [...lineMap.lines]) {
    if (line.length < 5) continue
    matches.push(
      new Match(line.positions(), {
        kind: Kind.Special,
        position: line.center()
      })
    )
    lineMap.delete(line)
  }

  // Bomb の並びを消す
  // 十字, L字, T字 の順で優先される？
  for (const [[x, y], lines] of lineMap.crosses()) {
    const [hLine, vLine] =
      lines[0].axis === Axis.H ? lines : [lines[1], lines[0]]

    let sx: number // 横列の開始点（Line長が4以上の場合は hLine.x と異なる）
    let sy: number // 縦列の開始点（Line長が4以上の場合は vLine.y と異なる）
    let isL = true // L字かどうか

    if (
      hLine.x < x &&
      x < hLine.x + hLine.length - 1 &&
      vLine.y < y &&
      y < vLine.y + vLine.length - 1
    ) {
      // 十字
      sx = x - 1
      sy = y - 1
      isL = false
    } else {
      // L字 または T字
      if (hLine.x <= x - 2) {
        sx = x - 2
      } else if (hLine.x + hLine.length - 1 >= x + 2) {
        sx = x
      } else {
        sx = x - 1
        isL = false
      }
      if (vLine.y <= y - 2) {
        sy = y - 2
      } else if (vLine.y + vLine.length - 1 >= y + 2) {
        sy = y
      } else {
        sy = y - 1
        isL = false
      }
    }

    matches.push(
      new Match(
        range(0, 3)
          .map(i => [sx + i, y] as Position) // 横列
          .filter(([px, py]) => px !== x || py !== y) // 縦列と重複する点を除く
          .concat(range(0, 3).map(i => [x, sy + i] as Position)), // 縦列
        {
          kind: Kind.Bomb,
          position: isL ? [x, y] : [sx + 1, sy + 1]
        }
      )
    )
    for (const line of [...lines]) {
      lineMap.delete(line)
    }
  }

  // 4個の並びを消す
  for (const line of [...lineMap.lines]) {
    if (line.length !== 4) continue
    matches.push(
      new Match(line.positions(), {
        kind: line.axis === Axis.H ? Kind.VRocket : Kind.HRocket,
        position: line.center()
      })
    )
    lineMap.delete(line)
  }

  return matches.concat(
    Array.from(lineMap.lines).map(line => new Match(line.positions()))
  )
}

// Line とそれらが占める位置を保持する
class LineMap {
  lines: Set<Line>
  map: Map<number, Line[]>

  constructor() {
    this.lines = new Set()
    this.map = new Map()
  }

  mapKey(position: Position): number {
    return position[0] * 10 + position[1]
  }

  decodeMapKey(key: number): Position {
    return [Math.floor(key / 10), key % 10]
  }

  add(line: Line): void {
    this.lines.add(line)
    for (const position of line.positions()) {
      const key = this.mapKey(position)
      const lines = this.map.get(key)
      if (lines !== undefined) {
        lines.push(line)
      } else {
        this.map.set(key, [line])
      }
    }
  }

  delete(line: Line): void {
    this.lines.delete(line)
    for (const position of line.positions()) {
      const key = this.mapKey(position)
      const lines = this.map.get(key)
      if (lines === undefined) continue
      const index = lines.indexOf(line)
      if (index === -1) continue
      if (lines.length === 1) {
        this.map.delete(key)
      } else {
        lines.splice(index, 1)
      }
    }
  }

  linesAt(position: Position): Line[] | undefined {
    return this.map.get(this.mapKey(position))
  }

  crosses(): Array<[Position, Line[]]> {
    const crosses: Array<[Position, Line[]]> = []
    for (const [key, lines] of this.map) {
      if (lines.length === 2) {
        crosses.push([this.decodeMapKey(key), lines])
      }
    }
    return crosses
  }
}

function createLineMap(board: Board): LineMap {
  const lineMap = new LineMap()

  // 長い順、横優先でソート
  const lines = new PriorityQueue<Line>({
    comparator: (a, b) =>
      a.length !== b.length ? b.length - a.length : a.axis - b.axis
  })
  for (const line of findLines(board)) {
    lines.queue(line)
  }

  // 長さ5以上の並びが交差した場合は短い方を分割
  while (lines.length > 0) {
    const line = lines.dequeue()
    let splitted = false
    for (const position of line.positions()) {
      const crosses = lineMap.linesAt(position)
      if (crosses !== undefined && crosses[0].length >= 5) {
        for (const subline of line.split(position)) {
          lines.queue(subline)
        }
        splitted = true
        break
      }
    }
    if (!splitted) {
      lineMap.add(line)
    }
  }

  return lineMap
}

/** 同一色3つ以上の並びを探す */
function findLines(board: Board): Line[] {
  const lines: Line[] = []

  // 横の並び
  for (const y of range(1, board.height + 1)) {
    let sx = 1 // 左端位置
    while (sx < board.width - 1) {
      const piece = board.piece([sx, y])
      if (!piece.isColor()) {
        sx += 1
        continue
      }
      // 右端位置を盤面外まで走査
      for (const x of range(sx + 1, board.width + 2)) {
        if (board.piece([x, y]).face !== piece.face) {
          // [sx:x, y] が同一色
          if (x - sx >= 3) {
            lines.push(new Line(Axis.H, [sx, y], x - sx))
          }
          sx = x
          break
        }
      }
    }
  }

  // 縦の並び
  for (const x of range(1, board.width + 1)) {
    let sy = 1 // 上端位置
    while (sy < board.height - 1) {
      const piece = board.piece([x, sy])
      if (!piece.isColor()) {
        sy += 1
        continue
      }
      // 右端位置を盤面外まで走査
      for (const y of range(sy + 1, board.height + 2)) {
        if (board.piece([x, y]).face !== piece.face) {
          // [x, sy:y] が同一色
          if (y - sy >= 3) {
            lines.push(new Line(Axis.V, [x, sy], y - sy))
          }
          sy = y
          break
        }
      }
    }
  }

  return lines
}

function applyMatches(board: Board, matches: Match[]): void {
  for (const match of matches) {
    for (const position of match.positions) {
      board.setPiece(position, new Piece(Kind.Empty))
    }
  }
}

function fall(board: Board): void {
  throw NotImplemented
}
