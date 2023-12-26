import { Kind, Piece, type Position } from '@sweethomemaid/logic'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import { InferenceSession, Tensor } from 'onnxruntime-web'
import { useCallback } from 'react'
import { useApp } from '../app/use-app'
import modelUrl from '../assets/piece_classifier.onnx'
import presets, { type StageName } from '../presets'

const IMAGE_SIZE = 64
const MEAN = [0.57665089, 0.5822121, 0.54763596]
const STD = [0.18085433, 0.21391266, 0.23309964]

type Bounds = [number, number, number, number]

export function useDetect(): (
  image: HTMLImageElement,
  bounds: Bounds
) => Promise<void> {
  const { board, stage, dispatch } = useApp()
  return useCallback(
    async (image, bounds) => {
      for await (const [position, piece] of detectPieces(
        image,
        bounds,
        board.width,
        board.height,
        getPieceMask(stage)
      )) {
        if (board.piece(position).face !== Kind.Out) {
          board.setPiece(position, piece)
        }
      }
      dispatch({ type: 'reset' })
    },
    [board, stage, dispatch]
  )
}

async function* detectPieces(
  image: HTMLImageElement,
  bounds: Bounds,
  width: number,
  height: number,
  pieceMask: boolean[]
): AsyncGenerator<[Position, Piece]> {
  const session = await InferenceSession.create(modelUrl, {
    executionProviders: ['webgl']
  })
  try {
    for (const [position, input] of inputTensors(
      image,
      bounds,
      width,
      height
    )) {
      const feeds: Record<string, Tensor> = {}
      feeds[session.inputNames[0]] = input
      const outputData = await session.run(feeds)
      const output = outputData[session.outputNames[0]]
      const index = argmax(output.data as Float32Array, pieceMask)
      yield [position, PIECE_FOR_INDEX[index]]
    }
  } finally {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(session as any).handler.dispose()
    } catch (e) {}
  }
}

function argmax(data: Float32Array, pieceMask: boolean[]): number {
  let max = -Infinity
  let index = 0
  data.forEach((value, i) => {
    if (pieceMask[i] && value > max) {
      max = value
      index = i
    }
  })
  return index
}

function* inputTensors(
  image: HTMLImageElement,
  bounds: Bounds,
  width: number,
  height: number
): Generator<[Position, Tensor]> {
  const canvas = document.getElementById('capture-canvas')
  if (canvas === null) throw Error('capture/Canvas must be in document')
  const ctx = (canvas as HTMLCanvasElement).getContext('2d', {
    willReadFrequently: true
  })
  if (ctx === null) throw Error('no canvas context')

  const pieceWidth = Math.floor(bounds[2] / width)
  const pieceHeight = Math.floor(bounds[3] / height)

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      ctx.drawImage(
        image,
        bounds[0] + x * pieceWidth,
        bounds[1] + y * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        IMAGE_SIZE,
        IMAGE_SIZE
      )
      const { data } = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)

      const raw = ndarray(new Float32Array(data), [IMAGE_SIZE, IMAGE_SIZE, 4])
      const processed = ndarray(new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3), [
        1,
        3,
        IMAGE_SIZE,
        IMAGE_SIZE
      ])
      ops.assign(processed.pick(0, 0, null, null), raw.pick(null, null, 0))
      ops.assign(processed.pick(0, 1, null, null), raw.pick(null, null, 1))
      ops.assign(processed.pick(0, 2, null, null), raw.pick(null, null, 2))
      ops.divseq(processed, 255)
      ops.subseq(processed.pick(0, 0, null, null), MEAN[0])
      ops.subseq(processed.pick(0, 1, null, null), MEAN[1])
      ops.subseq(processed.pick(0, 2, null, null), MEAN[2])
      ops.divseq(processed.pick(0, 0, null, null), STD[0])
      ops.divseq(processed.pick(0, 1, null, null), STD[1])
      ops.divseq(processed.pick(0, 2, null, null), STD[2])
      const tensor = new Tensor('float32', processed.data, [
        1,
        3,
        IMAGE_SIZE,
        IMAGE_SIZE
      ])

      yield [[x + 1, y + 1], tensor]
    }
  }
}

const PIECE_FOR_INDEX = [
  new Piece(Kind.Aqua, 0),
  new Piece(Kind.Aqua, 0, 0, 1),
  new Piece(Kind.Aqua, 0, 0, 2),
  new Piece(Kind.Aqua, 0, 0, 3),
  new Piece(Kind.Bomb),
  new Piece(Kind.Blue, 0),
  new Piece(Kind.Blue, 1),
  new Piece(Kind.Blue, 2),
  new Piece(Kind.Blue, 3),
  new Piece(Kind.Blue, 4),
  new Piece(Kind.Blue, 5),
  new Piece(Kind.Blue, 6),
  new Piece(Kind.Blue, 0, 1),
  new Piece(Kind.Blue, 0, 2),
  new Piece(Kind.Blue, 0, 3),
  new Piece(Kind.Blue, 0, 0, 1),
  new Piece(Kind.Blue, 0, 0, 2),
  new Piece(Kind.Blue, 0, 0, 3),
  new Piece(Kind.Empty),
  new Piece(Kind.Green, 0),
  new Piece(Kind.Green, 1),
  new Piece(Kind.Green, 2),
  new Piece(Kind.Green, 3),
  new Piece(Kind.Green, 4),
  new Piece(Kind.Green, 5),
  new Piece(Kind.Green, 6),
  new Piece(Kind.Green, 0, 0, 1),
  new Piece(Kind.Green, 0, 0, 2),
  new Piece(Kind.Green, 0, 0, 3),
  new Piece(Kind.Missile),
  new Piece({ kind: Kind.Mouse, count: 1 }),
  new Piece({ kind: Kind.Mouse, count: 2 }),
  new Piece({ kind: Kind.Mouse, count: 3 }),
  new Piece(Kind.Special),
  new Piece(Kind.Pink, 0),
  new Piece(Kind.Pink, 0, 1),
  new Piece(Kind.Pink, 0, 2),
  new Piece(Kind.Pink, 0, 3),
  new Piece(Kind.Pink, 0, 0, 1),
  new Piece(Kind.Pink, 0, 0, 2),
  new Piece(Kind.Pink, 0, 0, 3),
  new Piece({ kind: Kind.Present, count: 1 }),
  new Piece({ kind: Kind.Present, count: 2 }),
  new Piece({ kind: Kind.Present, count: 3 }),
  new Piece({ kind: Kind.Present, count: 4 }),
  new Piece({ kind: Kind.Present, count: 5 }),
  new Piece(Kind.Red, 0),
  new Piece(Kind.Red, 1),
  new Piece(Kind.Red, 2),
  new Piece(Kind.Red, 3),
  new Piece(Kind.Red, 4),
  new Piece(Kind.Red, 5),
  new Piece(Kind.Red, 6),
  new Piece(Kind.Red, 0, 1),
  new Piece(Kind.Red, 0, 2),
  new Piece(Kind.Red, 0, 3),
  new Piece(Kind.HRocket),
  new Piece(Kind.VRocket),
  new Piece({ kind: Kind.Wood, count: 1 }),
  new Piece({ kind: Kind.Wood, count: 2 }),
  new Piece({ kind: Kind.Wood, count: 3 }),
  new Piece(Kind.Yellow, 0),
  new Piece(Kind.Yellow, 1),
  new Piece(Kind.Yellow, 2),
  new Piece(Kind.Yellow, 3),
  new Piece(Kind.Yellow, 4),
  new Piece(Kind.Yellow, 5),
  new Piece(Kind.Yellow, 6),
  new Piece(Kind.Yellow, 0, 1),
  new Piece(Kind.Yellow, 0, 2),
  new Piece(Kind.Yellow, 0, 3)
]

function getPieceMask(stage: StageName): boolean[] {
  const preset = presets[stage]

  const kinds = new Set<Kind>([
    Kind.Special,
    Kind.Bomb,
    Kind.HRocket,
    Kind.VRocket,
    Kind.Missile,
    Kind.Empty
  ])

  const colors = preset.colors ?? ''
  for (const [token, color] of [
    ['r', Kind.Red],
    ['b', Kind.Blue],
    ['g', Kind.Green],
    ['y', Kind.Yellow],
    ['a', Kind.Aqua],
    ['p', Kind.Pink]
  ] as const) {
    if (colors.includes(token)) {
      kinds.add(color)
    }
  }

  for (const [prop, obstacle] of [
    ['mice', Kind.Mouse],
    ['woods', Kind.Wood],
    ['presents', Kind.Present]
  ] as const) {
    if (prop in preset) {
      kinds.add(obstacle)
    }
  }

  const ice = 'ices' in preset
  const chain = 'chains' in preset
  const jelly = 'jellies' in preset

  return PIECE_FOR_INDEX.map(piece => {
    if (!kinds.has(piece.kind)) return false
    if (!ice && piece.ice > 0) return false
    if (!chain && piece.chain > 0) return false
    if (!jelly && piece.jelly > 0) return false
    return true
  })
}
