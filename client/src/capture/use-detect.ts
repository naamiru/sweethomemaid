import {
  Kind,
  Piece,
  positiveDigitToken,
  type Position
} from '@sweethomemaid/logic'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import { InferenceSession, Tensor } from 'onnxruntime-web'
import { useCallback } from 'react'
import { useApp } from '../app/use-app'
import mikanClassifierUrl from '../assets/mikan_classifier.onnx'
import pieceClassifierUrl from '../assets/piece_classifier.onnx'

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

      const preset = presets[stage]
      if (preset.mikans !== undefined) {
        for await (const [position, count] of detectMikans(
          image,
          bounds,
          board.width,
          board.height,
          preset.mikans
        )) {
          for (const diff of [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1]
          ] as Array<[0 | 1, 0 | 1]>) {
            const pos: Position = [position[0] + diff[0], position[1] + diff[1]]
            board.setPiece(
              pos,
              new Piece({ kind: Kind.Mikan, count, position: diff })
            )
          }
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
  const pieceBounds: Bounds[] = []
  const pieceWidth = Math.floor(bounds[2] / width)
  const pieceHeight = Math.floor(bounds[3] / height)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      pieceBounds.push([
        bounds[0] + x * pieceWidth,
        bounds[1] + y * pieceHeight,
        pieceWidth,
        pieceHeight
      ])
    }
  }

  let i = 0
  for await (const index of classify(
    pieceClassifierUrl,
    inputTensors(image, pieceBounds, IMAGE_SIZE),
    pieceMask
  )) {
    const position: Position = [Math.floor(i / height) + 1, (i % height) + 1]
    yield [position, PIECE_FOR_INDEX[index]]
    i++
  }
}

const MIKAN_COUNT_FOR_INDEX = [0, 1, 10, 2, 20, 3, 4, 5, 6, 7, 8, 9]
const MIKAN_IMAGE_SIZE = 96

async function* detectMikans(
  image: HTMLImageElement,
  bounds: Bounds,
  width: number,
  height: number,
  mikans: string
): AsyncGenerator<[Position, number]> {
  const positions: Position[] = []
  for (const [pos] of positiveDigitToken(mikans)) {
    positions.push(pos)
  }

  const pieceBounds: Bounds[] = []
  const pieceWidth = Math.floor(bounds[2] / width)
  const pieceHeight = Math.floor(bounds[3] / height)
  for (const [x, y] of positions) {
    pieceBounds.push([
      bounds[0] + (x - 1) * pieceWidth,
      bounds[1] + (y - 1) * pieceHeight,
      pieceWidth * 2,
      pieceHeight * 2
    ])
  }

  let i = 0
  for await (const index of classify(
    mikanClassifierUrl,
    inputTensors(image, pieceBounds, MIKAN_IMAGE_SIZE)
  )) {
    const count = MIKAN_COUNT_FOR_INDEX[index]
    if (count > 0) {
      yield [positions[i], count]
    }
    i++
  }
}

async function* classify(
  modelUrl: string,
  inputs: Iterable<Tensor>,
  mask: boolean[] | undefined = undefined
): AsyncGenerator<number> {
  const session = await InferenceSession.create(modelUrl, {
    executionProviders: ['webgl']
  })
  try {
    for (const input of inputs) {
      const feeds: Record<string, Tensor> = {}
      feeds[session.inputNames[0]] = input
      const outputData = await session.run(feeds)
      const output = outputData[session.outputNames[0]]
      yield argmax(output.data as Float32Array, mask)
    }
  } finally {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(session as any).handler.dispose()
    } catch (e) {}
  }
}

function argmax(
  data: Float32Array,
  mask: boolean[] | undefined = undefined
): number {
  let max = -Infinity
  let index = 0
  data.forEach((value, i) => {
    if ((mask === undefined || mask[i]) && value > max) {
      max = value
      index = i
    }
  })
  return index
}

function* inputTensors(
  image: HTMLImageElement,
  bounds: Bounds[],
  size: number
): Generator<Tensor> {
  const el = document.getElementById('capture-canvas')
  if (el === null) throw Error('capture/Canvas must be in document')
  const canvas = el as HTMLCanvasElement
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true
  })
  if (ctx === null) throw Error('no canvas context')

  for (const b of bounds) {
    ctx.drawImage(image, b[0], b[1], b[2], b[3], 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)

    const raw = ndarray(new Float32Array(data), [size, size, 4])
    const processed = ndarray(new Float32Array(size * size * 3), [
      1,
      3,
      size,
      size
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
    const tensor = new Tensor('float32', processed.data, [1, 3, size, size])

    yield tensor
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
