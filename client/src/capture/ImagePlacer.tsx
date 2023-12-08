import { useDrag, useGesture } from '@use-gesture/react'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import * as cache from '../cache'
import './ImagePlacer.css'
import { useBodySize } from './use-body-size'
import { useCapture } from './use-capture'
import { useDetect } from './use-detect'

type Bounds = [number, number, number, number]

const BOUNDS_CACHE_KEY = 'ImagePlacer.bounds'

export default function ImagePlacer({
  image
}: {
  image: HTMLImageElement
}): ReactNode {
  const { dispatch } = useCapture()
  const [pageWidth, pageHeight] = useBodySize()
  const [bounds, setBounds] = useState<Bounds>(() => {
    const cached = cache.get<Bounds>(BOUNDS_CACHE_KEY)
    if (cached !== undefined) return cached

    const width = Math.min(640, pageWidth - 20)
    const height = width * (image.naturalHeight / image.naturalWidth)
    const left = pageWidth / 2 - width / 2
    const top = 100 + pageHeight / 2 - height / 2
    return [left, top, width, height]
  })

  const cancel = useCallback(() => {
    dispatch({ type: 'setImage', image: undefined })
  }, [dispatch])

  const detect = useDetect()
  const submit = useCallback(() => {
    ;(async () => {
      const board = document
        .querySelector('.board-view')
        ?.getBoundingClientRect()
      const img = document
        .querySelector('.image-placer .img')
        ?.getBoundingClientRect()
      if (board === undefined || img === undefined) return

      cache.set(BOUNDS_CACHE_KEY, bounds)

      const ratio = image.naturalWidth / img.width
      await detect(image, [
        Math.floor((board.x - img.x) * ratio),
        Math.floor((board.y - img.y) * ratio),
        Math.floor(board.width * ratio),
        Math.floor(board.height * ratio)
      ])
      dispatch({ type: 'setImage', image: undefined })
    })().catch(() => {
      toast.error('盤面の認識に失敗しました')
    })
  }, [image, detect, dispatch, bounds])

  return (
    <div className="image-placer" style={{ height: `${pageHeight}px` }}>
      <div className="operations">
        <div className="text">盤面の位置と大きさを揃えてください</div>
        <div className="buttons">
          <button className="button is-small is-info" onClick={submit}>
            完了
          </button>
          <button className="button is-small" onClick={cancel}>
            キャンセル
          </button>
        </div>
      </div>
      <Bound value={bounds} onChange={setBounds}>
        <div className="img" ref={ref => ref?.appendChild(image)} />
      </Bound>
    </div>
  )
}

const MIN_SIZE = 30

function Bound({
  value,
  onChange,
  children
}: {
  value: Bounds
  onChange: (bounds: Bounds) => void
  children: ReactNode
}): ReactNode {
  const gestureElRef = useRef(null)
  const [lastScale, setLastScale] = useState(1)

  useGesture(
    {
      onDrag: ({ pinching, delta }) => {
        if (pinching === true) return
        onChange([value[0] + delta[0], value[1] + delta[1], value[2], value[3]])
      },
      onPinch: ({ origin, offset: [scale] }) => {
        const stepScale = scale / lastScale
        setLastScale(scale)

        const width = value[2] * stepScale
        const height = value[3] * stepScale
        if (width < MIN_SIZE || height < MIN_SIZE) return

        onChange([
          origin[0] - (origin[0] - value[0]) * stepScale,
          origin[1] - (origin[1] - value[1]) * stepScale,
          width,
          height
        ])
      }
    },
    { target: gestureElRef }
  )

  return (
    <div
      className="bound"
      style={{
        left: `${value[0]}px`,
        top: `${value[1]}px`,
        width: `${value[2]}px`,
        height: `${value[3]}px`
      }}
    >
      {children}
      <div className="move-handle" ref={gestureElRef} />
      <ResizeHandle position="lt" value={value} onChange={onChange} />
      <ResizeHandle position="lb" value={value} onChange={onChange} />
      <ResizeHandle position="rt" value={value} onChange={onChange} />
      <ResizeHandle position="rb" value={value} onChange={onChange} />
    </div>
  )
}

function ResizeHandle({
  position,
  value,
  onChange
}: {
  position: 'lt' | 'lb' | 'rt' | 'rb'
  value: Bounds
  onChange: (bounds: Bounds) => void
}): ReactNode {
  const bind = useDrag(({ delta }) => {
    let [dx, dy] = delta
    if (position === 'lt' || position === 'lb') dx = -dx
    if (position === 'lt' || position === 'rt') dy = -dy

    const aspectRatio = value[3] / value[2]
    const move = Math.abs(dx) * aspectRatio > Math.abs(dy) ? dx : dy
    const width = value[2] + move
    const height = value[3] + move * aspectRatio
    if (width < MIN_SIZE || height < MIN_SIZE) return

    let [x, y] = value
    if (position === 'lt' || position === 'lb') x -= move
    if (position === 'lt' || position === 'rt') y -= move * aspectRatio
    onChange([x, y, width, height])
  })
  return <div className={`resize-handle is-${position}`} {...bind()} />
}
