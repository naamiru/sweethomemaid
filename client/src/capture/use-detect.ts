import {
  Kind,
  createCell,
  createPiece,
  getKind,
  positiveDigitToken,
  type BoardConfig,
  type Cell,
  type Piece,
  type Position
} from '@sweethomemaid/logic'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import { InferenceSession, Tensor } from 'onnxruntime-web'
import { useCallback } from 'react'
import { useApp } from '../app/use-app'
import mikanClassifierUrl from '../assets/mikan_classifier.onnx'
import pieceClassifierUrl from '../assets/piece_classifier.onnx'
import printerClassifierUrl from '../assets/printer_classifier.onnx'

import { getStageConfig } from '../stages'

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
      const config = await getStageConfig(stage)

      for await (const [position, piece, cell] of detectPieces(
        image,
        bounds,
        board.width,
        board.height,
        getPieceMask(config)
      )) {
        if (board.piece(position).face !== Kind.Out) {
          board.setPiece(position, piece)
          board.setCell(position, cell)
        }
      }

      if (config.mikans !== undefined) {
        for await (const [position, count] of detectMikans(
          image,
          bounds,
          board.width,
          board.height,
          config.mikans
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
              createPiece({ kind: Kind.Mikan, count, position: diff })
            )
          }
        }
      }

      if (config.printers !== undefined) {
        for await (const position of detectPrinters(
          image,
          bounds,
          board.width,
          board.height,
          config.printers
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
              createPiece({ kind: Kind.Printer, position: diff })
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
): AsyncGenerator<[Position, Piece, Cell]> {
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
    const piece = JSON.parse(JSON.stringify(PIECE_FOR_INDEX[index])) as
      | Piece
      | [Piece, Cell]
    if (piece instanceof Array) {
      yield [position, ...piece]
    } else {
      yield [position, piece, createCell()]
    }
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

const PRINTER_COUNT_FOR_INDEX = [0, 1]
const PRINTER_IMAGE_SIZE = 32

async function* detectPrinters(
  image: HTMLImageElement,
  bounds: Bounds,
  width: number,
  height: number,
  printers: string
): AsyncGenerator<Position> {
  const positions: Position[] = []
  for (const [pos] of positiveDigitToken(printers)) {
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
    printerClassifierUrl,
    inputTensors(image, pieceBounds, PRINTER_IMAGE_SIZE)
  )) {
    const count = PRINTER_COUNT_FOR_INDEX[index]
    if (count > 0) {
      yield positions[i]
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

const PIECE_FOR_INDEX: Array<Piece | [Piece, Cell]> = [
  createPiece(Kind.Aqua),
  createPiece(Kind.Aqua, 0, 0, 1),
  createPiece(Kind.Aqua, 0, 0, 2),
  createPiece(Kind.Aqua, 0, 0, 3),
  [createPiece(Kind.Aqua), createCell(1)],
  [createPiece(Kind.Aqua), createCell(2)],
  [createPiece(Kind.Aqua), createCell(3)],
  createPiece(Kind.Bomb),
  createPiece(Kind.Blue, 0),
  createPiece(Kind.Blue, 1),
  createPiece(Kind.Blue, 2),
  createPiece(Kind.Blue, 3),
  createPiece(Kind.Blue, 4),
  createPiece(Kind.Blue, 5),
  createPiece(Kind.Blue, 6),
  createPiece(Kind.Blue, 0, 1),
  createPiece(Kind.Blue, 0, 2),
  createPiece(Kind.Blue, 0, 3),
  createPiece(Kind.Blue, 0, 0, 1),
  createPiece(Kind.Blue, 0, 0, 2),
  createPiece(Kind.Blue, 0, 0, 3),
  [createPiece(Kind.Bomb), createCell(1)],
  [createPiece(Kind.Bomb), createCell(2)],
  [createPiece(Kind.Bomb), createCell(3)],
  createPiece({ kind: Kind.Bubble, color: 'blue', count: 1 }),
  createPiece({ kind: Kind.Bubble, color: 'blue', count: 2 }),
  createPiece({ kind: Kind.Bubble, color: 'red', count: 1 }),
  createPiece({ kind: Kind.Bubble, color: 'red', count: 2 }),
  createPiece({ kind: Kind.Button, count: 1 }),
  createPiece({ kind: Kind.Button, count: 2 }),
  createPiece({ kind: Kind.Button, count: 3 }),
  createPiece(Kind.Cat),
  createPiece(Kind.Empty),
  createPiece(Kind.Green, 0),
  createPiece(Kind.Green, 1),
  createPiece(Kind.Green, 2),
  createPiece(Kind.Green, 3),
  createPiece(Kind.Green, 4),
  createPiece(Kind.Green, 5),
  createPiece(Kind.Green, 6),
  createPiece(Kind.Green, 0, 0, 1),
  createPiece(Kind.Green, 0, 0, 2),
  createPiece(Kind.Green, 0, 0, 3),
  [createPiece(Kind.Green), createCell(1)],
  [createPiece(Kind.Green), createCell(2)],
  [createPiece(Kind.Green), createCell(3)],
  createPiece(Kind.Missile),
  createPiece(Kind.Missile, 0, 0, 1),
  createPiece(Kind.Missile, 0, 0, 2),
  createPiece(Kind.Missile, 0, 0, 3),
  [createPiece(Kind.Missile), createCell(1)],
  [createPiece(Kind.Missile), createCell(2)],
  [createPiece(Kind.Missile), createCell(3)],
  createPiece({ kind: Kind.Mouse, count: 1 }),
  createPiece({ kind: Kind.Mouse, count: 2 }),
  createPiece({ kind: Kind.Mouse, count: 3 }),
  createPiece(Kind.Special),
  [createPiece(Kind.Special), createCell(1)],
  [createPiece(Kind.Special), createCell(2)],
  [createPiece(Kind.Special), createCell(3)],
  createPiece(Kind.Pink, 0),
  createPiece(Kind.Pink, 1),
  createPiece(Kind.Pink, 2),
  createPiece(Kind.Pink, 3),
  createPiece(Kind.Pink, 0, 1),
  createPiece(Kind.Pink, 0, 2),
  createPiece(Kind.Pink, 0, 3),
  createPiece(Kind.Pink, 0, 0, 1),
  createPiece(Kind.Pink, 0, 0, 2),
  createPiece(Kind.Pink, 0, 0, 3),
  [createPiece(Kind.Pink), createCell(1)],
  [createPiece(Kind.Pink), createCell(2)],
  [createPiece(Kind.Pink), createCell(3)],
  createPiece({ kind: Kind.Present, count: 1 }),
  createPiece({ kind: Kind.Present, count: 2 }),
  createPiece({ kind: Kind.Present, count: 3 }),
  createPiece({ kind: Kind.Present, count: 4 }),
  createPiece({ kind: Kind.Present, count: 5 }),
  createPiece(Kind.Red, 0),
  createPiece(Kind.Red, 1),
  createPiece(Kind.Red, 2),
  createPiece(Kind.Red, 3),
  createPiece(Kind.Red, 4),
  createPiece(Kind.Red, 5),
  createPiece(Kind.Red, 6),
  createPiece(Kind.Red, 0, 1),
  createPiece(Kind.Red, 0, 2),
  createPiece(Kind.Red, 0, 3),
  [createPiece(Kind.Red), createCell(1)],
  [createPiece(Kind.Red), createCell(2)],
  [createPiece(Kind.Red), createCell(3)],
  createPiece(Kind.HRocket),
  [createPiece(Kind.HRocket), createCell(1)],
  [createPiece(Kind.HRocket), createCell(2)],
  [createPiece(Kind.HRocket), createCell(3)],
  createPiece(Kind.VRocket),
  createPiece(Kind.VRocket, 0, 0, 1),
  createPiece(Kind.VRocket, 0, 0, 2),
  [createPiece(Kind.VRocket), createCell(1)],
  [createPiece(Kind.VRocket), createCell(2)],
  [createPiece(Kind.VRocket), createCell(3)],
  createPiece({ kind: Kind.Wood, count: 1 }),
  createPiece({ kind: Kind.Wood, count: 2 }),
  createPiece({ kind: Kind.Wood, count: 3 }),
  createPiece(Kind.Yellow, 0),
  createPiece(Kind.Yellow, 1),
  createPiece(Kind.Yellow, 2),
  createPiece(Kind.Yellow, 3),
  createPiece(Kind.Yellow, 4),
  createPiece(Kind.Yellow, 5),
  createPiece(Kind.Yellow, 6),
  createPiece(Kind.Yellow, 0, 1),
  createPiece(Kind.Yellow, 0, 2),
  createPiece(Kind.Yellow, 0, 3),
  createPiece(Kind.Yellow, 0, 0, 1),
  createPiece(Kind.Yellow, 0, 0, 2),
  createPiece(Kind.Yellow, 0, 0, 3)
]

function getPieceMask(config: BoardConfig): boolean[] {
  const kinds = new Set<Kind>([
    Kind.Special,
    Kind.Bomb,
    Kind.HRocket,
    Kind.VRocket,
    Kind.Missile,
    Kind.Empty
  ])

  const colors = config.colors ?? ''
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
    ['presents', Kind.Present],
    ['buttons', Kind.Button],
    ['bubbles', Kind.Bubble],
    ['printers', Kind.Cat]
  ] as const) {
    if (prop in config) {
      kinds.add(obstacle)
    }
  }

  const ice = 'ices' in config
  const chain = 'chains' in config
  const jelly = 'jellies' in config
  const web = 'webs' in config

  return PIECE_FOR_INDEX.map(piece => {
    let cell: Cell | undefined
    if (piece instanceof Array) {
      cell = piece[1]
      piece = piece[0]
    }
    if (!kinds.has(getKind(piece.face))) return false
    if (!ice && piece.ice > 0) return false
    if (!chain && piece.chain > 0) return false
    if (!jelly && piece.jelly > 0) return false
    if (!web && (cell?.web ?? 0) > 0) return false
    return true
  })
}
