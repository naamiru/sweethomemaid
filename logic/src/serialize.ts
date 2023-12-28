import { Board, Piece, type Face, type Killers, type Position } from './board'
import { positionToInt } from './move'
import { GeneralMap, GeneralSet } from './utils'

type PieceData = { face: Face; ice: number; chain: number; jelly: number }

export function serialize(board: Board): {
  piece: PieceData[][]
  killers: Killers
  links: Array<[Position, Position[]]>
  fallFromLeftPositions: Position[]
} {
  return {
    piece: board.pieces.map(col => col.map(serializePiece)),
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
  killers,
  links,
  fallFromLeftPositions
}: {
  piece: PieceData[][]
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
    killers,
    new GeneralMap(positionToInt, links),
    new GeneralSet(positionToInt, fallFromLeftPositions)
  )
}
