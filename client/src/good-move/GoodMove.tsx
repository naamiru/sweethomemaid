import {
  Direction,
  Skill,
  serialize,
  type GoodMoves,
  type Move
} from '@sweethomemaid/logic'
import classNames from 'classnames'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useApp } from '../app/use-app'
import bombImage from '../assets/piece-images/b.png'
import missileImage from '../assets/piece-images/m.png'
import specialImage from '../assets/piece-images/n.png'
import hRocketImage from '../assets/piece-images/rh.png'
import vRocketImage from '../assets/piece-images/rv.png'

import crossRocketsImage from '../assets/skills/himariko_bath.png'
import hRocketSkillImage from '../assets/skills/himariko_newyear.png'
import swapImage from '../assets/skills/iroha_bunny.png'
import pieceBreakImage from '../assets/skills/iroha_choco.png'
import missileSkillImage from '../assets/skills/iroha_ekiben.png'
import vRocketSkillImage from '../assets/skills/kanon_easter.png'
import mixMissileSkillImage from '../assets/skills/nagi_bunny.png'
import h3RocketsImage from '../assets/skills/nia_bath.png'
import bombSkillImage from '../assets/skills/scarlet_bunny.png'
import delColorImage from '../assets/skills/tsumugi_bunny.png'

import './GoodMove.css'

const CONDITION_NAMES: Array<[string, ReactNode]> = [
  [
    'hasSpecialSpecial',
    <>
      <img src={specialImage} width="20" />
      <img src={specialImage} width="20" />
    </>
  ],
  [
    'hasSpecialBomb',
    <>
      <img src={specialImage} width="20" />
      <img src={bombImage} width="20" />
    </>
  ],
  [
    'hasSpecialRocket',
    <>
      <img src={specialImage} width="20" />
      <img src={hRocketImage} width="20" />
    </>
  ],
  [
    'hasSpecialMissile',
    <>
      <img src={specialImage} width="20" />
      <img src={missileImage} width="20" />
    </>
  ],
  [
    'hasSpecialCombo',
    <>
      <img src={specialImage} width="20" /> ➕
    </>
  ],
  ['hasSpecial', <img src={specialImage} width="20" />],
  [
    'hasBombBomb',
    <>
      <img src={bombImage} width="20" />
      <img src={bombImage} width="20" />
    </>
  ],
  [
    'hasBombRocket',
    <>
      <img src={bombImage} width="20" />
      <img src={hRocketImage} width="20" />
    </>
  ],
  [
    'hasMissileBomb',
    <>
      <img src={bombImage} width="20" />
      <img src={missileImage} width="20" />
    </>
  ],
  [
    'hasBombCombo',
    <>
      <img src={bombImage} width="20" /> ➕
    </>
  ],
  ['hasBomb', <img src={bombImage} width="20" />],
  ['hasRocket', <img src={hRocketImage} width="20" />],
  ['hasHRocket', <img src={hRocketImage} width="20" />],
  ['hasVRocket', <img src={vRocketImage} width="20" />],
  [
    'hasMissileHRocket',
    <>
      <img src={hRocketImage} width="20" />
      <img src={missileImage} width="20" />
    </>
  ],
  [
    'hasMissileVRocket',
    <>
      <img src={vRocketImage} width="20" />
      <img src={missileImage} width="20" />
    </>
  ],
  [
    'hasMissileMissile',
    <>
      <img src={missileImage} width="20" />
      <img src={missileImage} width="20" />
    </>
  ],
  ['hasMissile', <img src={missileImage} width="20" />]
]

export default function GoodMove(): ReactNode {
  const [skills, setSkills] = useState(0)
  function toggleSkill(skill: Skill): void {
    if ((skills & skill) === 0) {
      setSkills(skills | skill)
    } else {
      setSkills(skills & ~skill)
    }
  }

  const [goodMoves, setGoodMoves] = useState<GoodMoves>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([])

  const { stage, board, histories, historyIndex, isPlaying } = useApp()
  useEffect(() => {
    setGoodMoves({})
    setIsLoading(true)
    setSelectedMoves([])
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    })
    worker.onmessage = event => {
      setGoodMoves(event.data)
      setIsLoading(false)
    }
    worker.postMessage({
      board: serialize(board),
      skills,
      isTeams: stage.startsWith('teams_2_')
    })

    return () => {
      worker.terminate()
      setIsLoading(false)
    }
  }, [stage, board, histories, historyIndex, skills])

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
        <div className="head">
          <div className="text">先読み</div>
          <button
            className={classNames('button is-white is-loading is-small', {
              'is-visible': isLoading
            })}
            disabled
          />
        </div>
        <div className="skills">
          {(
            [
              [Skill.Swap, swapImage],
              [Skill.DelColor, delColorImage],
              [Skill.Bomb, bombSkillImage],
              [Skill.MixMissile, mixMissileSkillImage],
              [Skill.Missile, missileSkillImage],
              [Skill.PieceBreak, pieceBreakImage],
              [Skill.H3Rockets, h3RocketsImage],
              [Skill.CrossRockets, crossRocketsImage],
              [Skill.HRocket, hRocketSkillImage],
              [Skill.VRocket, vRocketSkillImage]
            ] as const
          ).map(([skill, image]) => (
            <img
              src={image}
              className={classNames({
                'is-disabled': (skills & skill) === 0
              })}
              onClick={() => {
                toggleSkill(skill)
              }}
              key={skill}
            />
          ))}
        </div>
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

const SkillIconName: Record<Exclude<Skill, Skill.Swap>, string> = {
  [Skill.DelColor]: 'del-color',
  [Skill.CrossRockets]: 'cross-rockets',
  [Skill.H3Rockets]: 'h3-rockets',
  [Skill.HRocket]: 'h-rocket',
  [Skill.VRocket]: 'v-rocket',
  [Skill.PieceBreak]: 'piece-break',
  [Skill.Bomb]: 'fast-bomb',
  [Skill.MixMissile]: 'mix-missile',
  [Skill.Missile]: 'fast-missile'
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
      icon:
        move.skill !== undefined && move.skill !== Skill.Swap
          ? SkillIconName[move.skill]
          : DirectionIconName[move.direction],
      direction: DirectionName[move.direction],
      swapSkill: move.skill === Skill.Swap
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
