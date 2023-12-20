import { Board, Piece, type Face, type Killers, type Position } from './board'
import { positionToInt } from './move'
import { GeneralMap, GeneralSet } from './utils'

export function serialize(board: Board): {
  piece: Array<Array<{ face: Face; ice: number; chain: number }>>
  upstreams: Position[][]
  killers: Killers
  fallablePositions: Position[] | undefined
  links: Array<[Position, Position[]]> | undefined
  fallFromLeftPositions: Position[]
} {
  return {
    piece: board.pieces.map(col => col.map(serializePiece)),
    upstreams: board.upstreams,
    killers: board.killers,
    fallablePositions: board.fallablePositions,
    links: board.links === undefined ? undefined : [...board.links.entries()],
    fallFromLeftPositions: [...(board.fallFromLeftPositions ?? [])]
  }
}

function serializePiece(piece: Piece): {
  face: Face
  ice: number
  chain: number
} {
  return {
    face: piece.face,
    ice: piece.ice,
    chain: piece.chain
  }
}

export function deserialize({
  piece,
  upstreams,
  killers,
  fallablePositions,
  links,
  fallFromLeftPositions
}: {
  piece: Array<Array<{ face: Face; ice: number; chain: number }>>
  upstreams: Position[][]
  killers: Killers
  fallablePositions: Position[] | undefined
  links: Array<[Position, Position[]]> | undefined
  fallFromLeftPositions: Position[]
}): Board {
  return new Board(
    piece.map(col =>
      col.map(({ face, ice, chain }) => new Piece(face, ice, chain))
    ),
    upstreams,
    killers,
    fallablePositions,
    links === undefined ? undefined : new GeneralMap(positionToInt, links),
    new GeneralSet(positionToInt, fallFromLeftPositions)
  )
}
