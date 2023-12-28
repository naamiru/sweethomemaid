import {
  Board,
  Piece,
  type Direction,
  type Face,
  type Killers,
  type Position
} from './board'
import { positionToInt } from './move'
import { GeneralMap, GeneralSet } from './utils'

type PieceData = { face: Face; ice: number; chain: number; jelly: number }

export function serialize(board: Board): {
  piece: PieceData[][]
  upstreams: Direction[][]
  killers: Killers
  links: Array<[Position, Position[]]>
  fallFromLeftPositions: Position[]
} {
  return {
    piece: board.pieces.map(col => col.map(serializePiece)),
    upstreams: board.upstreams,
    killers: board.killers,
    links: board.links === undefined ? [] : [...board.links.entries()],
    fallFromLeftPositions: [...(board.fallFromLeftPositions ?? [])]
  }
}

function serializePiece(piece: Piece): {
  face: Face
  ice: number
  chain: number
  jelly: number
} {
  return {
    face: piece.face,
    ice: piece.ice,
    chain: piece.chain,
    jelly: piece.jelly
  }
}

export function deserialize({
  piece,
  upstreams,
  killers,
  links,
  fallFromLeftPositions
}: {
  piece: PieceData[][]
  upstreams: Direction[][]
  killers: Killers
  links: Array<[Position, Position[]]>
  fallFromLeftPositions: Position[]
}): Board {
  return new Board(
    piece.map(col =>
      col.map(
        ({ face, ice, chain, jelly }) => new Piece(face, ice, chain, jelly)
      )
    ),
    upstreams,
    killers,
    new GeneralMap(positionToInt, links),
    new GeneralSet(positionToInt, fallFromLeftPositions)
  )
}
