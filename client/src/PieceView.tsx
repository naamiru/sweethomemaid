import { animated, useSpring } from '@react-spring/web'
import {
  Direction,
  Kind,
  Move,
  Skill,
  canMove,
  isBooster,
  isColor,
  isCombo,
  type Piece,
  type Position
} from '@sweethomemaid/logic'
import { useDrag } from '@use-gesture/react'
import classNames from 'classnames'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { useDoubleTap } from 'use-double-tap'
import './PieceView.css'
import { useApp } from './app/use-app'
import { usePlayMove } from './app/use-play-move'

export default function PieceView({
  position
}: {
  position: Position
}): ReactNode {
  const {
    board,
    pieces,
    isHandlingPiece,
    isPlaying,
    swap,
    activeSkill,
    suggestedPositions,
    dispatch
  } = useApp()
  const piece = pieces[position[0]][position[1]]
  const moveSkill = activeSkill === Skill.Swap ? activeSkill : undefined

  const [isMoving, setIsMoving] = useState(false)
  const [stopTimer, setStopTimer] = useState<ReturnType<typeof setTimeout>>()
  const el = useRef<HTMLDivElement>(null)
  const [movableDirs, setMovableDirs] = useState(new Set<Direction>())
  const [comboDirs, setComboDirs] = useState(new Set<Direction>())
  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: {
      tension: 300
    }
  }))
  const playMove = usePlayMove()
  const bind = useDrag(
    ({ first, down, movement }) => {
      if (isPlaying) return

      if (first) {
        clearTimeout(stopTimer)
        setIsMoving(true)

        const dirs = [
          Direction.Up,
          Direction.Down,
          Direction.Left,
          Direction.Right
        ].filter(dir => canMove(board, new Move(position, dir, moveSkill)))
        setMovableDirs(new Set(dirs))
        setComboDirs(
          new Set(
            dirs.filter(dir =>
              isCombo(board, new Move(position, dir, moveSkill))
            )
          )
        )
      }
      if (down) {
        dispatch({ type: 'setIsHandlingPiece', value: true })
      } else {
        setStopTimer(
          setTimeout(() => {
            dispatch({ type: 'setIsHandlingPiece', value: false })
            setIsMoving(false)
          }, 500)
        )
      }

      let [x, y] = movement
      const size = el.current?.clientWidth ?? 64
      if (Math.abs(x) > Math.abs(y)) {
        y = 0
        x = Math.max(x, movableDirs.has(Direction.Left) ? -size : 0)
        x = Math.min(x, movableDirs.has(Direction.Right) ? size : 0)
      } else {
        x = 0
        y = Math.max(y, movableDirs.has(Direction.Up) ? -size : 0)
        y = Math.min(y, movableDirs.has(Direction.Down) ? size : 0)
      }

      let dir: Direction | undefined
      if (Math.abs(x + y) > size / 2) {
        if (x < 0) {
          dir = Direction.Left
        } else if (x > 0) {
          dir = Direction.Right
        } else if (y < 0) {
          dir = Direction.Up
        } else if (y > 0) {
          dir = Direction.Down
        }
      }

      if (down) {
        if (dir !== undefined && !comboDirs.has(dir)) {
          dispatch({
            type: 'setSwap',
            position: new Move(position, dir, moveSkill).positions()[1],
            triggerPosition: position
          })
        } else {
          dispatch({ type: 'setSwap' })
        }
      } else {
        dispatch({ type: 'setSwap' })
        if (dir !== undefined) {
          playMove(new Move(position, dir, moveSkill)).catch(console.error)
        }
      }

      api.start({
        x: down ? x : 0,
        y: down ? y : 0,
        immediate: down || dir !== undefined
      })
    },
    { threshold: 1 }
  )

  const [isSwapping, setIsSwapping] = useState(false)
  useEffect(() => {
    if (swap === undefined) {
      if (isSwapping) {
        setIsSwapping(false)
        api.start({ x: 0, y: 0 })
      }
    } else if (
      !isSwapping &&
      swap.position[0] === position[0] &&
      swap.position[1] === position[1]
    ) {
      setIsSwapping(true)
      const size = el.current?.clientWidth ?? 64
      api.start({
        x: (swap.triggerPosition[0] - position[0]) * size,
        y: (swap.triggerPosition[1] - position[1]) * size
      })
    }
  }, [api, swap, isSwapping, position])

  useEffect(() => {
    if (isSwapping) {
      setIsSwapping(false)
      api.start({ x: 0, y: 0, immediate: true })
    }
  }, [pieces]) // eslint-disable-line react-hooks/exhaustive-deps

  // ダブルクリックでブースター発動
  const handleDoubleTap = useCallback(() => {
    if (isMoving || isSwapping) return
    const move = new Move(position, Direction.Zero)
    if (!canMove(board, move)) return
    playMove(move).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoving, isSwapping, position, board, piece])
  // シングルタップでスキル発動
  const handleSingleTap = useCallback(() => {
    if (isMoving || isSwapping) return
    if (
      activeSkill !== Skill.CrossRockets &&
      activeSkill !== Skill.H3Rockets &&
      activeSkill !== Skill.HRocket &&
      activeSkill !== Skill.DelColor
    )
      return
    const move = new Move(position, Direction.Zero, activeSkill)
    if (!canMove(board, move)) return
    playMove(move).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSkill, isMoving, isSwapping, position, board, piece])
  const doubleTapBind = useDoubleTap(handleDoubleTap, 300, {
    onSingleTap: handleSingleTap
  })

  const isSuggested =
    suggestedPositions.has(position) &&
    !isHandlingPiece &&
    !isPlaying &&
    activeSkill === undefined
  const pieceImageRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!isSuggested) return
      const anim = el?.getAnimations()?.[0]
      if (anim === undefined) return
      const animRef = document
        .querySelector('.animation-reference')
        ?.getAnimations()?.[0]
      if (animRef === undefined) return
      anim.startTime = animRef.startTime ?? 0
      anim.currentTime = animRef.currentTime ?? 0
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSuggested, pieces]
  )

  const classes = useMemo(() => pieceClasses(piece), [piece])

  return (
    <div
      className={classNames('piece-view', {
        'is-moving': isMoving,
        'is-swapping': isSwapping
      })}
      {...doubleTapBind}
      ref={el}
    >
      <animated.div
        className={classNames('piece', { 'is-out': piece.face === Kind.Out })}
        {...bind()}
        style={{ x, y }}
      >
        <div
          className={classNames('piece-image', classes, {
            'is-suggested': isSuggested
          })}
          ref={pieceImageRef}
        />
      </animated.div>
    </div>
  )
}

function pieceClasses(piece: Piece): string[] {
  const classes = []

  if (piece.face === Kind.Unknown) {
    classes.push('is-unknown')
  } else if (isColor(piece.face)) {
    classes.push(
      'is-' +
        {
          [Kind.Red]: 'red',
          [Kind.Blue]: 'blue',
          [Kind.Green]: 'green',
          [Kind.Yellow]: 'yellow',
          [Kind.Aqua]: 'aqua',
          [Kind.Pink]: 'pink'
        }[piece.face]
    )
  } else if (isBooster(piece.face)) {
    classes.push(
      'is-' +
        {
          [Kind.Special]: 'special',
          [Kind.Bomb]: 'bomb',
          [Kind.HRocket]: 'hrocket',
          [Kind.VRocket]: 'vrocket',
          [Kind.Missile]: 'missile'
        }[piece.face]
    )
  } else if (piece.face instanceof Object) {
    if (piece.face.kind === Kind.Mikan) {
      if (piece.face.position[0] === 0 && piece.face.position[1] === 0) {
        classes.push('is-mikan')
        classes.push('is-mikan-' + String(Math.min(piece.face.count, 30)))
      }
    } else {
      classes.push(
        'is-' +
          {
            [Kind.Mouse]: 'mouse',
            [Kind.Wood]: 'wood',
            [Kind.Present]: 'present',
            [Kind.Button]: 'button'
          }[piece.face.kind] +
          '-' +
          String(piece.face.count)
      )
    }
  }

  if (piece.ice > 0) {
    classes.push('is-ice-' + String(piece.ice))
  }

  if (piece.chain >= 1) {
    classes.push('is-chain-' + String(piece.chain))
  }

  if (piece.jelly > 0) {
    classes.push('is-jelly-' + String(piece.jelly))
  }

  return classes
}
