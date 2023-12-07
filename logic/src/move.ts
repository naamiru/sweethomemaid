import PriorityQueue from 'ts-priority-queue'
import {
  Kind,
  Piece,
  isColor,
  type Board,
  type Booster,
  type Color,
  type Position
} from './board'
import { GeneralSet, partition, range } from './utils'

export enum Direction {
  Up,
  Down,
  Left,
  Right,
  Zero
}

export class Move {
  constructor(
    public position: Position,
    public direction: Direction,
    public swapSkill: boolean = false
  ) {}

  private diff(): [number, number] {
    switch (this.direction) {
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
    return [this.position, add(this.position, this.diff())]
  }
}

export class InvalidMove extends Error {
  static {
    this.prototype.name = 'InvalidMove'
  }
}

export enum MoveScene {
  Swap,
  Match,
  Fall
}

export function applyMove(board: Board, move: Move): void {
  // eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
  for (const _ of moveScenes(board, move)) {
  }
}

export function* moveScenes(
  board: Board,
  move: Move
): Generator<MoveScene, void, void> {
  const mv = new BoardMove(board, move)

  if (mv.pieces().some(isFixedPiece)) {
    throw new InvalidMove()
  }

  if (move.direction === Direction.Zero) {
    const [piece] = mv.pieces()
    if (!piece.isBooster() || piece.face === Kind.Special) {
      throw new InvalidMove()
    }
  }

  // ブースターコンボの起点になるピース
  let comboTriggerPiece: Piece | undefined

  if (mv.isCombo()) {
    comboTriggerPiece = board.piece(move.position)
    // ブースターコンボの起点は除去して落下で埋める
    fallAt(board, move.position, mv.positions()[1])
  } else {
    mv.swap()
  }

  // ブースター起動前に色のマッチを取得。まだ消さない
  let matches = findMatches(board).map(match =>
    fixBoosterPosition(match, mv.positions())
  )

  // マッチがなければ元に戻して終了
  if (
    comboTriggerPiece === undefined &&
    matches.length === 0 &&
    mv.boosterCount() === 0 &&
    !mv.swapSkill
  ) {
    mv.swap()
    throw new InvalidMove()
  }

  yield MoveScene.Swap

  // ブースターを起動
  let skips: GeneralSet<Position> | undefined
  if (
    comboTriggerPiece !== undefined ||
    (!move.swapSkill && mv.boosterCount() > 0)
  ) {
    let boosterPosition: Position
    let booster: Booster | [Booster, Booster] | [Kind.Special, Color]

    if (comboTriggerPiece !== undefined) {
      boosterPosition = mv.positions()[1]
      const [p1, p2] = [comboTriggerPiece, board.piece(boosterPosition)]
      if (p1.isBooster() && p2.isBooster()) {
        booster = [p1.face as Booster, p2.face as Booster]
      } else if (p1.isColor()) {
        booster = [Kind.Special, p1.face as Color]
      } else {
        booster = [Kind.Special, p2.face as Color]
      }
    } else {
      const [pos, bst] = mv.booster() as [Position, Booster]
      boosterPosition = pos
      booster = bst
    }

    const effects = boosterEffects(board, boosterPosition, booster)
    applyBoosterEffects(board, boosterPosition, effects)
    skips = new GeneralSet(positionToInt, [...effects.values()].flat())
  }

  do {
    applyMatches(board, matches, skips)
    skips = undefined
    yield MoveScene.Match
    const falled = fall(board)
    if (falled) yield MoveScene.Fall
    matches = findMatches(board)
  } while (matches.length > 0)
}

export function canMove(board: Board, move: Move): boolean {
  const mv = new BoardMove(board, move)

  if (mv.pieces().some(isFixedPiece)) {
    return false
  }

  if (move.direction === Direction.Zero) {
    const [piece] = mv.pieces()
    return piece.isBooster() && piece.face !== Kind.Special
  }

  if (mv.swapSkill) {
    return true
  }

  if (mv.boosterCount() > 0) {
    return true
  }

  mv.swap()
  const hasMatch = findMatches(board).length > 0
  mv.swap()

  return hasMatch
}

export function isCombo(board: Board, move: Move): boolean {
  return new BoardMove(board, move).isCombo()
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

class BoardMove {
  constructor(
    public board: Board,
    public move: Move
  ) {}

  get swapSkill(): boolean {
    return this.move.swapSkill ?? false
  }

  positions(): Position[] {
    return this.move.positions()
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

  booster(): [Position, Booster] | undefined {
    for (const pos of this.positions()) {
      const piece = this.board.piece(pos)
      if (piece.isBooster()) return [pos, piece.face as Booster]
    }
    return undefined
  }

  color(): Color | undefined {
    for (const pos of this.positions()) {
      const piece = this.board.piece(pos)
      if (piece.isColor()) return piece.face as Color
    }
    return undefined
  }

  isCombo(): boolean {
    if (this.swapSkill) return false
    if (this.move.direction === Direction.Zero) return false
    const [p1, p2] = this.pieces()
    if (p1.isBooster() && p2.isBooster()) return true
    if (
      (p1.face === Kind.Special && p2.isColor()) ||
      (p1.isColor() && p2.face === Kind.Special)
    )
      return true
    return false
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

  // 2x2 の並びを消す
  for (const [sx, sy] of findSquares(
    board,
    new GeneralSet(positionToInt, matches.map(m => m.positions).flat())
  )) {
    const positions = new GeneralSet(positionToInt)
    const overlaps = new Set<Line>() // 2x2 と重なる 3x1

    for (const pos of squarePositions([sx, sy])) {
      positions.add(pos)
      // 2x2 と重なる 3x1 を探す
      const lines = lineMap.linesAt(pos)
      if (lines !== undefined) {
        for (const line of lines) overlaps.add(line)
      }
    }

    const bosterPosition: Position = [sx + 1, sy + 1]

    if (overlaps.size > 0) {
      // 重なった 3x1 の内1つだけを同時に消す
      // 複数の 3x1 が重なっている場合の優先順は不明
      const [line] = overlaps
      for (const pos of line.positions()) positions.add(pos)
      // 重なり方によって booster ができる位置が変わる
      if (
        (line.axis === Axis.H && line.x < sx) ||
        (line.axis === Axis.V && line.x > sx)
      ) {
        bosterPosition[0] = sx
      }
      if (
        (line.axis === Axis.V && line.y < sy) ||
        (line.axis === Axis.H && line.y > sy)
      ) {
        bosterPosition[1] = sy
      }

      for (const line of overlaps) lineMap.delete(line)
    }

    matches.push(
      new Match([...positions], {
        kind: Kind.Missile,
        position: bosterPosition
      })
    )
  }

  // 残りは3個の並びのみ
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

  add(line: Line): void {
    this.lines.add(line)
    for (const position of line.positions()) {
      const key = positionToInt(position)
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
      const key = positionToInt(position)
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
    return this.map.get(positionToInt(position))
  }

  crosses(): Array<[Position, Line[]]> {
    const crosses: Array<[Position, Line[]]> = []
    for (const [key, lines] of this.map) {
      if (lines.length === 2) {
        crosses.push([intToPosition(key), lines])
      }
    }
    return crosses
  }
}

function positionToInt(position: Position): number {
  return position[0] * 10 + position[1]
}

function intToPosition(key: number): Position {
  return [Math.floor(key / 10), key % 10]
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

/** 同色 2x2 を探して左上の座標を返す。重なりなし。 */
function findSquares(board: Board, mask: GeneralSet<Position>): Position[] {
  const positions: Position[] = []

  for (const y of range(1, board.height + 1)) {
    let x = 0
    while (x < board.width + 1) {
      const targets = squarePositions([x, y])
      // 他のマッチで使用済みかチェック
      if (targets.some(pos => mask.has(pos))) {
        x += 1
        continue
      }
      // 同一色チェック
      const piece = board.piece([x, y])
      if (
        piece.isColor() &&
        targets.slice(1).every(pos => board.piece(pos).face === piece.face)
      ) {
        positions.push([x, y])
        for (const pos of targets) mask.add(pos)
        x += 2
        continue
      }
      x += 1
    }
  }

  return positions
}

/** 左上を起点とした 2x2 の対象領域 */
function squarePositions(position: Position): Position[] {
  const [x, y] = position
  return [
    [x, y],
    [x + 1, y],
    [x, y + 1],
    [x + 1, y + 1]
  ]
}

function fixBoosterPosition(match: Match, positions: Position[]): Match {
  if (match.booster === undefined) return match
  for (const position of positions) {
    if (
      match.positions.some(
        pos => pos[0] === position[0] && pos[1] === position[1]
      )
    ) {
      return new Match(match.positions, { kind: match.booster.kind, position })
    }
  }
  return match
}

function applyMatches(
  board: Board,
  matches: Match[],
  skips: GeneralSet<Position> | undefined
): void {
  for (const match of matches) {
    for (const position of match.positions) {
      if (skips !== undefined && skips.has(position)) continue
      board.setPiece(position, matchedPiece(board, board.piece(position)))
    }
    if (
      match.booster !== undefined &&
      board.piece(match.booster.position).face === Kind.Empty
    ) {
      board.setPiece(match.booster.position, new Piece(match.booster.kind))
    }
  }
}

type BoosterCombo = Booster | [Booster, Booster] | [Kind.Special, Color]

function boosterEffects(
  board: Board,
  position: Position,
  booster: BoosterCombo
): Map<Booster | Kind.Empty, Position[]> {
  const effects = new Map<Booster | Kind.Empty, Position[]>()
  const appeared = new GeneralSet(positionToInt, [position])

  const boosters: Array<[Position, BoosterCombo]> = [[position, booster]]

  while (boosters.length > 0) {
    const posAndBooster = boosters.shift()
    if (posAndBooster === undefined) break
    const [boosterPosition, combo] = posAndBooster
    const range = boosterRange(board, boosterPosition, combo).filter(
      pos => !appeared.has(pos)
    )
    if (range.length === 0) continue

    const booster = boosterEffectAs(combo)
    let positions = effects.get(booster)
    if (positions === undefined) {
      positions = []
      effects.set(booster, positions)
    }
    for (const pos of range) {
      appeared.add(pos)
      positions.push(pos)
      const piece = board.piece(pos)
      if (piece.isBooster()) {
        boosters.push([pos, piece.face as Booster])
      }
    }
  }

  return effects
}

function boosterRange(
  board: Board,
  position: Position,
  booster: BoosterCombo
): Position[] {
  const [cx, cy] = position

  const positions: Position[] = []
  function append(pos: Position): void {
    const [x, y] = pos
    if (x === cx && y === cy) return
    if (x < 1 || x > board.width || y < 1 || y > board.height) return
    const piece = board.piece(pos)
    if (
      piece.face === Kind.Out ||
      piece.face === Kind.Empty ||
      piece.face === Kind.Unknown
    )
      return
    positions.push(pos)
  }

  if (booster instanceof Array) {
    if (isColor(booster[1])) {
      // スペシャル + 色
      const color = booster[1]
      for (const pos of board.allPositions()) {
        if (board.piece(pos).face === color) {
          append(pos)
        }
      }
    } else {
      const [b1, b2] = booster
      if (b1 === Kind.Special || b2 === Kind.Special) {
        // スペシャルを含むコンボはとりあえず全消し
        for (const pos of board.allPositions()) {
          append(pos)
        }
      } else if (b1 === Kind.Bomb && b2 === Kind.Bomb) {
        // 中心 3x7 範囲
        for (let i = -1; i <= 1; i++) {
          for (let j = -3; j <= 3; j++) {
            append([cx + i, cy + j])
          }
        }
        // 中心の左右 1x5 範囲
        for (let j = -2; j <= 2; j++) {
          append([cx - 2, cy + j])
          append([cx + 2, cy + j])
        }
        // さらに左右 1x3 範囲
        for (let j = -1; j <= 1; j++) {
          append([cx - 3, cy + j])
          append([cx + 3, cy + j])
        }
      } else if (
        (b1 === Kind.Bomb && (b2 === Kind.HRocket || b2 === Kind.VRocket)) ||
        ((b1 === Kind.HRocket || b1 === Kind.VRocket) && b2 === Kind.Bomb)
      ) {
        // 横3列
        for (let x = 1; x <= board.width; x++) {
          append([x, cy - 1])
          append([x, cy])
          append([x, cy + 1])
        }
        // 縦3列
        for (let y = 1; y <= board.height; y++) {
          if (cy - 1 <= y && y <= cy + 1) continue // 横3列で追加済
          append([cx - 1, y])
          append([cx, y])
          append([cx + 1, y])
        }
      } else if (
        (b1 === Kind.HRocket || b1 === Kind.VRocket) &&
        (b2 === Kind.HRocket || b2 === Kind.VRocket)
      ) {
        for (let x = 1; x <= board.width; x++) {
          append([x, cy])
        }
        for (let y = 1; y <= board.height; y++) {
          append([cx, y])
        }
      } else if (b1 === Kind.Missile && b2 === Kind.Missile) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            append([cx + i, cy + j])
          }
        }
      }
      // ミサイルの飛び先は未対応
    }
  } else if (booster === Kind.Special) {
    // 誘発時のスペシャルは未対応。盤面中最多色が消える？
  } else if (booster === Kind.Bomb) {
    // 中心 3x5 範囲
    for (let i = -1; i <= 1; i++) {
      for (let j = -2; j <= 2; j++) {
        append([cx + i, cy + j])
      }
    }
    // 左右それぞれ 1x3 範囲
    for (let j = -1; j <= 1; j++) {
      append([cx - 2, cy + j])
      append([cx + 2, cy + j])
    }
  } else if (booster === Kind.HRocket) {
    for (let x = 1; x <= board.width; x++) {
      append([x, cy])
    }
  } else if (booster === Kind.VRocket) {
    for (let y = 1; y <= board.height; y++) {
      append([cx, y])
    }
  } else if (booster === Kind.Missile) {
    // 飛び先は未対応
    append([cx, cy])
    append([cx - 1, cy])
    append([cx + 1, cy])
    append([cx, cy - 1])
    append([cx, cy + 1])
  }

  return positions
}

function boosterEffectAs(booster: BoosterCombo): Booster | Kind.Empty {
  if (booster instanceof Array) {
    if (isColor(booster[1])) {
      // スペシャル + 色
      return Kind.Empty
    }
    const [b1, b2] = booster
    if (b1 === Kind.Special) return b2
    if (b2 === Kind.Special) return b1
    if (
      b1 === Kind.HRocket ||
      b1 === Kind.VRocket ||
      b2 === Kind.HRocket ||
      b2 === Kind.VRocket
    ) {
      return Kind.HRocket
    }
    if (b1 === Kind.Bomb || b2 === Kind.Bomb) return Kind.Bomb
    return Kind.Missile
  }
  return booster
}

function applyBoosterEffects(
  board: Board,
  position: Position,
  effects: Map<Booster | Kind.Empty, Position[]>
): void {
  board.setPiece(position, new Piece(Kind.Empty))
  for (const [booster, positions] of effects.entries()) {
    for (const pos of positions) {
      board.setPiece(
        pos,
        matchedPiece(
          board,
          board.piece(pos),
          booster === Kind.Empty ? undefined : booster
        )
      )
    }
  }
}

function matchedPiece(
  board: Board,
  piece: Piece,
  booster: Booster | undefined = undefined
): Piece {
  if (piece.ice > 0) {
    const count = 1 + board.killer('ice', booster)
    return new Piece(piece.face, Math.max(piece.ice - count, 0))
  }

  const face = piece.face

  if (face instanceof Object && face.kind === Kind.Mouse) {
    const count = 1 + board.killer('mouse', booster)
    if (count < face.count) {
      return new Piece({ kind: Kind.Mouse, count: face.count - count })
    } else {
      return new Piece(Kind.Empty)
    }
  }

  if (face instanceof Object && face.kind === Kind.Wood) {
    const count = 1 + board.killer('wood', booster)
    if (count < face.count) {
      return new Piece({ kind: Kind.Wood, count: face.count - count })
    } else {
      return new Piece(Kind.Empty)
    }
  }

  return new Piece(Kind.Empty)
}

export function fall(board: Board): boolean {
  let falled = false
  while (true) {
    const pos = findEmpty(board)
    if (pos === undefined) break
    falled = true
    fallAt(board, pos)
  }
  return falled
}

function fallAt(
  board: Board,
  position: Position,
  stop: Position | undefined = undefined
): void {
  if (position === stop) return

  const upstreamPosition = board.upstream(position)
  const upstreamPiece = board.piece(upstreamPosition)

  if (upstreamPiece.face === Kind.Out) {
    board.setPiece(position, new Piece(Kind.Unknown))
    return
  }

  board.setPiece(position, upstreamPiece)
  fallAt(board, upstreamPosition, stop)
}

function findEmpty(board: Board): Position | undefined {
  for (const pos of getFallablePositions(board)) {
    if (board.piece(pos).face === Kind.Empty) {
      return pos
    }
  }
  return undefined
}

function getFallablePositions(board: Board): Position[] {
  if (board.fallablePositions !== undefined) {
    return board.fallablePositions
  }

  // 下流マスを計算
  const downstreams: Position[][][] = Array.from(
    { length: board.width + 2 },
    () => Array.from({ length: board.height + 2 }, () => [])
  )
  for (const pos of board.allPositions()) {
    if (board.piece(pos).face === Kind.Out) continue
    const up = board.upstream(pos)
    if (board.piece(up).face === Kind.Out) continue
    downstreams[up[0]][up[1]].push(pos)
  }

  const positions = new GeneralSet(positionToInt)

  function register(root: Position): void {
    if (positions.has(root)) return
    positions.add(root)

    // 直線的な下流 -> 斜めな下流 の順で深さ優先で下流を登録
    const [straights, angles] = partition(
      downstreams[root[0]][root[1]],
      pos => pos[0] === root[0] || pos[1] === root[1]
    )
    for (const pos of straights) register(pos)
    for (const pos of angles) register(pos)
  }

  // 最上流マスから順次処理
  for (const pos of board.allPositions()) {
    if (
      board.piece(pos).face !== Kind.Out &&
      board.piece(board.upstream(pos)).face === Kind.Out
    ) {
      register(pos)
    }
  }

  board.fallablePositions = [...positions]
  return board.fallablePositions
}
