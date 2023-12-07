import { Kind, Piece, type Position } from '@sweethomemaid/logic'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import { InferenceSession, Tensor } from 'onnxruntime-web'
import { useCallback } from 'react'
import { useApp } from '../context/use-app'

const SS_URL = 'http://localhost:5174/'
const MODEL_URL = '/models/piece_classifier.onnx'

const IMAGE_SIZE = 64
const MEAN = [0.57665089, 0.5822121, 0.54763596]
const STD = [0.18085433, 0.21391266, 0.23309964]

export function useCapture(): () => Promise<void> {
  const { board, dispatch } = useApp()
  return useCallback(async () => {
    const img = await loadImage(SS_URL + `${board.width}x${board.height}`)
    for await (const [position, piece] of detectPieces(
      img,
      board.width,
      board.height
    )) {
      if (board.piece(position).face !== Kind.Out) {
        board.setPiece(position, piece)
      }
    }
    dispatch({ type: 'reset' })
  }, [board, dispatch])
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('fail to fetch image')
  const img = new Image()
  img.src = URL.createObjectURL(await res.blob())
  return await new Promise(resolve => {
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img)
    }
  })
}

async function* detectPieces(
  img: HTMLImageElement,
  width: number,
  height: number
): AsyncGenerator<[Position, Piece]> {
  const session = await InferenceSession.create(MODEL_URL, {
    executionProviders: ['webgl']
  })
  for (const [position, input] of inputTensors(img, width, height)) {
    const feeds: Record<string, Tensor> = {}
    feeds[session.inputNames[0]] = input
    const outputData = await session.run(feeds)
    const output = outputData[session.outputNames[0]]
    const index = argmax(output.data as Float32Array)
    yield [position, PIECE_FOR_INDEX[index]]
  }
}

function argmax(data: Float32Array): number {
  let max = -Infinity
  let index = 0
  data.forEach((value, i) => {
    if (value > max) {
      max = value
      index = i
    }
  })
  return index
}

function* inputTensors(
  img: HTMLImageElement,
  width: number,
  height: number
): Generator<[Position, Tensor]> {
  const canvas = document.getElementById('capture-canvas')
  if (canvas === null) throw Error('capture/Canvas must be in document')
  const ctx = (canvas as HTMLCanvasElement).getContext('2d')
  if (ctx === null) throw Error('no canvas context')

  const pieceWidth = Math.floor(img.naturalWidth / width)
  const pieceHeight = Math.floor(img.naturalHeight / height)

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      ctx.drawImage(
        img,
        x * pieceWidth,
        y * pieceHeight,
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
  new Piece(Kind.Bomb),
  new Piece(Kind.Blue, 0),
  new Piece(Kind.Blue, 1),
  new Piece(Kind.Blue, 2),
  new Piece(Kind.Blue, 3),
  new Piece(Kind.Blue, 4),
  new Piece(Kind.Blue, 5),
  new Piece(Kind.Blue, 6),
  new Piece(Kind.Green, 0),
  new Piece(Kind.Green, 1),
  new Piece(Kind.Green, 2),
  new Piece(Kind.Green, 3),
  new Piece(Kind.Green, 4),
  new Piece(Kind.Green, 5),
  new Piece(Kind.Green, 6),
  new Piece(Kind.Missile),
  new Piece({ kind: Kind.Mouse, count: 1 }),
  new Piece({ kind: Kind.Mouse, count: 2 }),
  new Piece({ kind: Kind.Mouse, count: 3 }),
  new Piece(Kind.Special),
  new Piece(Kind.Pink, 0),
  new Piece(Kind.Red, 0),
  new Piece(Kind.Red, 1),
  new Piece(Kind.Red, 2),
  new Piece(Kind.Red, 3),
  new Piece(Kind.Red, 4),
  new Piece(Kind.Red, 5),
  new Piece(Kind.Red, 6),
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
  new Piece(Kind.Yellow, 6)
]
