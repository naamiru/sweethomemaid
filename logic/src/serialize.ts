import { Board, Piece, type Face, type Killers, type Position } from './board'
import { positionToInt } from './move'
import { GeneralMap, GeneralSet } from './utils'

type PieceData = { face: Face; ice: number; chain: number; jelly: number }

export function serialize(board: Board): {
  piece: PieceData[][]
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
  fallablePositions,
  links,
  fallFromLeftPositions
}: {
  piece: PieceData[][]
  upstreams: Position[][]
  killers: Killers
  fallablePositions: Position[] | undefined
  links: Array<[Position, Position[]]> | undefined
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
    fallablePositions,
    links === undefined ? undefined : new GeneralMap(positionToInt, links),
    new GeneralSet(positionToInt, fallFromLeftPositions)
  )
}
