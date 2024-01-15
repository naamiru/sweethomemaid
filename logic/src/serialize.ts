import {
  Board,
  type Cell,
  type Direction,
  type Killers,
  type Piece,
  type Position
} from './board'
import { positionToInt } from './move'
import { GeneralMap, GeneralSet } from './utils'

type BoardData = {
  pieces: Piece[][]
  cells: Cell[][]
  upstreams: Direction[][]
  killers: Killers
  links: Array<[Position, Position[]]>
  fallFromLeftPositions: Position[]
}

export function serialize(board: Board): BoardData {
  return {
    pieces: board.pieces,
    cells: board.cells,
    upstreams: board.upstreams,
    killers: board.killers,
    links: board.links === undefined ? [] : [...board.links.entries()],
    fallFromLeftPositions: [...(board.fallFromLeftPositions ?? [])]
  }
}

export function deserialize({
  pieces,
  cells,
  upstreams,
  killers,
  links,
  fallFromLeftPositions
}: BoardData): Board {
  return new Board(
    pieces,
    cells,
    upstreams,
    killers,
    new GeneralMap(positionToInt, links),
    new GeneralSet(positionToInt, fallFromLeftPositions)
  )
}
