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

  Mouse
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

export type Face =
  | Exclude<Kind, Kind.Mouse>
  | { kind: Kind.Mouse; count: number }

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

export class Piece {
  constructor(
    public readonly face: Face,
    public readonly ice = 0
  ) {}

  get kind(): Kind {
    return getKind(this.face)
  }

  isBooster(): boolean {
    return isBooster(this.face)
  }

  isColor(): boolean {
    return isColor(this.face)
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
}

export type Position = [number, number]

export class Board {
  pieces: Piece[][]
  upstreams: Position[][]
  killers: Killers

  // 落下処理を行う順に並べた位置。
  // move.ts でのみ使うが、キャッシュのため Board インスタンスに持たせる
  fallablePositions: Position[] | undefined = undefined

  constructor(width: number, height: number) {
    this.pieces = Array.from({ length: width + 2 }, () =>
      Array.from({ length: height + 2 }, () => new Piece(Kind.Out))
    )
    this.upstreams = Array.from({ length: width + 2 }, (_, x) =>
      Array.from({ length: height + 2 }, (_, y) => [x, y - 1])
    )
    this.killers = {}
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
    this.pieces[position[0]][position[1]] = piece
  }

  upstream(position: Position): Position {
    return this.upstreams[position[0]][position[1]]
  }

  setUpstream(position: Position, upstream: Position): void {
    this.upstreams[position[0]][position[1]] = upstream
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
    return 0
  }

  maxKiller(type: keyof Killers): number {
    const killer = this.killers[type]
    if (killer === undefined) return 0
    return Math.max(killer.bomb ?? 0, killer.rocket ?? 0, killer.missile ?? 0)
  }
}
