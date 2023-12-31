import { Kind, range, type Position } from '@sweethomemaid/logic'
import classNames from 'classnames'
import { type ReactNode } from 'react'
import './BoardView.css'
import PieceView from './PieceView'
import { useApp } from './app/use-app'

const PIECE_SIZE = 64

export default function BoardView(): ReactNode {
  const { board, isHandlingPiece, isPlaying, activeSkill } = useApp()
  return (
    <div
      className="board-view"
      style={{
        width: `${board.width * PIECE_SIZE}px`,
        height: `${board.height * PIECE_SIZE}px`
      }}
    >
      {!isHandlingPiece && !isPlaying && activeSkill === undefined && (
        <div className="animation-reference" />
      )}
      <div className="pieces is-bg">
        {range(1, board.height + 1).map(y => (
          <div className="row" key={y}>
            {range(1, board.width + 1).map(x => (
              <BackgroundPiece position={[x, y]} key={x} />
            ))}
          </div>
        ))}
      </div>
      <div className="pieces">
        {range(1, board.height + 1).map(y => (
          <div className="row" key={y}>
            {range(1, board.width + 1).map(x => (
              <PieceView position={[x, y]} key={x} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function BackgroundPiece({ position }: { position: Position }): ReactNode {
  const { pieces } = useApp()
  const piece = pieces[position[0]][position[1]]
  return (
    <div
      className={classNames('background-piece', {
        'is-out': piece.face === Kind.Out
      })}
    >
      <div className="piece" />
    </div>
  )
}
