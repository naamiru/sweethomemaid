import {
  Board,
  type Direction,
  type Killers,
  type Piece,
  type Position
} from './board'
import { positionToInt } from './move'
import { GeneralMap, GeneralSet } from './utils'

type BoardData = {
  pieces: Piece[][]
  upstreams: Direction[][]
  killers: Killers
  links: Array<[Position, Position[]]>
  fallFromLeftPositions: Position[]
}

export function serialize(board: Board): BoardData {
  return {
    pieces: board.pieces,
    upstreams: board.upstreams,
    killers: board.killers,
    links: board.links === undefined ? [] : [...board.links.entries()],
    fallFromLeftPositions: [...(board.fallFromLeftPositions ?? [])]
  }
}

export function deserialize({
  pieces,
  upstreams,
  killers,
  links,
  fallFromLeftPositions
}: BoardData): Board {
  return new Board(
    pieces,
    upstreams,
    killers,
    new GeneralMap(positionToInt, links),
    new GeneralSet(positionToInt, fallFromLeftPositions)
  )
}
