import {
  Direction,
  searchGoodMoves,
  type GoodMoves,
  type Move
} from '@sweethomemaid/logic'
import classNames from 'classnames'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import './GoodMove.css'
import { useApp } from './app/use-app'

const CONDITION_NAMES = [
  ['hasSpecialCombo', 'スペシャルコンボ'],
  ['hasSpecial', 'スペシャル'],
  ['hasBombCombo', 'ボムコンボ'],
  ['hasBomb', 'ボム'],
  ['hasRocket', 'ロケット']
]

export default function GoodMove(): ReactNode {
  const [goodMoves, setGoodMoves] = useState<GoodMoves>({})
  const { board, histories, historyIndex, isPlaying, useSwapSkill } = useApp()
  useEffect(() => {
    setGoodMoves(searchGoodMoves(board.copy(), useSwapSkill))
  }, [board, histories, historyIndex, useSwapSkill])

  const [selectedMoves, setSelectedMoves] = useState<Move[]>([])
  function selectMoves(step: number, condition: string): void {
    if (goodMoves[step]?.[condition] === undefined) return
    setSelectedMoves(goodMoves[step][condition])
  }
  function unselectMoves(): void {
    setSelectedMoves([])
  }

  return (
    <>
      <div className={classNames('good-move', { 'is-disabled': isPlaying })}>
        {[1, 2].map(
          step =>
            step in goodMoves && (
              <div className="step" key={step}>
                <div className="num">{step}手</div>
                <div className="conditions">
                  {CONDITION_NAMES.map(
                    ([key, label]) =>
                      key in goodMoves[step] && (
                        <span
                          className="tag is-medium"
                          key={key}
                          onMouseEnter={() => {
                            selectMoves(step, key)
                          }}
                          onMouseLeave={unselectMoves}
                        >
                          {label}
                        </span>
                      )
                  )}
                </div>
              </div>
            )
        )}
      </div>
      {selectedMoves.length > 0 && <GoodMoveOverlay moves={selectedMoves} />}
    </>
  )
}

const DirectionIconName: Record<Direction, string> = {
  [Direction.Up]: 'arrow-up',
  [Direction.Down]: 'arrow-down',
  [Direction.Left]: 'arrow-left',
  [Direction.Right]: 'arrow-right',
  [Direction.Zero]: 'circle-dot'
}

const DirectionName: Record<Direction, string> = {
  [Direction.Up]: 'up',
  [Direction.Down]: 'down',
  [Direction.Left]: 'left',
  [Direction.Right]: 'right',
  [Direction.Zero]: 'zero'
}

function GoodMoveOverlay({ moves }: { moves: Move[] }): ReactNode {
  const { board } = useApp()

  const bounds = useMemo(() => {
    const rect = document.querySelector('.board-view')?.getBoundingClientRect()
    if (rect === undefined) return new DOMRect(0, 0, 0, 0)

    return new DOMRect(
      rect.x + window.scrollX,
      rect.y + window.scrollY,
      rect.width,
      rect.height
    )
  }, [])

  const contents = useMemo(() => {
    const unit = bounds.width / board.width

    return moves.map(move => ({
      x: (move.position[0] - 0.5) * unit,
      y: (move.position[1] - 0.5) * unit,
      icon: DirectionIconName[move.direction],
      direction: DirectionName[move.direction],
      swapSkill: move.swapSkill
    }))
  }, [board.width, bounds.width, moves])

  return (
    <div
      className="good-move-overlay"
      style={{
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`
      }}
    >
      {contents.map(({ x, y, icon, direction, swapSkill }) => (
        <div
          className={classNames(`move is-${direction}`, {
            'is-swap': swapSkill
          })}
          style={{ left: `${x}px`, top: `${y}px` }}
          key={`${x}-${y}-${direction}`}
        >
          <span className="icon">
            <i className={`fas fa-2x fa-${icon}`} />
          </span>
        </div>
      ))}
    </div>
  )
}
