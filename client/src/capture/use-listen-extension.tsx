import { useEffect, useState } from 'react'
import { useApp } from '../app/use-app'
import { useDetect } from './use-detect'

type CaptureEvent = CustomEvent<{
  image: string
  devicePixelRatio: number
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
}>

type ExtensionEventMap = {
  'shm-capture': CaptureEvent
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Document {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    addEventListener<K extends keyof ExtensionEventMap>(
      type: K,
      listener: (this: Document, ev: ExtensionEventMap[K]) => void
    ): void
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    removeEventListener<K extends keyof ExtensionEventMap>(
      type: K,
      listener: (this: Document, ev: ExtensionEventMap[K]) => void
    ): void
  }
}

export function useListenExtension(): boolean {
  const [isLoading, setIsLoading] = useState(false)

  const { board } = useApp()
  const detect = useDetect()
  useEffect(() => {
    const handleCapture = ({
      detail: { image, devicePixelRatio, rect }
    }: CaptureEvent): void => {
      setIsLoading(true)
      ;(async () => {
        const img = await loadImage(image)
        await detect(
          img,
          getBounds(devicePixelRatio, rect, board.width, board.height)
        )
      })()
        .catch(console.error)
        .finally(() => {
          setIsLoading(false)
        })
    }
    document.addEventListener('shm-capture', handleCapture)
    return () => {
      document.removeEventListener('shm-capture', handleCapture)
    }
  }, [board, detect])

  return isLoading
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = e => {
      reject(e)
    }
    img.src = dataUrl
  })
}

function getBounds(
  devicePixelRatio: number,
  rect: {
    x: number
    y: number
  },
  width: number,
  height: number
): [number, number, number, number] {
  // 盤面中央位置（devicePixelRatio=1 換算）
  const center = {
    x:
      rect.x + // ゲームエリア左座標
      7 + // ゲームエリア左マージン
      310 + // 9x9 盤面左座標
      660 / 2, // 9x9 盤面幅 / 2
    y:
      rect.y + // ゲームエリア左座標
      7 + // ゲームエリア上マージン
      30 + // 9x9 盤面上座標
      660 / 2 // 9x9 盤面高さ / 2
  }
  // 1ピースのサイズpx（devicePixelRatio=1 換算）
  const pieceSize = 660 / 9

  let boardWidth = pieceSize * Math.min(width, 9)
  let boardHeight = (boardWidth / width) * height
  if (height > 9 && height > width) {
    boardHeight = pieceSize * Math.min(height, 9)
    boardWidth = (boardHeight / height) * width
  }

  return [
    (center.x - boardWidth / 2) * devicePixelRatio,
    (center.y - boardHeight / 2) * devicePixelRatio,
    boardWidth * devicePixelRatio,
    boardHeight * devicePixelRatio
  ]
}
