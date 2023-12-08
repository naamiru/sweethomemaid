import { Kind, range, type Position } from '@sweethomemaid/logic'
import classNames from 'classnames'
import { type ReactNode } from 'react'
import './BoardView.css'
import PieceView from './PieceView'
import { useApp } from './app/use-app'

export default function BoardView(): ReactNode {
  const { board } = useApp()
  return (
    <div className="board-view">
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
