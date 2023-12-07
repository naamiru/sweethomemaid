import { animated, useSpring } from '@react-spring/web'
import {
  Direction,
  Kind,
  Move,
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
import { useApp } from './context/use-app'
import { usePlayMove } from './play-move'

export default function PieceView({
  position
}: {
  position: Position
}): ReactNode {
  const { board, pieces, isPlaying, swap, dispatch } = useApp()
  const piece = pieces[position[0]][position[1]]

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
        ].filter(dir => canMove(board, new Move(position, dir)))
        setMovableDirs(new Set(dirs))
        setComboDirs(
          new Set(dirs.filter(dir => isCombo(board, new Move(position, dir))))
        )
      }
      if (!down) {
        setStopTimer(
          setTimeout(() => {
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
            position: new Move(position, dir).positions()[1],
            triggerPosition: position
          })
        } else {
          dispatch({ type: 'setSwap' })
        }
      } else {
        dispatch({ type: 'setSwap' })
        if (dir !== undefined) {
          playMove(new Move(position, dir)).catch(console.error)
        }
      }

      api.start({
        x: down ? x : 0,
        y: down ? y : 0,
        immediate: down || dir !== undefined
      })
    },
    { threshold: 10 }
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

  const handleDoubleTap = useCallback(() => {
    if (isMoving || isSwapping) return
    const move = new Move(position, Direction.Zero)
    if (!canMove(board, move)) return
    playMove(move).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoving, isSwapping, position, board, piece])
  const doubleTapBind = useDoubleTap(handleDoubleTap)

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
        className={classNames('piece', classes)}
        {...bind()}
        style={{ x, y }}
      />
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
    classes.push(
      'is-' +
        {
          [Kind.Mouse]: 'mouse',
          [Kind.Wood]: 'wood'
        }[piece.face.kind] +
        '-' +
        String(piece.face.count)
    )
  }

  if (piece.ice > 0) {
    classes.push('is-ice-' + String(piece.ice))
  }

  return classes
}
