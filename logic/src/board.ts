import { type GeneralMap, type GeneralSet } from './utils'

export enum Kind {
  Out,
  Empty,

  Unknown,

  Red,
  Blue,
  Green,
  Yellow,
  Aqua,
  Pink,

  Special,
  Bomb,
  HRocket,
  VRocket,
  Missile,

  Mouse,
  Wood,
  Present,
  Mikan,
  Button
}

const boosters = [
  Kind.Special,
  Kind.Bomb,
  Kind.HRocket,
  Kind.VRocket,
  Kind.Missile
] as const

export type Booster = (typeof boosters)[number]

const colors = [
  Kind.Red,
  Kind.Blue,
  Kind.Green,
  Kind.Yellow,
  Kind.Aqua,
  Kind.Pink
] as const

export type Color = (typeof colors)[number]

const obstacles = [Kind.Mouse, Kind.Wood, Kind.Present, Kind.Button] as const

type Obstacle = (typeof obstacles)[number]

export type Face =
  | Exclude<Kind, Obstacle>
  | { kind: Obstacle; count: number }
  | { kind: Kind.Mikan; count: number; position: [0 | 1, 0 | 1] } // position: [x, y]

export function getKind(face: Face): Kind {
  if (face instanceof Object) {
    return face.kind
  }
  return face
}

export function isBooster(face: Face): face is Booster {
  return boosters.includes(face as Booster)
}

export function isColor(face: Face): face is Color {
  return colors.includes(face as Color)
}

export type Piece = {
  face: Face
  ice: number
  chain: number
  jelly: number
}

export function createPiece(face: Face, ice = 0, chain = 0, jelly = 0): Piece {
  return {
    face,
    ice,
    chain,
    jelly
  }
}

// 盤面の特定位置に固定されたギミック
export type Cell = {
  web: number
}

export function createCell(web = 0): Cell {
  return {
    web
  }
}

export type Killer = {
  bomb?: number
  rocket?: number
  missile?: number
}

export type Killers = {
  ice?: Killer
  mouse?: Killer
  wood?: Killer
  present?: Killer
  chain?: Killer
  jelly?: Killer
  mikan?: Killer
  button?: Killer
  web?: Killer
}

export type Position = [number, number]

export enum Direction {
  Up,
  Down,
  Left,
  Right,
  Zero
}

export class Board {
  constructor(
    public pieces: Piece[][],
    public cells: Cell[][],
    public upstreams: Direction[][],
    public killers: Killers,

    // ピースがリンクして落下する位置。
    // 下流 -> [上流]
    // 前にある位置を優先
    public links: GeneralMap<Position, Position[]> | undefined = undefined,

    // 優先度が同じ場合に右上、左上のどちらから落下してくるか
    // 左上から落下する位置を保持する。
    public fallFromLeftPositions: GeneralSet<Position> | undefined = undefined
  ) {}

  static create(width: number, height: number): Board {
    return new Board(
      Array.from({ length: width + 2 }, () =>
        Array.from({ length: height + 2 }, () => createPiece(Kind.Out))
      ),
      Array.from({ length: width + 2 }, () =>
        Array.from({ length: height + 2 }, () => createCell())
      ),
      Array.from({ length: width + 2 }, () =>
        Array.from({ length: height + 2 }, () => Direction.Up)
      ),
      {}
    )
  }

  get width(): number {
    return this.pieces.length - 2
  }

  get height(): number {
    return this.pieces[0].length - 2
  }

  piece(position: Position): Piece {
    return this.pieces[position[0]][position[1]]
  }

  setPiece(position: Position, piece: Piece): void {
    const [x, y] = position
    this.pieces = [
      ...this.pieces.slice(0, x),
      [...this.pieces[x].slice(0, y), piece, ...this.pieces[x].slice(y + 1)],
      ...this.pieces.slice(x + 1)
    ]
  }

  cell(position: Position): Cell {
    return this.cells[position[0]][position[1]]
  }

  setCell(position: Position, cell: Cell): void {
    const [x, y] = position
    this.cells = [
      ...this.cells.slice(0, x),
      [...this.cells[x].slice(0, y), cell, ...this.cells[x].slice(y + 1)],
      ...this.cells.slice(x + 1)
    ]
  }

  *allPositions(): Generator<Position, void, void> {
    for (let x = 1; x <= this.width; x++) {
      for (let y = 1; y <= this.height; y++) {
        yield [x, y]
      }
    }
  }

  killer(type: keyof Killers, booster: Booster | undefined): number {
    const killer = this.killers[type]
    if (killer === undefined || booster === undefined) return 0
    if (booster === Kind.Bomb) return killer.bomb ?? 0
    if (booster === Kind.HRocket || booster === Kind.VRocket)
      return killer.rocket ?? 0
    if (booster === Kind.Missile) return killer.missile ?? 0
    if (booster === Kind.Special)
      return Math.max(killer.bomb ?? 0, killer.rocket ?? 0, killer.missile ?? 0)
    return 0
  }

  upstream(position: Position): Direction {
    return this.upstreams[position[0]][position[1]]
  }

  getLinkedUpstreams(position: Position): Position[] {
    if (this.links === undefined) return []
    return this.links.get(position) ?? []
  }

  isFallFromLeft(position: Position): boolean {
    if (this.fallFromLeftPositions === undefined) return false
    return this.fallFromLeftPositions.has(position)
  }

  copy(): Board {
    return new Board(
      this.pieces,
      this.cells,
      this.upstreams,
      this.killers,
      this.links,
      this.fallFromLeftPositions
    )
  }
}
