import {
  Direction,
  serialize,
  type GoodMoves,
  type Move
} from '@sweethomemaid/logic'
import classNames from 'classnames'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useApp } from '../app/use-app'
import bombImage from '../assets/piece-images/b.png'
import rocketImage from '../assets/piece-images/rh.png'

import specialImage from '../assets/piece-images/n.png'
import './GoodMove.css'

const CONDITION_NAMES: Array<[string, ReactNode]> = [
  [
    'hasSpecialCombo',
    <>
      <img src={specialImage} width="20" /> ➕
    </>
  ],
  ['hasSpecial', <img src={specialImage} width="20" />],
  [
    'hasBombCombo',
    <>
      <img src={bombImage} width="20" /> ➕
    </>
  ],
  ['hasBomb', <img src={bombImage} width="20" />],
  ['hasRocket', <img src={rocketImage} width="20" />]
]

export default function GoodMove(): ReactNode {
  const [goodMoves, setGoodMoves] = useState<GoodMoves>({})
  const { board, histories, historyIndex, isPlaying, useSwapSkill } = useApp()
  useEffect(() => {
    setGoodMoves({})
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    })
    worker.onmessage = event => {
      setGoodMoves(event.data)
    }
    worker.postMessage({ board: serialize(board), useSwapSkill })

    return () => {
      worker.terminate()
    }
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
        <div className="head">指手予想</div>
        {[1, 2].map(
          step =>
            step in goodMoves && (
              <div className="step" key={step}>
                <div className="num">
                  <span className="icon">
                    <i className="fas fa-hand" />
                  </span>
                  {step}
                </div>
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

  const cssVars = {
    '--unit': `${bounds.width / board.width}px`
  }

  return (
    <div
      className="good-move-overlay"
      style={{
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        ...cssVars
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
